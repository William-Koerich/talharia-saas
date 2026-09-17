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

const estadoInicial: EstadoForm = { erro: null };

export function FormularioParte({
  acao,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, estadoInicial);

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-col gap-3 border-t pt-4"
    >
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="parte-nome">Nome da parte</Label>
          <Input id="parte-nome" name="nome" required />
        </div>
        <div className="flex w-24 flex-col gap-2">
          <Label htmlFor="parte-qtd">Qtd/peça</Label>
          <Input
            id="parte-qtd"
            name="qtd_por_peca"
            type="number"
            min="1"
            defaultValue={1}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="parte-sentido">Sentido do fio</Label>
          <Select name="sentido_fio" defaultValue="indiferente">
            <SelectTrigger id="parte-sentido" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fio_reto">Fio reto</SelectItem>
              <SelectItem value="vies">Viés</SelectItem>
              <SelectItem value="indiferente">Indiferente</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="par" />
          Par
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input type="checkbox" name="entretela" />
          Entretela
        </label>
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Adicionando..." : "Adicionar parte"}
      </Button>
    </form>
  );
}
