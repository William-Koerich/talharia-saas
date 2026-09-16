"use client";

import { useActionState } from "react";
import Link from "next/link";
import { entrar, type EstadoFormAuth } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const estadoInicial: EstadoFormAuth = { erro: null };

export function FormularioEntrar() {
  const [estado, formAction, pending] = useActionState(entrar, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
          autoComplete="current-password"
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        Não tem uma conta?{" "}
        <Link
          href="/cadastro"
          className="text-primary underline-offset-4 hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
