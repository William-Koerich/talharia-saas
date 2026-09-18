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
import type { EstadoForm } from "./enfesto-actions";

const TIPOS_SOBRA = [
  { value: "retalho", label: "Retalho" },
  { value: "ponta", label: "Ponta" },
  { value: "emenda", label: "Emenda" },
] as const;

type Enfesto = { id: string; folhas: number; comprimento: number };

export function FormularioSobra({
  enfestos,
  acao,
}: {
  enfestos: Enfesto[];
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, {
    erro: null,
  } as EstadoForm);

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-wrap items-end gap-3 border-t pt-4"
    >
      {enfestos.length > 0 && (
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="enfesto_id">Enfesto (opcional)</Label>
          <Select name="enfesto_id" defaultValue="">
            <SelectTrigger id="enfesto_id" className="w-full">
              <SelectValue>
                {(valor: string | null) => {
                  const enfesto = enfestos.find((e) => e.id === valor);
                  return enfesto
                    ? `${enfesto.folhas} folhas × ${enfesto.comprimento}m`
                    : "Nenhum";
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {enfestos.map((enfesto) => (
                <SelectItem key={enfesto.id} value={enfesto.id}>
                  {enfesto.folhas} folhas × {enfesto.comprimento}m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo-sobra">Tipo</Label>
        <Select name="tipo" defaultValue="retalho">
          <SelectTrigger id="tipo-sobra" className="w-36">
            <SelectValue>
              {(valor: string | null) =>
                TIPOS_SOBRA.find((t) => t.value === valor)?.label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {TIPOS_SOBRA.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="metros-sobra">Metros</Label>
        <Input
          id="metros-sobra"
          name="metros"
          type="number"
          step="0.01"
          min="0"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="valor-sobra">Valor (R$) — opcional</Label>
        <Input
          id="valor-sobra"
          name="valor"
          type="number"
          step="0.01"
          min="0"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Registrar sobra"}
      </Button>
      {estado.erro && (
        <p className="text-destructive w-full text-sm">{estado.erro}</p>
      )}
    </form>
  );
}
