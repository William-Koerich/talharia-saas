"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

export async function criarVersao(
  modeloId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const larguraExigida = formData.get("largura_exigida");
  const eficienciaEncaixe = formData.get("eficiencia_encaixe");

  const supabase = await createClient();
  const { data: ultima } = await supabase
    .from("modelo_versoes")
    .select("versao")
    .eq("modelo_id", modeloId)
    .order("versao", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: novaVersao, error } = await supabase
    .from("modelo_versoes")
    .insert({
      tenant_id: sessao.tenantId,
      modelo_id: modeloId,
      versao: (ultima?.versao ?? 0) + 1,
      vigente: false,
      largura_exigida: larguraExigida ? Number(larguraExigida) : null,
      eficiencia_encaixe: eficienciaEncaixe ? Number(eficienciaEncaixe) : null,
    })
    .select("id")
    .single();

  if (error || !novaVersao) return { erro: "Não foi possível criar a versão." };

  revalidatePath(`/painel/modelos/${modeloId}`);
  redirect(`/painel/modelos/${modeloId}/versoes/${novaVersao.id}`);
}
