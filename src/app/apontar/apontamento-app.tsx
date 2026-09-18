"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  lerApontamentoAtivo,
  lerOperador,
  limparApontamentoAtivo,
  limparOperador,
} from "@/lib/apontamento/db";
import type {
  ApontamentoAtivo,
  OSAtiva,
  Operador,
} from "@/lib/apontamento/tipos";
import { useSincronizacao } from "./usar-sync";
import { TelaPin } from "./tela-pin";
import { TelaBuscarOS } from "./tela-buscar-os";
import { TelaMaquinaOperacao } from "./tela-maquina-operacao";
import { TelaAtiva } from "./tela-ativo";

type Tela = "carregando" | "pin" | "buscar_os" | "maquina_operacao" | "ativo";

function inscreverStatusRede(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function ApontamentoApp() {
  const {
    referencia,
    pendentes,
    sincronizando,
    aviso,
    limparAviso,
    sincronizarAgora,
  } = useSincronizacao();
  const [tela, setTela] = useState<Tela>("carregando");
  const [operador, setOperador] = useState<Operador | null>(null);
  const [osSelecionada, setOsSelecionada] = useState<OSAtiva | null>(null);
  const [ativo, setAtivo] = useState<ApontamentoAtivo | null>(null);
  const online = useSyncExternalStore(
    inscreverStatusRede,
    () => navigator.onLine,
    () => true,
  );

  useEffect(() => {
    (async () => {
      const [op, at] = await Promise.all([
        lerOperador(),
        lerApontamentoAtivo(),
      ]);
      if (!op) {
        setTela("pin");
        return;
      }
      setOperador(op);
      if (at) {
        setAtivo(at);
        setTela("ativo");
      } else {
        setTela("buscar_os");
      }
    })();
  }, []);

  async function trocarOperador() {
    await limparOperador();
    await limparApontamentoAtivo();
    setOperador(null);
    setOsSelecionada(null);
    setAtivo(null);
    setTela("pin");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="bg-muted flex items-center justify-between px-4 py-1 text-xs">
        <span>
          {!online ? "Offline" : sincronizando ? "Sincronizando…" : "Online"}
        </span>
        {pendentes > 0 && <span>{pendentes} pendente(s)</span>}
      </div>

      {aviso && (
        <div className="bg-destructive/10 text-destructive flex items-center justify-between px-4 py-2 text-sm">
          <span>{aviso}</span>
          <button onClick={limparAviso} className="ml-2 shrink-0">
            ✕
          </button>
        </div>
      )}

      {tela === "carregando" && (
        <div className="flex flex-1 items-center justify-center">
          Carregando…
        </div>
      )}

      {tela === "pin" && (
        <TelaPin
          referencia={referencia}
          aoEntrar={(op) => {
            setOperador(op);
            setTela("buscar_os");
          }}
        />
      )}

      {tela === "buscar_os" && operador && (
        <TelaBuscarOS
          referencia={referencia}
          nomeOperador={operador.nome}
          aoEncontrarOS={(os) => {
            setOsSelecionada(os);
            setTela("maquina_operacao");
          }}
          aoTrocarOperador={trocarOperador}
        />
      )}

      {tela === "maquina_operacao" && osSelecionada && operador && (
        <TelaMaquinaOperacao
          referencia={referencia}
          os={osSelecionada}
          operador={operador}
          aoIniciar={(novoAtivo) => {
            setAtivo(novoAtivo);
            setTela("ativo");
            sincronizarAgora();
          }}
          aoVoltar={() => setTela("buscar_os")}
        />
      )}

      {tela === "ativo" && ativo && (
        <TelaAtiva
          referencia={referencia}
          ativo={ativo}
          aoAtualizar={(novoAtivo) => {
            setAtivo(novoAtivo);
            sincronizarAgora();
          }}
          aoFinalizar={() => {
            setAtivo(null);
            setOsSelecionada(null);
            setTela("buscar_os");
            sincronizarAgora();
          }}
        />
      )}
    </div>
  );
}
