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
import { alternarAtivoMotivoParada } from "./actions";

export default async function PaginaMotivosParada({
  searchParams,
}: PageProps<"/painel/motivos-parada">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: motivos } = await supabase
    .from("motivos_parada")
    .select("id, nome, ativo")
    .order("nome");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Motivos de parada"
        description="Motivos usados nos apontamentos de parada"
        actions={
          <Button
            render={<Link href="/painel/motivos-parada/novo" />}
            nativeButton={false}
          >
            <Plus className="size-4" />
            Novo motivo
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
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {motivos?.map((motivo) => (
                <TableRow key={motivo.id}>
                  <TableCell className="capitalize">{motivo.nome}</TableCell>
                  <TableCell>
                    <Badge variant={motivo.ativo ? "default" : "secondary"}>
                      {motivo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={
                        <Link href={`/painel/motivos-parada/${motivo.id}`} />
                      }
                      nativeButton={false}
                    >
                      Editar
                    </Button>
                    <form
                      action={alternarAtivoMotivoParada.bind(
                        null,
                        motivo.id,
                        !motivo.ativo,
                      )}
                    >
                      <Button variant="ghost" size="sm" type="submit">
                        {motivo.ativo ? "Desativar" : "Ativar"}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {motivos?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-muted-foreground text-center"
                  >
                    Nenhum motivo cadastrado.
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
