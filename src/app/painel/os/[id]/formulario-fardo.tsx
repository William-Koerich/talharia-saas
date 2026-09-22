"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "./fardo-actions";

export function FormularioFardo({
  acao,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, {
    erro: null,
  } as EstadoForm);

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-wrap items-end gap-3 border-t pt-4"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="descricao-fardo">Descrição (opcional)</Label>
        <Input id="descricao-fardo" name="descricao" placeholder="Ex.: dianteira P/M" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar fardo"}
      </Button>
      {estado.erro && (
        <p className="text-destructive w-full text-sm">{estado.erro}</p>
      )}
    </form>
  );
}
