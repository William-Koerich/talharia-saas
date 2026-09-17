import Link from "next/link";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TIPOS_MAQUINA } from "@/lib/tipos-maquina";
import { alternarAtivoMaquina } from "./actions";

export default async function PaginaMaquinas({
  searchParams,
}: PageProps<"/painel/maquinas">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: maquinas } = await supabase
    .from("maquinas")
    .select("id, nome, tipo, custo_hora, ativo")
    .order("nome");

  const rotuloTipo = (tipo: string) =>
    TIPOS_MAQUINA.find((t) => t.value === tipo)?.label ?? tipo;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Máquinas</h1>
        <Button
          render={<Link href="/painel/maquinas/novo" />}
          nativeButton={false}
        >
          Nova máquina
        </Button>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Custo/hora</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {maquinas?.map((maquina) => (
            <TableRow key={maquina.id}>
              <TableCell>{maquina.nome}</TableCell>
              <TableCell>{rotuloTipo(maquina.tipo)}</TableCell>
              <TableCell>
                {maquina.custo_hora.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>
                <Badge variant={maquina.ativo ? "default" : "secondary"}>
                  {maquina.ativo ? "Ativa" : "Inativa"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/painel/maquinas/${maquina.id}`} />}
                  nativeButton={false}
                >
                  Editar
                </Button>
                <form
                  action={alternarAtivoMaquina.bind(
                    null,
                    maquina.id,
                    !maquina.ativo,
                  )}
                >
                  <Button variant="ghost" size="sm" type="submit">
                    {maquina.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {maquinas?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                Nenhuma máquina cadastrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
