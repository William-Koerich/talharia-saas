"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

function lerCampos(formData: FormData) {
  const maquinaPadraoId = String(formData.get("maquina_padrao_id") ?? "");
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    maquina_padrao_id: maquinaPadraoId || null,
  };
}

export async function criarOperacao(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const campos = lerCampos(formData);

  if (!campos.nome) return { erro: "Informe o nome da operação." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("operacoes")
    .insert({ tenant_id: sessao.tenantId, ...campos });

  if (error) {
    return error.code === "23505"
      ? { erro: "Já existe uma operação com esse nome." }
      : { erro: "Não foi possível criar a operação." };
  }

  revalidatePath("/painel/operacoes");
  redirect("/painel/operacoes");
}

export async function atualizarOperacao(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const campos = lerCampos(formData);

  if (!campos.nome) return { erro: "Informe o nome da operação." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("operacoes")
    .update(campos)
    .eq("id", id);

  if (error) {
    return error.code === "23505"
      ? { erro: "Já existe uma operação com esse nome." }
      : { erro: "Não foi possível salvar as alterações." };
  }

  revalidatePath("/painel/operacoes");
  redirect("/painel/operacoes");
}

export async function alternarAtivoOperacao(id: string, ativo: boolean) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("operacoes").update({ ativo }).eq("id", id);
  revalidatePath("/painel/operacoes");
}

export async function excluirOperacao(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("operacoes").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/operacoes?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a esta operação.")}`,
    );
  }

  revalidatePath("/painel/operacoes");
  redirect("/painel/operacoes");
}
