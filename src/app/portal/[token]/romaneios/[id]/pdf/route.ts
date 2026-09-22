import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { gerarPdfRomaneio } from "@/lib/romaneio-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; id: string }> },
) {
  const { token, id } = await params;
  const supabase = createAdminClient();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("portal_token", token)
    .maybeSingle();

  if (!cliente) return new NextResponse("Link inválido", { status: 404 });

  const [{ data: romaneio }, { data: itensData }] = await Promise.all([
    supabase
      .from("romaneios")
      .select("status, data_entrega, assinatura_storage_path, cliente_id")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("romaneio_itens")
      .select("fardos(etiqueta_codigo, descricao)")
      .eq("romaneio_id", id),
  ]);

  if (!romaneio || romaneio.cliente_id !== cliente.id) {
    return new NextResponse("Romaneio não encontrado", { status: 404 });
  }

  const itens = (itensData ?? []).map((item) => {
    const fardo = item.fardos as unknown as {
      etiqueta_codigo: string;
      descricao: string | null;
    } | null;
    return {
      etiquetaCodigo: fardo?.etiqueta_codigo ?? "—",
      descricao: fardo?.descricao ?? null,
    };
  });

  let assinaturaPngBytes: Uint8Array | null = null;
  if (romaneio.assinatura_storage_path) {
    const { data } = await supabase.storage
      .from("arquivos")
      .download(romaneio.assinatura_storage_path);
    if (data) assinaturaPngBytes = new Uint8Array(await data.arrayBuffer());
  }

  const pdfBytes = await gerarPdfRomaneio({
    clienteNome: cliente.nome,
    status: romaneio.status,
    dataEntrega: romaneio.data_entrega,
    itens,
    assinaturaPngBytes,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="romaneio-${id}.pdf"`,
    },
  });
}
