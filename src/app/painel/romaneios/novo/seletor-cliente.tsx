"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SeletorCliente({
  clientes,
  clienteId,
}: {
  clientes: { id: string; nome: string }[];
  clienteId: string;
}) {
  const router = useRouter();

  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Label htmlFor="cliente_id">Cliente</Label>
      <Select
        value={clienteId}
        onValueChange={(valor) =>
          router.push(`/painel/romaneios/novo?cliente_id=${valor}`)
        }
      >
        <SelectTrigger id="cliente_id">
          <SelectValue>
            {(valor: string | null) =>
              clientes.find((c) => c.id === valor)?.nome ?? "Selecione"
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clientes.map((cliente) => (
            <SelectItem key={cliente.id} value={cliente.id}>
              {cliente.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
