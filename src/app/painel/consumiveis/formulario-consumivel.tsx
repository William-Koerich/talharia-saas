"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "./actions";

type Consumivel = {
  nome: string;
  unidade: string;
  custo_unitario: number;
};

const estadoInicial: EstadoForm = { erro: null };

export function FormularioConsumivel({
  consumivel,
  acao,
}: {
  consumivel?: Consumivel;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={consumivel?.nome} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="unidade">Unidade</Label>
        <Input
          id="unidade"
          name="unidade"
          placeholder="metro, unidade, kg..."
          defaultValue={consumivel?.unidade}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="custo_unitario">Custo unitário (R$)</Label>
        <Input
          id="custo_unitario"
          name="custo_unitario"
          type="number"
          step="0.01"
          min="0"
          defaultValue={consumivel?.custo_unitario}
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
