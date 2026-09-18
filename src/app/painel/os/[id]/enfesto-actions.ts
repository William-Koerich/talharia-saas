"use server";

import { revalidatePath } from "next/cache";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

export type ItemRoloEnfesto = { roloId: string; metrosUsados: number };

function caminho(osId: string) {
  return `/painel/os/${osId}`;
}

export async function criarEnfesto(
  osId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const folhas = Number(formData.get("folhas") ?? 0);
  const comprimento = Number(formData.get("comprimento") ?? 0);
  const rolosJson = String(formData.get("rolos") ?? "[]");

  if (!folhas) return { erro: "Informe o número de folhas." };
  if (!comprimento) return { erro: "Informe o comprimento do risco." };

  let rolos: ItemRoloEnfesto[];
  try {
    rolos = JSON.parse(rolosJson);
  } catch {
    return { erro: "Rolos inválidos." };
  }
  rolos = rolos.filter((r) => r.roloId && r.metrosUsados > 0);

  const supabase = await createClient();
  const { data: enfesto, error: erroEnfesto } = await supabase
    .from("enfestos")
    .insert({ tenant_id: sessao.tenantId, os_id: osId, folhas, comprimento })
    .select("id")
    .single();

  if (erroEnfesto || !enfesto)
    return { erro: "Não foi possível criar o enfesto." };

  if (rolos.length > 0) {
    const { error: erroRolos } = await supabase.from("enfesto_rolos").insert(
      rolos.map((r) => ({
        tenant_id: sessao.tenantId,
        enfesto_id: enfesto.id,
        rolo_id: r.roloId,
        metros_usados: r.metrosUsados,
      })),
    );
    if (erroRolos)
      return { erro: "Enfesto criado, mas não vinculou os rolos." };
  }

  revalidatePath(caminho(osId));
  return { erro: null };
}

export async function excluirEnfesto(osId: string, enfestoId: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("enfestos").delete().eq("id", enfestoId);
  revalidatePath(caminho(osId));
}

export async function criarSobra(
  osId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const enfestoId = String(formData.get("enfesto_id") ?? "") || null;
  const tipo = String(formData.get("tipo") ?? "");
  const metros = Number(formData.get("metros") ?? 0);
  const valorInformado = formData.get("valor");

  if (!["retalho", "ponta", "emenda"].includes(tipo)) {
    return { erro: "Selecione o tipo da sobra." };
  }
  if (!metros) return { erro: "Informe os metros da sobra." };

  const supabase = await createClient();

  let valor = valorInformado ? Number(valorInformado) : null;

  if (valor === null) {
    const { data: consumo } = await supabase
      .from("os_rolo_consumo")
      .select("metros_consumidos, rolos(custo_metro)")
      .eq("os_id", osId);

    const linhas = (consumo ?? []) as unknown as {
      metros_consumidos: number;
      rolos: { custo_metro: number | null } | null;
    }[];

    let somaPonderada = 0;
    let somaMetros = 0;
    for (const linha of linhas) {
      const custo = linha.rolos?.custo_metro;
      if (custo != null) {
        somaPonderada += linha.metros_consumidos * custo;
        somaMetros += linha.metros_consumidos;
      }
    }

    if (somaMetros > 0) {
      valor =
        Math.round(
          ((somaPonderada / somaMetros) * metros + Number.EPSILON) * 100,
        ) / 100;
    }
  }

  const { error } = await supabase.from("sobras").insert({
    tenant_id: sessao.tenantId,
    os_id: osId,
    enfesto_id: enfestoId,
    tipo,
    metros,
    valor,
  });

  if (error) return { erro: "Não foi possível registrar a sobra." };

  revalidatePath(caminho(osId));
  return { erro: null };
}

export async function excluirSobra(osId: string, sobraId: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("sobras").delete().eq("id", sobraId);
  revalidatePath(caminho(osId));
}
