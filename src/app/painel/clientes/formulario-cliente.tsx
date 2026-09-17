"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EstadoForm } from "./actions";

type Cliente = {
  nome: string;
  documento: string | null;
  contato: string | null;
  endereco: string | null;
};

const estadoInicial: EstadoForm = { erro: null };

export function FormularioCliente({
  cliente,
  acao,
}: {
  cliente?: Cliente;
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" defaultValue={cliente?.nome} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="documento">CNPJ/CPF</Label>
        <Input
          id="documento"
          name="documento"
          defaultValue={cliente?.documento ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="contato">Contato</Label>
        <Input
          id="contato"
          name="contato"
          defaultValue={cliente?.contato ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Textarea
          id="endereco"
          name="endereco"
          defaultValue={cliente?.endereco ?? ""}
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
