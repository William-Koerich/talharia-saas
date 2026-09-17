export const TIPOS_ARQUIVO_MODELO = [
  { value: "croqui", label: "Croqui / foto" },
  { value: "risco_pdf", label: "Risco (PDF)" },
  { value: "plt", label: "Plotter (.plt)" },
  { value: "dxf", label: "CAD (.dxf)" },
] as const;

export type TipoArquivoModelo = (typeof TIPOS_ARQUIVO_MODELO)[number]["value"];

export const EXTENSOES_POR_TIPO: Record<TipoArquivoModelo, string> = {
  croqui: ".png,.jpg,.jpeg,.webp",
  risco_pdf: ".pdf",
  plt: ".plt",
  dxf: ".dxf",
};
