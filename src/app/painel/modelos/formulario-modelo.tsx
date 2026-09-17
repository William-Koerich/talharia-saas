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

type Modelo = { nome: string; cliente_id: string };
type Cliente = { id: string; nome: string };

const estadoInicial: EstadoForm = { erro: null };

export function FormularioModelo({
  modelo,
  clientes,
  acao,
}: {
  modelo?: Modelo;
  clientes: Cliente[];
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={modelo?.nome} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cliente_id">Cliente</Label>
        <Select name="cliente_id" defaultValue={modelo?.cliente_id}>
          <SelectTrigger id="cliente_id" className="w-full">
            <SelectValue>
              {(valor: string | null) =>
                clientes.find((c) => c.id === valor)?.nome ?? "Selecione o cliente"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
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
