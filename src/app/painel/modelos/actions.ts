"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

export async function criarModelo(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const nome = String(formData.get("nome") ?? "").trim();
  const clienteId = String(formData.get("cliente_id") ?? "");

  if (!nome) return { erro: "Informe o nome do modelo." };
  if (!clienteId) return { erro: "Selecione o cliente." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("criar_modelo", {
      p_tenant_id: sessao.tenantId,
      p_cliente_id: clienteId,
      p_nome: nome,
    })
    .returns<{ modelo_id: string; modelo_versao_id: string }[]>()
    .single();

  if (error || !data) return { erro: "Não foi possível criar o modelo." };

  revalidatePath("/painel/modelos");
  redirect(`/painel/modelos/${data.modelo_id}`);
}

export async function atualizarModelo(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const nome = String(formData.get("nome") ?? "").trim();
  const clienteId = String(formData.get("cliente_id") ?? "");

  if (!nome) return { erro: "Informe o nome do modelo." };
  if (!clienteId) return { erro: "Selecione o cliente." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("modelos")
    .update({ nome, cliente_id: clienteId })
    .eq("id", id);

  if (error) return { erro: "Não foi possível salvar as alterações." };

  revalidatePath("/painel/modelos");
  revalidatePath(`/painel/modelos/${id}`);
  redirect(`/painel/modelos/${id}`);
}

export async function excluirModelo(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("modelos").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/modelos?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a este modelo.")}`,
    );
  }

  revalidatePath("/painel/modelos");
  redirect("/painel/modelos");
}
