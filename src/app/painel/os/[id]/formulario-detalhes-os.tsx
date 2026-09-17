"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "../actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioDetalhesOS({
  prazo,
  precoAcordado,
  acao,
}: {
  prazo: string | null;
  precoAcordado: number | null;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-wrap items-end gap-3"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="prazo">Prazo</Label>
        <Input id="prazo" name="prazo" type="date" defaultValue={prazo ?? ""} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="preco_acordado">Preço acordado (R$)</Label>
        <Input
          id="preco_acordado"
          name="preco_acordado"
          type="number"
          step="0.01"
          min="0"
          defaultValue={precoAcordado ?? ""}
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
      {estado.erro && (
        <p className="text-destructive w-full text-sm">{estado.erro}</p>
      )}
    </form>
  );
}
