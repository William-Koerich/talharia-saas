"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    unidade: String(formData.get("unidade") ?? "").trim(),
    custo_unitario: Number(formData.get("custo_unitario") ?? 0) || 0,
  };
}

export async function criarConsumivel(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const campos = lerCampos(formData);

  if (!campos.nome) return { erro: "Informe o nome do consumível." };
  if (!campos.unidade)
    return { erro: "Informe a unidade (ex.: metro, unidade, kg)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("consumiveis")
    .insert({ tenant_id: sessao.tenantId, ...campos });

  if (error) return { erro: "Não foi possível criar o consumível." };

  revalidatePath("/painel/consumiveis");
  redirect("/painel/consumiveis");
}

export async function atualizarConsumivel(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const campos = lerCampos(formData);

  if (!campos.nome) return { erro: "Informe o nome do consumível." };
  if (!campos.unidade)
    return { erro: "Informe a unidade (ex.: metro, unidade, kg)." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("consumiveis")
    .update(campos)
    .eq("id", id);

  if (error) return { erro: "Não foi possível salvar as alterações." };

  revalidatePath("/painel/consumiveis");
  redirect("/painel/consumiveis");
}

export async function alternarAtivoConsumivel(id: string, ativo: boolean) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("consumiveis").update({ ativo }).eq("id", id);
  revalidatePath("/painel/consumiveis");
}

export async function excluirConsumivel(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("consumiveis").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/consumiveis?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a este consumível.")}`,
    );
  }

  revalidatePath("/painel/consumiveis");
  redirect("/painel/consumiveis");
}
