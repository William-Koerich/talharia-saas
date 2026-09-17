"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { EstadoForm } from "../actions";
import { importarClientesCsv } from "./actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioImportar() {
  const [estado, formAction, pending] = useActionState(
    importarClientesCsv,
    estadoInicial,
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="arquivo">Arquivo CSV</Label>
        <Input
          id="arquivo"
          name="arquivo"
          type="file"
          accept=".csv,text/csv"
          required
        />
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Importando..." : "Importar"}
      </Button>
    </form>
  );
}
