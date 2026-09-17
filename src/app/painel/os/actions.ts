"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { OS_STATUS, type OsStatus } from "@/lib/os-status";

export type EstadoForm = { erro: string | null };

export type ItemGrade = { tamanho: string; cor: string; quantidade: number };

export async function criarOS(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const clienteId = String(formData.get("cliente_id") ?? "");
  const modeloVersaoId = String(formData.get("modelo_versao_id") ?? "");
  const prazo = String(formData.get("prazo") ?? "") || null;
  const precoAcordado = formData.get("preco_acordado");
  const gradeJson = String(formData.get("grade") ?? "[]");

  if (!clienteId) return { erro: "Selecione o cliente." };
  if (!modeloVersaoId) return { erro: "Selecione o modelo." };

  let grade: ItemGrade[];
  try {
    grade = JSON.parse(gradeJson);
  } catch {
    return { erro: "Grade inválida." };
  }

  grade = grade.filter(
    (item) => item.tamanho && item.cor && item.quantidade > 0,
  );
  if (grade.length === 0)
    return { erro: "Adicione ao menos um item na grade." };

  const supabase = await createClient();
  const { data: osId, error } = await supabase.rpc("criar_os", {
    p_tenant_id: sessao.tenantId,
    p_cliente_id: clienteId,
    p_modelo_versao_id: modeloVersaoId,
    p_prazo: prazo,
    p_preco_acordado: precoAcordado ? Number(precoAcordado) : null,
    p_grade: grade,
  });

  if (error || !osId) return { erro: "Não foi possível criar a OS." };

  revalidatePath("/painel/os");
  redirect(`/painel/os/${osId}`);
}

export async function atualizarOS(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const prazo = String(formData.get("prazo") ?? "") || null;
  const precoAcordado = formData.get("preco_acordado");

  const supabase = await createClient();
  const { error } = await supabase
    .from("ordens_servico")
    .update({
      prazo,
      preco_acordado: precoAcordado ? Number(precoAcordado) : null,
    })
    .eq("id", id);

  if (error) return { erro: "Não foi possível salvar as alterações." };

  revalidatePath(`/painel/os/${id}`);
  return { erro: null };
}

export async function atualizarStatusOS(id: string, status: OsStatus) {
  await exigirGestor();
  if (!OS_STATUS.some((s) => s.value === status)) return;

  const supabase = await createClient();
  await supabase.from("ordens_servico").update({ status }).eq("id", id);
  revalidatePath("/painel/os");
  revalidatePath(`/painel/os/${id}`);
}

export async function excluirOS(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("ordens_servico").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/os?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a esta OS.")}`,
    );
  }

  revalidatePath("/painel/os");
  redirect("/painel/os");
}

export async function adicionarRolo(
  osId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const rolomodo = String(formData.get("modo") ?? "novo");
  const metrosConsumidos = Number(formData.get("metros_consumidos") ?? 0);

  if (!metrosConsumidos) return { erro: "Informe os metros consumidos." };

  const supabase = await createClient();
  let rolomId: string;

  if (rolomodo === "existente") {
    rolomId = String(formData.get("rolo_id") ?? "");
    if (!rolomId) return { erro: "Selecione o rolo." };
  } else {
    const clienteId = String(formData.get("cliente_id") ?? "") || null;
    const origem = String(formData.get("origem") ?? "proprio");
    const partida = String(formData.get("partida") ?? "").trim() || null;
    const metragem = Number(formData.get("metragem") ?? 0);
    const largura = formData.get("largura");
    const cor = String(formData.get("cor") ?? "").trim() || null;

    if (!metragem) return { erro: "Informe a metragem do rolo." };

    const { data: rolo, error: erroRolo } = await supabase
      .from("rolos")
      .insert({
        tenant_id: sessao.tenantId,
        cliente_id: clienteId,
        origem,
        partida,
        metragem,
        largura: largura ? Number(largura) : null,
        cor,
      })
      .select("id")
      .single();

    if (erroRolo || !rolo)
      return { erro: "Não foi possível cadastrar o rolo." };
    rolomId = rolo.id;
  }

  const { error } = await supabase.from("os_rolo_consumo").insert({
    tenant_id: sessao.tenantId,
    os_id: osId,
    rolo_id: rolomId,
    metros_consumidos: metrosConsumidos,
  });

  if (error) return { erro: "Não foi possível vincular o rolo à OS." };

  revalidatePath(`/painel/os/${osId}`);
  return { erro: null };
}

export async function removerRolo(osId: string, osRoloConsumoId: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("os_rolo_consumo").delete().eq("id", osRoloConsumoId);
  revalidatePath(`/painel/os/${osId}`);
}
