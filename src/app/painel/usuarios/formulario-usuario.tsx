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
import { criarUsuario, type EstadoForm } from "./actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioUsuario() {
  const [estado, formAction, pending] = useActionState(
    criarUsuario,
    estadoInicial,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha temporária</Label>
        <Input id="senha" name="senha" type="password" minLength={6} required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="role">Papel</Label>
        <Select name="role" defaultValue="OPERADOR">
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
            <SelectItem value="OPERADOR">OPERADOR</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Criando..." : "Criar usuário"}
      </Button>
    </form>
  );
}
