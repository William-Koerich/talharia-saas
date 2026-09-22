import Link from "next/link";
import { Plus } from "lucide-react";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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

export default async function PaginaModelos({
  searchParams,
}: PageProps<"/painel/modelos">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: modelos } = await supabase
    .from("modelos")
    .select("id, nome, clientes(nome)")
    .order("nome");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Modelos"
        description="Biblioteca de modelos e suas versões"
        actions={
          <Button
            render={<Link href="/painel/modelos/novo" />}
            nativeButton={false}
          >
            <Plus className="size-4" />
            Novo modelo
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
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelos?.map((modelo) => (
                <TableRow key={modelo.id}>
                  <TableCell>{modelo.nome}</TableCell>
                  <TableCell>
                    {(modelo.clientes as unknown as { nome: string } | null)
                      ?.nome ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link href={`/painel/modelos/${modelo.id}`} />}
                      nativeButton={false}
                    >
                      Abrir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {modelos?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Nenhum modelo cadastrado.
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
