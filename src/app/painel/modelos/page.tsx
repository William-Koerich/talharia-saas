import Link from "next/link";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Modelos</h1>
        <Button
          render={<Link href="/painel/modelos/novo" />}
          nativeButton={false}
        >
          Novo modelo
        </Button>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}

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
    </div>
  );
}
