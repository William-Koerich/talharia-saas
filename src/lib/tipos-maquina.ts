export const TIPOS_MAQUINA = [
  { value: "mesa_enfesto_manual", label: "Mesa de enfesto manual" },
  { value: "mesa_enfesto_auto", label: "Mesa de enfesto automática" },
  { value: "plotter_risco", label: "Plotter de risco" },
  { value: "serra_fita", label: "Serra fita" },
  { value: "serra_vertical", label: "Serra vertical" },
  { value: "cortadora_disco", label: "Cortadora de disco" },
  { value: "corte_automatico", label: "Corte automático" },
  { value: "prensa_entretela", label: "Prensa de entretela" },
  { value: "etiquetadeira", label: "Etiquetadeira" },
  { value: "mesa_separacao", label: "Mesa de separação" },
] as const;

export type TipoMaquina = (typeof TIPOS_MAQUINA)[number]["value"];
