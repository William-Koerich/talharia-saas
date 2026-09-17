"use server";

import { getSessaoAtual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { AcaoFila, Referencia } from "@/lib/apontamento/tipos";

export async function buscarReferenciaApontamento(): Promise<
  Referencia | { erro: string }
> {
  const sessao = await getSessaoAtual();
  if (!sessao) return { erro: "Sessão inválida." };

  const supabase = await createClient();

  const [maquinasRes, operacoesRes, motivosRes, pinsRes, osRes] =
    await Promise.all([
      supabase
        .from("maquinas")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("operacoes")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("motivos_parada")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),
      supabase.rpc("listar_pins_apontamento"),
      supabase
        .from("ordens_servico")
        .select("id, numero, clientes(nome), modelo_versoes(modelos(nome))")
        .not("status", "eq", "entregue")
        .order("numero", { ascending: false })
        .limit(200),
    ]);

  return {
    maquinas: maquinasRes.data ?? [],
    operacoes: operacoesRes.data ?? [],
    motivosParada: motivosRes.data ?? [],
    pins: (
      (pinsRes.data ?? []) as {
        membership_id: string;
        nome: string;
        role: "OWNER" | "ADMIN" | "OPERADOR";
        pin_hash: string;
      }[]
    ).map((p) => ({
      membershipId: p.membership_id,
      nome: p.nome,
      role: p.role,
      pinHash: p.pin_hash,
    })),
    osAtivas: (osRes.data ?? []).map((os) => ({
      id: os.id,
      numero: os.numero,
      clienteNome:
        (os.clientes as unknown as { nome: string } | null)?.nome ?? "—",
      modeloNome:
        (
          os.modelo_versoes as unknown as {
            modelos: { nome: string } | null;
          } | null
        )?.modelos?.nome ?? "—",
    })),
    atualizadoEm: new Date().toISOString(),
  };
}

export type ResultadoSync =
  | { ok: true }
  | { ok: false; motivo: "conflito"; vencedor: "local" | "servidor" }
  | { ok: false; motivo: "erro"; mensagem: string };

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function inserirComResolucaoDeConflito(
  supabase: SupabaseClient,
  registro: {
    id: string;
    tenant_id: string;
    os_id: string;
    operacao_id: string;
    maquina_id: string;
    operador_membership_id: string;
    tipo: "produtivo" | "parada";
    motivo_parada_id?: string;
    inicio: string;
  },
): Promise<ResultadoSync> {
  const { error } = await supabase
    .from("apontamentos")
    .upsert(registro, { onConflict: "id", ignoreDuplicates: true });

  if (!error) return { ok: true };
  if (error.code !== "23505") {
    return {
      ok: false,
      motivo: "erro",
      mensagem: "Não foi possível sincronizar.",
    };
  }

  // Já existe um apontamento ativo pra esse operador: resolve por timestamp
  // do dispositivo (o mais antigo vence).
  const { data: ativoServidor } = await supabase
    .from("apontamentos")
    .select("id, inicio")
    .eq("operador_membership_id", registro.operador_membership_id)
    .is("fim", null)
    .maybeSingle();

  if (!ativoServidor) {
    const { error: erroRetentativa } = await supabase
      .from("apontamentos")
      .upsert(registro, { onConflict: "id", ignoreDuplicates: true });
    return erroRetentativa
      ? { ok: false, motivo: "erro", mensagem: "Não foi possível sincronizar." }
      : { ok: true };
  }

  if (registro.inicio < ativoServidor.inicio) {
    await supabase
      .from("apontamentos")
      .update({ fim: registro.inicio })
      .eq("id", ativoServidor.id);

    const { error: erroInsercao } = await supabase
      .from("apontamentos")
      .upsert(registro, { onConflict: "id", ignoreDuplicates: true });

    return erroInsercao
      ? { ok: false, motivo: "erro", mensagem: "Não foi possível sincronizar." }
      : { ok: true };
  }

  return { ok: false, motivo: "conflito", vencedor: "servidor" };
}

export async function sincronizarAcao(acao: AcaoFila): Promise<ResultadoSync> {
  const sessao = await getSessaoAtual();
  if (!sessao)
    return { ok: false, motivo: "erro", mensagem: "Sessão inválida." };

  const supabase = await createClient();

  switch (acao.tipo) {
    case "iniciar": {
      const { payload } = acao;
      return inserirComResolucaoDeConflito(supabase, {
        id: payload.apontamentoId,
        tenant_id: sessao.tenantId,
        os_id: payload.osId,
        operacao_id: payload.operacaoId,
        maquina_id: payload.maquinaId,
        operador_membership_id: payload.operadorMembershipId,
        tipo: "produtivo",
        inicio: acao.criadoEm,
      });
    }

    case "pausar": {
      const { payload } = acao;
      await supabase
        .from("apontamentos")
        .update({ fim: acao.criadoEm })
        .eq("id", payload.apontamentoAnteriorId);

      return inserirComResolucaoDeConflito(supabase, {
        id: payload.novoApontamentoId,
        tenant_id: sessao.tenantId,
        os_id: payload.osId,
        operacao_id: payload.operacaoId,
        maquina_id: payload.maquinaId,
        operador_membership_id: payload.operadorMembershipId,
        tipo: "parada",
        motivo_parada_id: payload.motivoParadaId,
        inicio: acao.criadoEm,
      });
    }

    case "retomar": {
      const { payload } = acao;
      await supabase
        .from("apontamentos")
        .update({ fim: acao.criadoEm })
        .eq("id", payload.apontamentoAnteriorId);

      return inserirComResolucaoDeConflito(supabase, {
        id: payload.novoApontamentoId,
        tenant_id: sessao.tenantId,
        os_id: payload.osId,
        operacao_id: payload.operacaoId,
        maquina_id: payload.maquinaId,
        operador_membership_id: payload.operadorMembershipId,
        tipo: "produtivo",
        inicio: acao.criadoEm,
      });
    }

    case "finalizar": {
      const { payload } = acao;
      const { error: erroFechar } = await supabase
        .from("apontamentos")
        .update({ fim: acao.criadoEm, qtd_produzida: payload.qtdProduzida })
        .eq("id", payload.apontamentoId);

      if (erroFechar) {
        return {
          ok: false,
          motivo: "erro",
          mensagem: "Não foi possível finalizar.",
        };
      }

      if (payload.sobraMetros && payload.sobraTipo) {
        await supabase.from("sobras").insert({
          tenant_id: sessao.tenantId,
          os_id: payload.osId,
          tipo: payload.sobraTipo,
          metros: payload.sobraMetros,
        });
      }

      return { ok: true };
    }
  }
}
