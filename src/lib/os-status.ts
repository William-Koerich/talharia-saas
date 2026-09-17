export const OS_STATUS = [
  { value: "aguardando_tecido", label: "Aguardando tecido" },
  { value: "risco", label: "Risco" },
  { value: "enfesto", label: "Enfesto" },
  { value: "corte", label: "Corte" },
  { value: "prensa", label: "Prensa" },
  { value: "separacao", label: "Separação" },
  { value: "pronto", label: "Pronto" },
  { value: "entregue", label: "Entregue" },
] as const;

export type OsStatus = (typeof OS_STATUS)[number]["value"];

export const ORIGENS_ROLO = [
  { value: "cliente", label: "Recebido do cliente" },
  { value: "proprio", label: "Próprio" },
] as const;
