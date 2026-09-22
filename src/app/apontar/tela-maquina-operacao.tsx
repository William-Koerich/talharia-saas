"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enfileirarAcao, salvarApontamentoAtivo } from "@/lib/apontamento/db";
import type {
  ApontamentoAtivo,
  OSAtiva,
  Referencia,
  Operador,
} from "@/lib/apontamento/tipos";

export function TelaMaquinaOperacao({
  referencia,
  os,
  operador,
  aoIniciar,
  aoVoltar,
}: {
  referencia: Referencia | null;
  os: OSAtiva;
  operador: Operador;
  aoIniciar: (ativo: ApontamentoAtivo) => void;
  aoVoltar: () => void;
}) {
  const [maquinaId, setMaquinaId] = useState("");
  const [operacaoId, setOperacaoId] = useState("");
  const [iniciando, setIniciando] = useState(false);

  async function iniciar() {
    if (!maquinaId || !operacaoId) return;
    setIniciando(true);

    const maquina = referencia?.maquinas.find((m) => m.id === maquinaId);
    const operacao = referencia?.operacoes.find((o) => o.id === operacaoId);
    if (!maquina || !operacao) return;

    const agora = new Date().toISOString();
    const apontamentoId = crypto.randomUUID();

    await enfileirarAcao({
      id: crypto.randomUUID(),
      tipo: "iniciar",
      criadoEm: agora,
      payload: {
        apontamentoId,
        osId: os.id,
        operacaoId,
        maquinaId,
        operadorMembershipId: operador.membershipId,
      },
    });

    const ativo: ApontamentoAtivo = {
      apontamentoId,
      operadorMembershipId: operador.membershipId,
      osId: os.id,
      osNumero: os.numero,
      operacaoId,
      operacaoNome: operacao.nome,
      maquinaId,
      maquinaNome: maquina.nome,
      faseAtual: "produtivo",
      inicioFaseAtual: agora,
    };

    await salvarApontamentoAtivo(ativo);
    aoIniciar(ativo);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={aoVoltar}
      >
        ← Voltar
      </Button>

      <div>
        <h1 className="text-2xl font-bold">OS #{os.numero}</h1>
        <p className="text-muted-foreground">
          {os.clienteNome} · {os.modeloNome}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Máquina / posto</label>
        <Select value={maquinaId} onValueChange={(v) => setMaquinaId(v ?? "")}>
          <SelectTrigger className="h-14 w-full rounded-xl text-lg">
            <SelectValue>
              {(valor: string | null) =>
                referencia?.maquinas.find((m) => m.id === valor)?.nome ??
                "Selecione"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {referencia?.maquinas.map((m) => (
              <SelectItem key={m.id} value={m.id} className="text-lg">
                {m.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Operação</label>
        <Select
          value={operacaoId}
          onValueChange={(v) => setOperacaoId(v ?? "")}
        >
          <SelectTrigger className="h-14 w-full rounded-xl text-lg">
            <SelectValue>
              {(valor: string | null) =>
                referencia?.operacoes.find((o) => o.id === valor)?.nome ??
                "Selecione"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {referencia?.operacoes.map((o) => (
              <SelectItem
                key={o.id}
                value={o.id}
                className="text-lg capitalize"
              >
                {o.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="h-16 rounded-2xl text-xl"
        disabled={!maquinaId || !operacaoId || iniciando}
        onClick={iniciar}
      >
        INICIAR
      </Button>
    </div>
  );
}
