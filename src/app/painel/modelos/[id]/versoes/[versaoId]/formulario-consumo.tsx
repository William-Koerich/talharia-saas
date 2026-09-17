"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "./actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioConsumo({
  acao,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-wrap items-end gap-3 border-t pt-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="tamanho">Tamanho</Label>
        <Input id="tamanho" name="tamanho" placeholder="P, M, G..." required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="consumo_metros">Consumo (m)</Label>
        <Input
          id="consumo_metros"
          name="consumo_metros"
          type="number"
          step="0.001"
          min="0"
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adicionando..." : "Adicionar"}
      </Button>
      {estado.erro && (
        <p className="text-destructive w-full text-sm">{estado.erro}</p>
      )}
    </form>
  );
}
