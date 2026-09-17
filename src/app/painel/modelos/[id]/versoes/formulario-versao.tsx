"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "./actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioVersao({
  acao,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="largura_exigida">Largura exigida (m)</Label>
        <Input
          id="largura_exigida"
          name="largura_exigida"
          type="number"
          step="0.01"
          min="0"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="eficiencia_encaixe">Eficiência do encaixe (%)</Label>
        <Input
          id="eficiencia_encaixe"
          name="eficiencia_encaixe"
          type="number"
          step="0.01"
          min="0"
          max="100"
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar versão"}
      </Button>
    </form>
  );
}
