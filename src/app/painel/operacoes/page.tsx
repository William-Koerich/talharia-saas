import Link from "next/link";
import { Plus } from "lucide-react";
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
import { alternarAtivoOperacao } from "./actions";

export default async function PaginaOperacoes({
  searchParams,
}: PageProps<"/painel/operacoes">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: operacoes } = await supabase
    .from("operacoes")
    .select("id, nome, ativo, maquinas(nome)")
    .order("nome");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Operações"
        description="Etapas do processo de corte usadas no apontamento"
        actions={
          <Button
            render={<Link href="/painel/operacoes/novo" />}
            nativeButton={false}
          >
            <Plus className="size-4" />
            Nova operação
          </Button>
        }
      />

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Máquina padrão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operacoes?.map((operacao) => (
                <TableRow key={operacao.id}>
                  <TableCell className="capitalize">{operacao.nome}</TableCell>
                  <TableCell>
                    {(operacao.maquinas as unknown as { nome: string } | null)
                      ?.nome ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={operacao.ativo ? "default" : "secondary"}>
                      {operacao.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={
                        <Link href={`/painel/operacoes/${operacao.id}`} />
                      }
                      nativeButton={false}
                    >
                      Editar
                    </Button>
                    <form
                      action={alternarAtivoOperacao.bind(
                        null,
                        operacao.id,
                        !operacao.ativo,
                      )}
                    >
                      <Button variant="ghost" size="sm" type="submit">
                        {operacao.ativo ? "Desativar" : "Ativar"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {operacoes?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-muted-foreground text-center"
                  >
                    Nenhuma operação cadastrada.
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
