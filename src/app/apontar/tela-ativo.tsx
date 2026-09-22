"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  enfileirarAcao,
  limparApontamentoAtivo,
  salvarApontamentoAtivo,
} from "@/lib/apontamento/db";
import type { ApontamentoAtivo, Referencia } from "@/lib/apontamento/tipos";

type Vista = "padrao" | "motivo" | "finalizar";

const TIPOS_SOBRA = [
  { value: "retalho", label: "Retalho" },
  { value: "ponta", label: "Ponta" },
  { value: "emenda", label: "Emenda" },
] as const;

export function TelaAtiva({
  referencia,
  ativo,
  aoAtualizar,
  aoFinalizar,
}: {
  referencia: Referencia | null;
  ativo: ApontamentoAtivo;
  aoAtualizar: (ativo: ApontamentoAtivo) => void;
  aoFinalizar: () => void;
}) {
  const [vista, setVista] = useState<Vista>("padrao");
  const [qtdProduzida, setQtdProduzida] = useState("");
  const [sobraMetros, setSobraMetros] = useState("");
  const [sobraTipo, setSobraTipo] = useState<string>("");
  const [enviando, setEnviando] = useState(false);

  async function pausar(motivoParadaId: string) {
    setEnviando(true);
    const agora = new Date().toISOString();
    const novoApontamentoId = crypto.randomUUID();

    await enfileirarAcao({
      id: crypto.randomUUID(),
      tipo: "pausar",
      criadoEm: agora,
      payload: {
        apontamentoAnteriorId: ativo.apontamentoId,
        novoApontamentoId,
        osId: ativo.osId,
        operacaoId: ativo.operacaoId,
        maquinaId: ativo.maquinaId,
        operadorMembershipId: ativo.operadorMembershipId,
        motivoParadaId,
      },
    });

    const novoAtivo: ApontamentoAtivo = {
      ...ativo,
      apontamentoId: novoApontamentoId,
      faseAtual: "parada",
      motivoParadaId,
      inicioFaseAtual: agora,
    };
    await salvarApontamentoAtivo(novoAtivo);
    aoAtualizar(novoAtivo);
    setVista("padrao");
    setEnviando(false);
  }

  async function retomar() {
    setEnviando(true);
    const agora = new Date().toISOString();
    const novoApontamentoId = crypto.randomUUID();

    await enfileirarAcao({
      id: crypto.randomUUID(),
      tipo: "retomar",
      criadoEm: agora,
      payload: {
        apontamentoAnteriorId: ativo.apontamentoId,
        novoApontamentoId,
        osId: ativo.osId,
        operacaoId: ativo.operacaoId,
        maquinaId: ativo.maquinaId,
        operadorMembershipId: ativo.operadorMembershipId,
      },
    });

    const novoAtivo: ApontamentoAtivo = {
      ...ativo,
      apontamentoId: novoApontamentoId,
      faseAtual: "produtivo",
      motivoParadaId: undefined,
      inicioFaseAtual: agora,
    };
    await salvarApontamentoAtivo(novoAtivo);
    aoAtualizar(novoAtivo);
    setEnviando(false);
  }

  async function finalizar() {
    const qtd = Number(qtdProduzida);
    if (!qtd) return;
    setEnviando(true);

    await enfileirarAcao({
      id: crypto.randomUUID(),
      tipo: "finalizar",
      criadoEm: new Date().toISOString(),
      payload: {
        apontamentoId: ativo.apontamentoId,
        osId: ativo.osId,
        qtdProduzida: qtd,
        sobraMetros: sobraMetros ? Number(sobraMetros) : null,
        sobraTipo: (sobraTipo as (typeof TIPOS_SOBRA)[number]["value"]) || null,
      },
    });

    await limparApontamentoAtivo();
    aoFinalizar();
  }

  if (vista === "motivo") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Motivo da parada</h1>
        <div className="flex flex-col gap-3">
          {referencia?.motivosParada.map((motivo) => (
            <Button
              key={motivo.id}
              variant="outline"
              className="h-16 justify-start rounded-2xl text-lg capitalize"
              disabled={enviando}
              onClick={() => pausar(motivo.id)}
            >
              {motivo.nome}
            </Button>
          ))}
        </div>
        <Button variant="ghost" onClick={() => setVista("padrao")}>
          Cancelar
        </Button>
      </div>
    );
  }

  if (vista === "finalizar") {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold">Finalizar</h1>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Quantidade produzida</label>
          <Input
            type="number"
            inputMode="numeric"
            className="h-14 rounded-xl text-lg"
            value={qtdProduzida}
            onChange={(e) => setQtdProduzida(e.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Sobra (m) — opcional</label>
          <Input
            type="number"
            step="0.01"
            className="h-14 rounded-xl text-lg"
            value={sobraMetros}
            onChange={(e) => setSobraMetros(e.target.value)}
          />
        </div>
        {sobraMetros && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Tipo da sobra</label>
            <Select
              value={sobraTipo}
              onValueChange={(v) => setSobraTipo(v ?? "")}
            >
              <SelectTrigger className="h-14 w-full rounded-xl text-lg">
                <SelectValue>
                  {(valor: string | null) =>
                    TIPOS_SOBRA.find((t) => t.value === valor)?.label ??
                    "Selecione"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {TIPOS_SOBRA.map((t) => (
                  <SelectItem key={t.value} value={t.value} className="text-lg">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Button
          className="h-16 rounded-2xl text-xl"
          disabled={!qtdProduzida || enviando}
          onClick={finalizar}
        >
          CONFIRMAR
        </Button>
        <Button variant="ghost" onClick={() => setVista("padrao")}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">OS #{ativo.osNumero}</h1>
        <p className="text-muted-foreground">
          {ativo.maquinaNome} · {ativo.operacaoNome}
        </p>
        <span
          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
            ativo.faseAtual === "parada"
              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          <span
            className={`size-2 rounded-full ${ativo.faseAtual === "parada" ? "bg-amber-500" : "bg-emerald-500"}`}
          />
          {ativo.faseAtual === "parada" ? "Em parada" : "Em produção"}
        </span>
      </div>

      {ativo.faseAtual === "produtivo" ? (
        <Button
          variant="outline"
          className="h-16 rounded-2xl text-xl"
          disabled={enviando}
          onClick={() => setVista("motivo")}
        >
          PAUSAR
        </Button>
      ) : (
        <Button
          className="h-16 rounded-2xl text-xl"
          disabled={enviando}
          onClick={retomar}
        >
          RETOMAR
        </Button>
      )}

      <Button
        variant="destructive"
        className="h-16 rounded-2xl text-xl"
        disabled={enviando}
        onClick={() => setVista("finalizar")}
      >
        FINALIZAR
      </Button>
    </div>
  );
}
