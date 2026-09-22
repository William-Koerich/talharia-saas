"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    documento: String(formData.get("documento") ?? "").trim() || null,
    contato: String(formData.get("contato") ?? "").trim() || null,
    endereco: String(formData.get("endereco") ?? "").trim() || null,
  };
}

export async function criarCliente(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const campos = lerCampos(formData);

  if (!campos.nome) return { erro: "Informe o nome do cliente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .insert({ tenant_id: sessao.tenantId, ...campos });

  if (error) return { erro: "Não foi possível criar o cliente." };

  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}

export async function atualizarCliente(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const campos = lerCampos(formData);

  if (!campos.nome) return { erro: "Informe o nome do cliente." };

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").update(campos).eq("id", id);

  if (error) return { erro: "Não foi possível salvar as alterações." };

  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}

export async function alternarAtivoCliente(id: string, ativo: boolean) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("clientes").update({ ativo }).eq("id", id);
  revalidatePath("/painel/clientes");
}

export async function regenerarPortalLink(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.rpc("regenerar_portal_token", { p_cliente_id: id });
  revalidatePath(`/painel/clientes/${id}`);
}

export async function excluirCliente(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/clientes?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a este cliente.")}`,
    );
  }

  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}
