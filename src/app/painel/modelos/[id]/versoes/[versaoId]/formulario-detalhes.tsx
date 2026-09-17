"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { marcarVigente, type EstadoForm } from "./actions";

const estadoInicial: EstadoForm = { erro: null };

type Versao = {
  largura_exigida: number | null;
  eficiencia_encaixe: number | null;
  vigente: boolean;
};

export function FormularioDetalhes({
  versao,
  modeloId,
  versaoId,
  acao,
}: {
  versao: Versao;
  modeloId: string;
  versaoId: string;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex max-w-md flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="largura_exigida">Largura exigida (m)</Label>
          <Input
            id="largura_exigida"
            name="largura_exigida"
            type="number"
            step="0.01"
            min="0"
            defaultValue={versao.largura_exigida ?? ""}
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
            defaultValue={versao.eficiencia_encaixe ?? ""}
          />
        </div>
        {estado.erro && (
          <p className="text-destructive text-sm">{estado.erro}</p>
        )}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Salvando..." : "Salvar"}
        </Button>
      </form>

      {!versao.vigente && (
        <form action={marcarVigente.bind(null, modeloId, versaoId)}>
          <Button type="submit" variant="outline">
            Marcar como versão vigente
          </Button>
        </form>
      )}
    </div>
  );
}
