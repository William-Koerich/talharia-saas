"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstadoForm } from "./actions";

type Operacao = {
  nome: string;
  maquina_padrao_id: string | null;
};

type Maquina = { id: string; nome: string };

const estadoInicial: EstadoForm = { erro: null };

export function FormularioOperacao({
  operacao,
  maquinas,
  acao,
}: {
  operacao?: Operacao;
  maquinas: Maquina[];
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={operacao?.nome} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="maquina_padrao_id">Máquina padrão</Label>
        <Select
          name="maquina_padrao_id"
          defaultValue={operacao?.maquina_padrao_id ?? ""}
        >
          <SelectTrigger id="maquina_padrao_id" className="w-full">
            <SelectValue>
              {(valor: string | null) =>
                maquinas.find((m) => m.id === valor)?.nome ?? "Nenhuma"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhuma</SelectItem>
            {maquinas.map((maquina) => (
              <SelectItem key={maquina.id} value={maquina.id}>
                {maquina.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
