"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buscarReferenciaApontamento, sincronizarAcao } from "./actions";
import {
  contarFila,
  lerReferencia,
  listarFila,
  removerDaFila,
  salvarReferencia,
} from "@/lib/apontamento/db";
import type { Referencia } from "@/lib/apontamento/tipos";

const INTERVALO_RETENTATIVA_MS = 20_000;

export function useSincronizacao() {
  const [referencia, setReferencia] = useState<Referencia | null>(null);
  const [pendentes, setPendentes] = useState(0);
  const [sincronizando, setSincronizando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const drenandoRef = useRef(false);
  const reexecutarRef = useRef(false);

  const atualizarContagem = useCallback(async () => {
    setPendentes(await contarFila());
  }, []);

  const atualizarReferencia = useCallback(async () => {
    if (!navigator.onLine) return;
    const resultado = await buscarReferenciaApontamento();
    if ("erro" in resultado) return;
    await salvarReferencia(resultado);
    setReferencia(resultado);
  }, []);

  const drenarFila = useCallback(async () => {
    if (drenandoRef.current) {
      // Já tem uma drenagem em andamento: marca pra rodar de novo assim que
      // ela terminar, em vez de simplesmente descartar este pedido (uma ação
      // enfileirada logo em seguida de outra não pode ficar esperando o
      // próximo intervalo de 20s pra sincronizar).
      reexecutarRef.current = true;
      return;
    }
    if (!navigator.onLine) {
      // Mesmo sem tentar sincronizar, atualiza o contador de pendentes:
      // uma ação pode ter acabado de ser enfileirada offline.
      await atualizarContagem();
      return;
    }

    drenandoRef.current = true;
    setSincronizando(true);

    try {
      do {
        reexecutarRef.current = false;
        const fila = await listarFila();
        for (const acao of fila) {
          const resultado = await sincronizarAcao(acao);

          if (resultado.ok) {
            await removerDaFila(acao.id);
            continue;
          }

          if (resultado.motivo === "conflito") {
            await removerDaFila(acao.id);
            setAviso(
              "Conflito resolvido: outro apontamento já estava ativo pra esse operador. Este foi descartado.",
            );
            continue;
          }

          // Erro real (não é falta de conexão, essa já é filtrada por
          // navigator.onLine): para de tentar as próximas ações pra manter
          // a ordem, tenta de novo depois.
          reexecutarRef.current = false;
          break;
        }
      } while (reexecutarRef.current && navigator.onLine);
    } finally {
      drenandoRef.current = false;
      setSincronizando(false);
      await atualizarContagem();
    }
  }, [atualizarContagem]);

  useEffect(() => {
    (async () => {
      const cache = await lerReferencia();
      if (cache) setReferencia(cache);
      await atualizarContagem();
      await atualizarReferencia();
      await drenarFila();
    })();

    const aoConectar = () => {
      atualizarReferencia();
      drenarFila();
    };

    window.addEventListener("online", aoConectar);
    const intervalo = setInterval(drenarFila, INTERVALO_RETENTATIVA_MS);

    return () => {
      window.removeEventListener("online", aoConectar);
      clearInterval(intervalo);
    };
  }, [atualizarContagem, atualizarReferencia, drenarFila]);

  return {
    referencia,
    pendentes,
    sincronizando,
    aviso,
    limparAviso: () => setAviso(null),
    sincronizarAgora: drenarFila,
    atualizarContagem,
  };
}
