"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EstadoForm } from "../actions";

type LinhaCsv = {
  nome?: string;
  documento?: string;
  contato?: string;
  endereco?: string;
};

export async function importarClientesCsv(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const arquivo = formData.get("arquivo");

  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: "Selecione um arquivo CSV." };
  }

  const texto = await arquivo.text();
  const resultado = Papa.parse<LinhaCsv>(texto, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (cabecalho) => cabecalho.trim().toLowerCase(),
  });

  const linhas = resultado.data.filter((linha) => linha.nome?.trim());

  if (linhas.length === 0) {
    return {
      erro: "Nenhuma linha válida encontrada (a coluna 'nome' é obrigatória).",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("clientes").insert(
    linhas.map((linha) => ({
      tenant_id: sessao.tenantId,
      nome: linha.nome!.trim(),
      documento: linha.documento?.trim() || null,
      contato: linha.contato?.trim() || null,
      endereco: linha.endereco?.trim() || null,
    })),
  );

  if (error) return { erro: "Não foi possível importar os clientes." };

  revalidatePath("/painel/clientes");
  redirect("/painel/clientes");
}
