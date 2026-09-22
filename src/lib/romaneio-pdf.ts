import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type DadosRomaneio = {
  clienteNome: string;
  status: string;
  dataEntrega: string | null;
  itens: { etiquetaCodigo: string; descricao: string | null }[];
  assinaturaPngBytes: Uint8Array | null;
};

export async function gerarPdfRomaneio(
  dados: DadosRomaneio,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  let pagina = pdfDoc.addPage([420, 595]);
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fonteNegrito = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 560;
  pagina.drawText("Romaneio de entrega", {
    x: 40,
    y,
    size: 16,
    font: fonteNegrito,
  });
  y -= 28;
  pagina.drawText(`Cliente: ${dados.clienteNome}`, {
    x: 40,
    y,
    size: 11,
    font: fonte,
  });
  y -= 16;
  pagina.drawText(`Status: ${dados.status}`, {
    x: 40,
    y,
    size: 11,
    font: fonte,
  });
  y -= 16;
  pagina.drawText(`Data de entrega: ${dados.dataEntrega ?? "—"}`, {
    x: 40,
    y,
    size: 11,
    font: fonte,
  });
  y -= 28;

  pagina.drawText("Fardos:", { x: 40, y, size: 12, font: fonteNegrito });
  y -= 20;

  for (const item of dados.itens) {
    if (y < 80) {
      pagina = pdfDoc.addPage([420, 595]);
      y = 560;
    }
    const linha = item.descricao
      ? `${item.etiquetaCodigo} — ${item.descricao}`
      : item.etiquetaCodigo;
    pagina.drawText(linha, {
      x: 50,
      y,
      size: 10,
      font: fonte,
      color: rgb(0, 0, 0),
    });
    y -= 16;
  }

  if (dados.assinaturaPngBytes) {
    if (y < 160) {
      pagina = pdfDoc.addPage([420, 595]);
      y = 560;
    }
    y -= 20;
    pagina.drawText("Assinatura do recebedor:", {
      x: 40,
      y,
      size: 11,
      font: fonteNegrito,
    });
    y -= 110;
    const imagem = await pdfDoc.embedPng(dados.assinaturaPngBytes);
    pagina.drawImage(imagem, { x: 40, y, width: 160, height: 90 });
  }

  return pdfDoc.save();
}
