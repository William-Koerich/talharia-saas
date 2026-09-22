import { NextResponse } from "next/server";
import { getSessaoAtual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { gerarPdfRomaneio } from "@/lib/romaneio-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessao = await getSessaoAtual();
  if (!sessao) return new NextResponse("Não autenticado", { status: 401 });

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: romaneio }, { data: itensData }] = await Promise.all([
    supabase
      .from("romaneios")
      .select("status, data_entrega, assinatura_storage_path, clientes(nome)")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("romaneio_itens")
      .select("fardos(etiqueta_codigo, descricao)")
      .eq("romaneio_id", id),
  ]);

  if (!romaneio)
    return new NextResponse("Romaneio não encontrado", { status: 404 });

  const cliente = romaneio.clientes as unknown as { nome: string } | null;
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
    clienteNome: cliente?.nome ?? "—",
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
