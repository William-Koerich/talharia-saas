"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "../actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioCustoHora({
  custoHora,
  acao,
}: {
  custoHora: number | null;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-xs flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="custo_hora">Custo por hora (R$)</Label>
        <Input
          id="custo_hora"
          name="custo_hora"
          type="number"
          step="0.01"
          min="0"
          defaultValue={custoHora ?? ""}
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
