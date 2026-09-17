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
import { ORIGENS_ROLO } from "@/lib/os-status";
import type { EstadoForm } from "../actions";

const estadoInicial: EstadoForm = { erro: null };

export function FormularioRolo({
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
      <input type="hidden" name="modo" value="novo" />
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="origem">Origem</Label>
          <Select name="origem" defaultValue="proprio">
            <SelectTrigger id="origem" className="w-full">
              <SelectValue>
                {(valor: string | null) => ORIGENS_ROLO.find((o) => o.value === valor)?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ORIGENS_ROLO.map((origem) => (
                <SelectItem key={origem.value} value={origem.value}>
                  {origem.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="partida">Partida</Label>
          <Input id="partida" name="partida" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="cor">Cor</Label>
          <Input id="cor" name="cor" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="metragem">Metragem do rolo (m)</Label>
          <Input
            id="metragem"
            name="metragem"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="largura">Largura (m)</Label>
          <Input
            id="largura"
            name="largura"
            type="number"
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="metros_consumidos">Metros consumidos nesta OS</Label>
          <Input
            id="metros_consumidos"
            name="metros_consumidos"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Vinculando..." : "Vincular rolo"}
      </Button>
    </form>
  );
}
