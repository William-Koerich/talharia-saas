"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TIPOS_MAQUINA, type TipoMaquina } from "@/lib/tipos-maquina";

export type EstadoForm = { erro: string | null };

function lerCampos(formData: FormData) {
  return {
    nome: String(formData.get("nome") ?? "").trim(),
    tipo: String(formData.get("tipo") ?? "") as TipoMaquina,
    custo_hora: Number(formData.get("custo_hora") ?? 0) || 0,
  };
}

function validar(campos: ReturnType<typeof lerCampos>) {
  if (!campos.nome) return "Informe o nome da máquina.";
  if (!TIPOS_MAQUINA.some((t) => t.value === campos.tipo)) {
    return "Selecione o tipo da máquina.";
  }
  return null;
}

export async function criarMaquina(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const campos = lerCampos(formData);
  const erroValidacao = validar(campos);
  if (erroValidacao) return { erro: erroValidacao };

  const supabase = await createClient();
  const { error } = await supabase
    .from("maquinas")
    .insert({ tenant_id: sessao.tenantId, ...campos });

  if (error) return { erro: "Não foi possível criar a máquina." };

  revalidatePath("/painel/maquinas");
  redirect("/painel/maquinas");
}

export async function atualizarMaquina(
  id: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const campos = lerCampos(formData);
  const erroValidacao = validar(campos);
  if (erroValidacao) return { erro: erroValidacao };

  const supabase = await createClient();
  const { error } = await supabase.from("maquinas").update(campos).eq("id", id);

  if (error) return { erro: "Não foi possível salvar as alterações." };

  revalidatePath("/painel/maquinas");
  redirect("/painel/maquinas");
}

export async function alternarAtivoMaquina(id: string, ativo: boolean) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("maquinas").update({ ativo }).eq("id", id);
  revalidatePath("/painel/maquinas");
}

export async function excluirMaquina(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("maquinas").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/maquinas?erro=${encodeURIComponent("Não foi possível excluir: existem registros vinculados a esta máquina.")}`,
    );
  }

  revalidatePath("/painel/maquinas");
  redirect("/painel/maquinas");
}
