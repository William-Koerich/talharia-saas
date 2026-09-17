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
import { alternarAtivoConsumivel } from "./actions";

export default async function PaginaConsumiveis({
  searchParams,
}: PageProps<"/painel/consumiveis">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: consumiveis } = await supabase
    .from("consumiveis")
    .select("id, nome, unidade, custo_unitario, ativo")
    .order("nome");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Consumíveis</h1>
        <Button
          render={<Link href="/painel/consumiveis/novo" />}
          nativeButton={false}
        >
          Novo consumível
        </Button>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Unidade</TableHead>
            <TableHead>Custo unitário</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consumiveis?.map((consumivel) => (
            <TableRow key={consumivel.id}>
              <TableCell>{consumivel.nome}</TableCell>
              <TableCell>{consumivel.unidade}</TableCell>
              <TableCell>
                {consumivel.custo_unitario.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
              <TableCell>
                <Badge variant={consumivel.ativo ? "default" : "secondary"}>
                  {consumivel.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  render={
                    <Link href={`/painel/consumiveis/${consumivel.id}`} />
                  }
                >
                  Editar
                </Button>
                <form
                  action={alternarAtivoConsumivel.bind(
                    null,
                    consumivel.id,
                    !consumivel.ativo,
                  )}
                >
                  <Button variant="ghost" size="sm" type="submit">
                    {consumivel.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
          {consumiveis?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground text-center"
              >
                Nenhum consumível cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
