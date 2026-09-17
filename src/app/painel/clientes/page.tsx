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
import { alternarAtivoCliente } from "./actions";

export default async function PaginaClientes({
  searchParams,
}: PageProps<"/painel/clientes">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome, documento, contato, ativo")
    .order("nome");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={<Link href="/painel/clientes/importar" />}
            nativeButton={false}
          >
            Importar CSV
          </Button>
          <Button
            render={<Link href="/painel/clientes/novo" />}
            nativeButton={false}
          >
            Novo cliente
          </Button>
        </div>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Documento</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes?.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.nome}</TableCell>
              <TableCell>{cliente.documento ?? "—"}</TableCell>
              <TableCell>{cliente.contato ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={cliente.ativo ? "default" : "secondary"}>
                  {cliente.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  render={<Link href={`/painel/clientes/${cliente.id}`} />}
                  nativeButton={false}
                >
                  Editar
                </Button>
                <form
                  action={alternarAtivoCliente.bind(
                    null,
                    cliente.id,
                    !cliente.ativo,
                  )}
                >
                  <Button variant="ghost" size="sm" type="submit">
                    {cliente.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {clientes?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                Nenhum cliente cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
