"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { pinConfere } from "@/lib/pin";
import { salvarOperador } from "@/lib/apontamento/db";
import type { Operador, Referencia } from "@/lib/apontamento/tipos";

const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "apagar"];

export function TelaPin({
  referencia,
  aoEntrar,
}: {
  referencia: Referencia | null;
  aoEntrar: (operador: Operador) => void;
}) {
  const [pin, setPin] = useState("");
  const [verificando, setVerificando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function conferir(pinCompleto: string) {
    setVerificando(true);
    setErro(null);

    for (const candidato of referencia?.pins ?? []) {
      if (await pinConfere(pinCompleto, candidato.pinHash)) {
        const operador: Operador = {
          membershipId: candidato.membershipId,
          nome: candidato.nome,
        };
        await salvarOperador(operador);
        aoEntrar(operador);
        return;
      }
    }

    setErro("PIN inválido.");
    setPin("");
    setVerificando(false);
  }

  function tecla(valor: string) {
    if (verificando) return;

    if (valor === "apagar") {
      setPin((atual) => atual.slice(0, -1));
      setErro(null);
      return;
    }

    if (!valor || pin.length >= 4) return;

    const novoPin = pin + valor;
    setPin(novoPin);
    setErro(null);

    if (novoPin.length === 4) {
      conferir(novoPin);
    }
  }

  const semDados = !referencia || referencia.pins.length === 0;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-2xl font-bold">Digite seu PIN</h1>

      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`border-foreground h-5 w-5 rounded-full border-2 ${pin.length > i ? "bg-foreground" : ""}`}
          />
        ))}
      </div>

      {erro && (
        <p className="text-destructive text-center text-lg font-medium">
          {erro}
        </p>
      )}
      {semDados && (
        <p className="text-destructive text-center text-sm">
          Nenhum PIN salvo neste aparelho. Conecte à internet uma vez pra
          configurar.
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        {TECLAS.map((tecla_, i) =>
          tecla_ ? (
            <Button
              key={i}
              type="button"
              variant="outline"
              className="h-20 w-20 text-3xl"
              disabled={verificando}
              onClick={() => tecla(tecla_)}
            >
              {tecla_ === "apagar" ? "⌫" : tecla_}
            </Button>
          ) : (
            <div key={i} />
          ),
        )}
      </div>
    </div>
  );
}
