"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "../actions";

type Fardo = {
  id: string;
  etiquetaCodigo: string;
  descricao: string | null;
  osNumero: number;
};

export function FormularioRomaneio({
  clienteId,
  fardos,
  acao,
}: {
  clienteId: string;
  fardos: Fardo[];
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, {
    erro: null,
  } as EstadoForm);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="cliente_id" value={clienteId} />

      <p className="text-sm font-medium">Fardos prontos para entrega</p>
      <div className="flex flex-col gap-2 rounded border p-3">
        {fardos.map((fardo) => (
          <label key={fardo.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="fardo_id" value={fardo.id} />
            OS #{fardo.osNumero} — {fardo.etiquetaCodigo}
            {fardo.descricao ? ` (${fardo.descricao})` : ""}
          </label>
        ))}
        {fardos.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Nenhum fardo pronto disponível para este cliente.
          </p>
        )}
      </div>

      <Button type="submit" disabled={pending || fardos.length === 0} className="w-fit">
        {pending ? "Criando..." : "Criar romaneio"}
      </Button>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
    </form>
  );
}
