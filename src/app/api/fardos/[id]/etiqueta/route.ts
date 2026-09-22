import { NextResponse } from "next/server";
import { getSessaoAtual } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { gerarPdfEtiqueta, gerarZpl, type TamanhoEtiqueta } from "@/lib/etiqueta";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessao = await getSessaoAtual();
  if (!sessao) return new NextResponse("Não autenticado", { status: 401 });

  const { id } = await params;
  const url = new URL(request.url);
  const formato = url.searchParams.get("formato") === "pdf" ? "pdf" : "zpl";
  const tamanhoParam = url.searchParams.get("tamanho");
  const tamanho: TamanhoEtiqueta = tamanhoParam === "4x2" ? "4x2" : "4x6";

  const supabase = await createClient();
  const { data: fardo } = await supabase
    .from("fardos")
    .select(
      "etiqueta_codigo, descricao, ordens_servico(numero, clientes(nome), modelo_versoes(modelos(nome)))",
    )
    .eq("id", id)
    .maybeSingle();

  if (!fardo) return new NextResponse("Fardo não encontrado", { status: 404 });

  const os = fardo.ordens_servico as unknown as {
    numero: number;
    clientes: { nome: string } | null;
    modelo_versoes: { modelos: { nome: string } | null } | null;
  };

  const dados = {
    etiquetaCodigo: fardo.etiqueta_codigo,
    osNumero: os.numero,
    clienteNome: os.clientes?.nome ?? "—",
    modeloNome: os.modelo_versoes?.modelos?.nome ?? "—",
    descricao: fardo.descricao,
  };

  if (formato === "pdf") {
    const pdfBytes = await gerarPdfEtiqueta(dados, tamanho);
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${dados.etiquetaCodigo}.pdf"`,
      },
    });
  }

  const zpl = gerarZpl(dados, tamanho);
  return new NextResponse(zpl, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${dados.etiquetaCodigo}.zpl"`,
    },
  });
}
