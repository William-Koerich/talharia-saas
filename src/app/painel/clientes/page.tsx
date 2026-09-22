import Link from "next/link";
import { UserPlus, Upload } from "lucide-react";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Clientes"
        description="Confecções e clientes atendidos pela talharia"
        actions={
          <>
            <Button
              variant="outline"
              render={<Link href="/painel/clientes/importar" />}
              nativeButton={false}
            >
              <Upload className="size-4" />
              Importar CSV
            </Button>
            <Button
              render={<Link href="/painel/clientes/novo" />}
              nativeButton={false}
            >
              <UserPlus className="size-4" />
              Novo cliente
            </Button>
          </>
        }
      />

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <Card>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}
