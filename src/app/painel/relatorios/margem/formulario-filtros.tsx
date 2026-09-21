"use client";

import { useSearchParams } from "next/navigation";
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

type Opcao = { id: string; nome: string };

export function FormularioFiltrosMargem({ clientes }: { clientes: Opcao[] }) {
  const searchParams = useSearchParams();

  return (
    <form method="get" className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="data_inicio">De</Label>
        <Input
          id="data_inicio"
          name="data_inicio"
          type="date"
          defaultValue={searchParams.get("data_inicio") ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="data_fim">Até</Label>
        <Input
          id="data_fim"
          name="data_fim"
          type="date"
          defaultValue={searchParams.get("data_fim") ?? ""}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cliente_id">Cliente</Label>
        <Select
          name="cliente_id"
          defaultValue={searchParams.get("cliente_id") ?? ""}
        >
          <SelectTrigger id="cliente_id" className="w-44">
            <SelectValue>
              {(valor: string | null) =>
                clientes.find((c) => c.id === valor)?.nome ?? "Todos"
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {clientes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Filtrar</Button>
    </form>
  );
}
