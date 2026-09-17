"use server";

import { revalidatePath } from "next/cache";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  TIPOS_ARQUIVO_MODELO,
  type TipoArquivoModelo,
} from "@/lib/tipos-arquivo-modelo";

export type EstadoForm = { erro: string | null };

function caminho(modeloId: string, versaoId: string) {
  return `/painel/modelos/${modeloId}/versoes/${versaoId}`;
}

export async function atualizarVersao(
  modeloId: string,
  versaoId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  await exigirGestor();
  const larguraExigida = formData.get("largura_exigida");
  const eficienciaEncaixe = formData.get("eficiencia_encaixe");

  const supabase = await createClient();
  const { error } = await supabase
    .from("modelo_versoes")
    .update({
      largura_exigida: larguraExigida ? Number(larguraExigida) : null,
      eficiencia_encaixe: eficienciaEncaixe ? Number(eficienciaEncaixe) : null,
    })
    .eq("id", versaoId);

  if (error) return { erro: "Não foi possível salvar as alterações." };

  revalidatePath(caminho(modeloId, versaoId));
  return { erro: null };
}

export async function marcarVigente(modeloId: string, versaoId: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.rpc("marcar_versao_vigente", { p_modelo_versao_id: versaoId });
  revalidatePath(`/painel/modelos/${modeloId}`);
  revalidatePath(caminho(modeloId, versaoId));
}

export async function adicionarParte(
  modeloId: string,
  versaoId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const nome = String(formData.get("nome") ?? "").trim();
  const qtdPorPeca = Number(formData.get("qtd_por_peca") ?? 1) || 1;
  const sentidoFio = String(formData.get("sentido_fio") ?? "indiferente");
  const par = formData.get("par") === "on";
  const entretela = formData.get("entretela") === "on";

  if (!nome) return { erro: "Informe o nome da parte." };

  const supabase = await createClient();
  const { error } = await supabase.from("modelo_partes").insert({
    tenant_id: sessao.tenantId,
    modelo_versao_id: versaoId,
    nome,
    qtd_por_peca: qtdPorPeca,
    sentido_fio: sentidoFio,
    par,
    entretela,
  });

  if (error) return { erro: "Não foi possível adicionar a parte." };

  revalidatePath(caminho(modeloId, versaoId));
  return { erro: null };
}

export async function removerParte(
  modeloId: string,
  versaoId: string,
  parteId: string,
) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("modelo_partes").delete().eq("id", parteId);
  revalidatePath(caminho(modeloId, versaoId));
}

export async function adicionarConsumo(
  modeloId: string,
  versaoId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const tamanho = String(formData.get("tamanho") ?? "").trim();
  const consumoMetros = Number(formData.get("consumo_metros") ?? 0);

  if (!tamanho) return { erro: "Informe o tamanho." };
  if (!consumoMetros) return { erro: "Informe o consumo em metros." };

  const supabase = await createClient();
  const { error } = await supabase.from("consumo_teorico_tamanho").insert({
    tenant_id: sessao.tenantId,
    modelo_versao_id: versaoId,
    tamanho,
    consumo_metros: consumoMetros,
  });

  if (error) {
    return error.code === "23505"
      ? { erro: "Esse tamanho já está cadastrado nessa versão." }
      : { erro: "Não foi possível adicionar o tamanho." };
  }

  revalidatePath(caminho(modeloId, versaoId));
  return { erro: null };
}

export async function removerConsumo(
  modeloId: string,
  versaoId: string,
  consumoId: string,
) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("consumo_teorico_tamanho").delete().eq("id", consumoId);
  revalidatePath(caminho(modeloId, versaoId));
}

export async function enviarArquivo(
  modeloId: string,
  versaoId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const tipo = String(formData.get("tipo") ?? "") as TipoArquivoModelo;
  const arquivo = formData.get("arquivo");

  if (!TIPOS_ARQUIVO_MODELO.some((t) => t.value === tipo)) {
    return { erro: "Selecione o tipo do arquivo." };
  }
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Selecione um arquivo." };
  }

  const caminhoStorage = `${sessao.tenantId}/${versaoId}/${crypto.randomUUID()}-${arquivo.name}`;

  const supabase = await createClient();
  const { error: erroUpload } = await supabase.storage
    .from("arquivos")
    .upload(caminhoStorage, arquivo, { contentType: arquivo.type });

  if (erroUpload) return { erro: "Não foi possível enviar o arquivo." };

  const { error: erroRegistro } = await supabase
    .from("modelo_arquivos")
    .insert({
      tenant_id: sessao.tenantId,
      modelo_versao_id: versaoId,
      tipo,
      storage_path: caminhoStorage,
      nome_original: arquivo.name,
    });

  if (erroRegistro) {
    await supabase.storage.from("arquivos").remove([caminhoStorage]);
    return { erro: "Não foi possível registrar o arquivo." };
  }

  revalidatePath(caminho(modeloId, versaoId));
  return { erro: null };
}

export async function excluirArquivo(
  modeloId: string,
  versaoId: string,
  arquivoId: string,
  storagePath: string,
) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("modelo_arquivos").delete().eq("id", arquivoId);
  await supabase.storage.from("arquivos").remove([storagePath]);
  revalidatePath(caminho(modeloId, versaoId));
}
