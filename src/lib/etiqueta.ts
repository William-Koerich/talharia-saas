import QRCode from "qrcode";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export type DadosEtiqueta = {
  etiquetaCodigo: string;
  osNumero: number;
  clienteNome: string;
  modeloNome: string;
  descricao: string | null;
};

export type TamanhoEtiqueta = "4x6" | "4x2";

const DPI = 203; // padrão de impressoras térmicas Zebra

function polegadasParaPontos(pol: { largura: number; altura: number }) {
  return { largura: pol.largura * DPI, altura: pol.altura * DPI };
}

const DIMENSOES: Record<TamanhoEtiqueta, { largura: number; altura: number }> = {
  "4x6": polegadasParaPontos({ largura: 4, altura: 6 }),
  "4x2": polegadasParaPontos({ largura: 4, altura: 2 }),
};

export function gerarZpl(dados: DadosEtiqueta, tamanho: TamanhoEtiqueta): string {
  const { largura, altura } = DIMENSOES[tamanho];
  const linhas = [
    `OS #${dados.osNumero}`,
    dados.clienteNome,
    dados.modeloNome,
    dados.descricao ?? "",
  ].filter(Boolean);

  const linhasZpl = linhas
    .map((texto, i) => `^FO260,${50 + i * 40}^A0N,30,30^FD${escaparZpl(texto)}^FS`)
    .join("\n");

  return [
    "^XA",
    `^PW${Math.round(largura)}`,
    `^LL${Math.round(altura)}`,
    "^CI28", // UTF-8
    `^FO40,40^BQN,2,6^FDMA,${dados.etiquetaCodigo}^FS`,
    linhasZpl,
    `^FO40,${Math.round(altura) - 60}^A0N,26,26^FD${escaparZpl(dados.etiquetaCodigo)}^FS`,
    "^XZ",
  ].join("\n");
}

function escaparZpl(texto: string) {
  return texto.replace(/\^/g, "").replace(/~/g, "");
}

export async function gerarPdfEtiqueta(
  dados: DadosEtiqueta,
  tamanho: TamanhoEtiqueta,
): Promise<Uint8Array> {
  const { largura, altura } = { "4x6": { largura: 288, altura: 432 }, "4x2": { largura: 288, altura: 144 } }[
    tamanho
  ];

  const pdfDoc = await PDFDocument.create();
  const pagina = pdfDoc.addPage([largura, altura]);
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const qrDataUrl = await QRCode.toDataURL(dados.etiquetaCodigo, { margin: 1, width: 300 });
  const qrImagemBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qrImagem = await pdfDoc.embedPng(qrImagemBytes);
  const qrTamanho = Math.min(largura * 0.4, altura * 0.7);

  pagina.drawImage(qrImagem, {
    x: 12,
    y: altura - qrTamanho - 12,
    width: qrTamanho,
    height: qrTamanho,
  });

  const linhas = [
    `OS #${dados.osNumero}`,
    dados.clienteNome,
    dados.modeloNome,
    ...(dados.descricao ? [dados.descricao] : []),
  ];

  let y = altura - 20;
  const xTexto = qrTamanho + 24;
  for (const linha of linhas) {
    pagina.drawText(linha, { x: xTexto, y, size: 10, font: fonte, color: rgb(0, 0, 0) });
    y -= 14;
  }

  pagina.drawText(dados.etiquetaCodigo, {
    x: 12,
    y: 8,
    size: 9,
    font: fonte,
    color: rgb(0, 0, 0),
  });

  return pdfDoc.save();
}
