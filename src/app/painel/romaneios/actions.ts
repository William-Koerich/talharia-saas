"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type EstadoForm = { erro: string | null };

export async function criarRomaneio(
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const clienteId = String(formData.get("cliente_id") ?? "");
  const fardoIds = formData.getAll("fardo_id").map(String);

  if (!clienteId) return { erro: "Selecione o cliente." };
  if (fardoIds.length === 0) return { erro: "Selecione ao menos um fardo." };

  const supabase = await createClient();
  const { data: romaneioId, error } = await supabase.rpc("criar_romaneio", {
    p_tenant_id: sessao.tenantId,
    p_cliente_id: clienteId,
    p_fardo_ids: fardoIds,
  });

  if (error || !romaneioId) return { erro: "Não foi possível criar o romaneio." };

  revalidatePath("/painel/romaneios");
  redirect(`/painel/romaneios/${romaneioId}`);
}

export async function excluirRomaneio(id: string) {
  await exigirGestor();
  const supabase = await createClient();
  const { error } = await supabase.from("romaneios").delete().eq("id", id);

  if (error) {
    redirect(
      `/painel/romaneios?erro=${encodeURIComponent("Não foi possível excluir o romaneio.")}`,
    );
  }

  revalidatePath("/painel/romaneios");
  redirect("/painel/romaneios");
}

export async function alternarConferidoItem(
  romaneioId: string,
  itemId: string,
  conferido: boolean,
) {
  await exigirGestor();
  const supabase = await createClient();
  await supabase
    .from("romaneio_itens")
    .update({ conferido, conferido_em: conferido ? new Date().toISOString() : null })
    .eq("id", itemId);
  revalidatePath(`/painel/romaneios/${romaneioId}`);
}

export async function marcarRomaneioConferido(romaneioId: string) {
  await exigirGestor();
  const supabase = await createClient();

  const { count: total } = await supabase
    .from("romaneio_itens")
    .select("id", { head: true, count: "exact" })
    .eq("romaneio_id", romaneioId);
  const { count: conferidos } = await supabase
    .from("romaneio_itens")
    .select("id", { head: true, count: "exact" })
    .eq("romaneio_id", romaneioId)
    .eq("conferido", true);

  if (!total || conferidos !== total) return;

  await supabase.from("romaneios").update({ status: "conferido" }).eq("id", romaneioId);
  revalidatePath(`/painel/romaneios/${romaneioId}`);
}

export async function finalizarEntrega(
  romaneioId: string,
  _estado: EstadoForm,
  formData: FormData,
): Promise<EstadoForm> {
  const sessao = await exigirGestor();
  const foto = formData.get("foto");
  const assinatura = formData.get("assinatura");

  if (!(foto instanceof File) || foto.size === 0)
    return { erro: "Tire uma foto da entrega." };
  if (!(assinatura instanceof File) || assinatura.size === 0)
    return { erro: "Colete a assinatura do recebedor." };

  const supabase = await createClient();
  const fotoPath = `${sessao.tenantId}/romaneios/${romaneioId}/foto-${crypto.randomUUID()}.jpg`;
  const assinaturaPath = `${sessao.tenantId}/romaneios/${romaneioId}/assinatura-${crypto.randomUUID()}.png`;

  const { error: erroFoto } = await supabase.storage
    .from("arquivos")
    .upload(fotoPath, foto, { contentType: foto.type || "image/jpeg" });
  if (erroFoto) return { erro: "Não foi possível enviar a foto." };

  const { error: erroAssinatura } = await supabase.storage
    .from("arquivos")
    .upload(assinaturaPath, assinatura, { contentType: "image/png" });
  if (erroAssinatura) {
    await supabase.storage.from("arquivos").remove([fotoPath]);
    return { erro: "Não foi possível enviar a assinatura." };
  }

  const { error } = await supabase
    .from("romaneios")
    .update({
      status: "entregue",
      data_entrega: new Date().toISOString().slice(0, 10),
      foto_entrega_storage_path: fotoPath,
      assinatura_storage_path: assinaturaPath,
    })
    .eq("id", romaneioId);

  if (error) {
    await supabase.storage.from("arquivos").remove([fotoPath, assinaturaPath]);
    return { erro: "Não foi possível finalizar a entrega." };
  }

  revalidatePath(`/painel/romaneios/${romaneioId}`);
  return { erro: null };
}
