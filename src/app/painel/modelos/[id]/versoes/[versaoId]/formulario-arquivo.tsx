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
import {
  TIPOS_ARQUIVO_MODELO,
  EXTENSOES_POR_TIPO,
} from "@/lib/tipos-arquivo-modelo";
import type { EstadoForm } from "./actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioArquivo({
  acao,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form
      action={formAction}
      className="flex max-w-md flex-wrap items-end gap-3"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select name="tipo" defaultValue="croqui">
          <SelectTrigger id="tipo" className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIPOS_ARQUIVO_MODELO.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="arquivo">Arquivo</Label>
        <Input
          id="arquivo"
          name="arquivo"
          type="file"
          accept={Object.values(EXTENSOES_POR_TIPO).join(",")}
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Enviar"}
      </Button>
      {estado.erro && (
        <p className="text-destructive w-full text-sm">{estado.erro}</p>
      )}
    </form>
  );
}
