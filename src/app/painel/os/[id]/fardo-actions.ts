"use server";

import { revalidatePath } from "next/cache";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

export async function criarFardo(
  osId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const descricao = String(formData.get("descricao") ?? "").trim() || null;

  const supabase = await createClient();
  const { data: os } = await supabase
    .from("ordens_servico")
    .select("numero")
    .eq("id", osId)
    .maybeSingle();

  if (!os) return { erro: "OS não encontrada." };

  const { count } = await supabase
    .from("fardos")
    .select("id", { head: true, count: "exact" })
    .eq("os_id", osId);

  const proximoNumero = (count ?? 0) + 1;
  const etiquetaCodigo = `OS${os.numero}-F${String(proximoNumero).padStart(2, "0")}`;

  const { error } = await supabase.from("fardos").insert({
    tenant_id: sessao.tenantId,
    os_id: osId,
    etiqueta_codigo: etiquetaCodigo,
    descricao,
  });

  if (error) return { erro: "Não foi possível criar o fardo." };

  revalidatePath(`/painel/os/${osId}`);
  return { erro: null };
}

export async function excluirFardo(osId: string, fardoId: string) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase.from("fardos").delete().eq("id", fardoId);
  revalidatePath(`/painel/os/${osId}`);
}
