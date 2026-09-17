"use client";

import { useActionState, useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { criarOS, type EstadoForm, type ItemGrade } from "./actions";

type Cliente = { id: string; nome: string };
type Modelo = {
  id: string;
  nome: string;
  cliente_id: string;
  modelo_versao_id: string;
  versao: number;
};

const estadoInicial: EstadoForm = { erro: null };

export function FormularioOS({
  clientes,
  modelos,
}: {
  clientes: Cliente[];
  modelos: Modelo[];
}) {
  const [estado, formAction, pending] = useActionState(criarOS, estadoInicial);
  const [clienteId, setClienteId] = useState("");
  const [grade, setGrade] = useState<ItemGrade[]>([
    { tamanho: "", cor: "", quantidade: 0 },
  ]);

  const modelosDoCliente = useMemo(
    () => modelos.filter((m) => m.cliente_id === clienteId),
    [modelos, clienteId],
  );

  function atualizarItem(index: number, campo: keyof ItemGrade, valor: string) {
    setGrade((atual) =>
      atual.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: campo === "quantidade" ? Number(valor) || 0 : valor,
            }
          : item,
      ),
    );
  }

  function adicionarLinha() {
    setGrade((atual) => [...atual, { tamanho: "", cor: "", quantidade: 0 }]);
  }

  function removerLinha(index: number) {
    setGrade((atual) => atual.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cliente_id">Cliente</Label>
        <Select
          name="cliente_id"
          value={clienteId}
          onValueChange={(valor) => setClienteId(valor ?? "")}
        >
          <SelectTrigger id="cliente_id" className="w-full">
            <SelectValue>
              {(valor: string | null) =>
                clientes.find((c) => c.id === valor)?.nome ??
                "Selecione o cliente"
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="modelo_versao_id">Modelo</Label>
        <Select key={clienteId} name="modelo_versao_id" disabled={!clienteId}>
          <SelectTrigger id="modelo_versao_id" className="w-full">
            <SelectValue>
              {(valor: string | null) => {
                const modelo = modelosDoCliente.find(
                  (m) => m.modelo_versao_id === valor,
                );
                if (modelo) return `${modelo.nome} (v${modelo.versao} vigente)`;
                return clienteId
                  ? "Selecione o modelo"
                  : "Selecione um cliente primeiro";
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {modelosDoCliente.map((modelo) => (
              <SelectItem
                key={modelo.modelo_versao_id}
                value={modelo.modelo_versao_id}
              >
                {modelo.nome} (v{modelo.versao} vigente)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {clienteId && modelosDoCliente.length === 0 && (
          <p className="text-muted-foreground text-sm">
            Esse cliente não tem modelo com versão vigente.
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="prazo">Prazo</Label>
          <Input id="prazo" name="prazo" type="date" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="preco_acordado">Preço acordado (R$)</Label>
          <Input
            id="preco_acordado"
            name="preco_acordado"
            type="number"
            step="0.01"
            min="0"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Grade (tamanho × cor × quantidade)</Label>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tamanho</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {grade.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.tamanho}
                    onChange={(e) =>
                      atualizarItem(index, "tamanho", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.cor}
                    onChange={(e) =>
                      atualizarItem(index, "cor", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantidade || ""}
                    onChange={(e) =>
                      atualizarItem(index, "quantidade", e.target.value)
                    }
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removerLinha(index)}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={adicionarLinha}
        >
          Adicionar tamanho
        </Button>
      </div>

      <input type="hidden" name="grade" value={JSON.stringify(grade)} />
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Criando..." : "Criar OS"}
      </Button>
    </form>
  );
}
