"use client";

import { useActionState } from "react";
import Link from "next/link";
import { cadastrar, type EstadoFormAuth } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const estadoInicial: EstadoFormAuth = { erro: null };

export function FormularioCadastro() {
  const [estado, formAction, pending] = useActionState(
    cadastrar,
    estadoInicial,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nome">Seu nome</Label>
        <Input id="nome" name="nome" type="text" required autoComplete="name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="nomeEmpresa">Nome da empresa</Label>
        <Input id="nomeEmpresa" name="nomeEmpresa" type="text" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Já tem uma conta?{" "}
        <Link
          href="/entrar"
          className="text-primary underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </form>
  );
}
