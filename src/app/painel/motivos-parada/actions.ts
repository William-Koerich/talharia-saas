"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

export async function criarMotivoParada(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) return { erro: "Informe o nome do motivo." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("motivos_parada")
    .insert({ tenant_id: sessao.tenantId, nome });

  if (error) {
    return error.code === "23505"
      ? { erro: "Já existe um motivo com esse nome." }
      : { erro: "Não foi possível criar o motivo." };
  }

  revalidatePath("/painel/motivos-parada");
  redirect("/painel/motivos-parada");
}

export async function atualizarMotivoParada(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const nome = String(formData.get("nome") ?? "").trim();

  if (!nome) return { erro: "Informe o nome do motivo." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("motivos_parada")
    .update({ nome })
    .eq("id", id);

  if (error) {
    return error.code === "23505"
      ? { erro: "Já existe um motivo com esse nome." }
      : { erro: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/painel/motivos-parada");
  redirect("/painel/motivos-parada");
}

export async function alternarAtivoMotivoParada(id: string, ativo: boolean) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("motivos_parada").update({ ativo }).eq("id", id);
  revalidatePath("/painel/motivos-parada");
}

export async function excluirMotivoParada(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("motivos_parada").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/motivos-parada?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a este motivo.")}`,
    );
  }

  revalidatePath("/painel/motivos-parada");
  redirect("/painel/motivos-parada");
}
