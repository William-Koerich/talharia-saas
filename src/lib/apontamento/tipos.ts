export type Maquina = { id: string; nome: string };
export type Operacao = { id: string; nome: string };
export type MotivoParada = { id: string; nome: string };
export type PinCache = {
  membershipId: string;
  nome: string;
  role: "OWNER" | "ADMIN" | "OPERADOR";
  pinHash: string;
};
export type OSAtiva = {
  id: string;
  numero: number;
  clienteNome: string;
  modeloNome: string;
};

export type Referencia = {
  maquinas: Maquina[];
  operacoes: Operacao[];
  motivosParada: MotivoParada[];
  pins: PinCache[];
  osAtivas: OSAtiva[];
  atualizadoEm: string;
};

export type Operador = {
  membershipId: string;
  nome: string;
};

export type ApontamentoAtivo = {
  apontamentoId: string;
  operadorMembershipId: string;
  osId: string;
  osNumero: number;
  operacaoId: string;
  operacaoNome: string;
  maquinaId: string;
  maquinaNome: string;
  /** 'produtivo' cobre também "setup": o servidor decide qual dos dois na sincronização. */
  faseAtual: "produtivo" | "parada";
  motivoParadaId?: string;
  inicioFaseAtual: string;
};

export type AcaoFila =
  | {
      id: string;
      tipo: "iniciar";
      criadoEm: string;
      payload: {
        apontamentoId: string;
        osId: string;
        operacaoId: string;
        maquinaId: string;
        operadorMembershipId: string;
      };
    }
  | {
      id: string;
      tipo: "pausar";
      criadoEm: string;
      payload: {
        apontamentoAnteriorId: string;
        novoApontamentoId: string;
        osId: string;
        operacaoId: string;
        maquinaId: string;
        operadorMembershipId: string;
        motivoParadaId: string;
      };
    }
  | {
      id: string;
      tipo: "retomar";
      criadoEm: string;
      payload: {
        apontamentoAnteriorId: string;
        novoApontamentoId: string;
        osId: string;
        operacaoId: string;
        maquinaId: string;
        operadorMembershipId: string;
      };
    }
  | {
      id: string;
      tipo: "finalizar";
      criadoEm: string;
      payload: {
        apontamentoId: string;
        osId: string;
        qtdProduzida: number;
        sobraMetros: number | null;
        sobraTipo: "retalho" | "ponta" | "emenda" | null;
      };
    };
