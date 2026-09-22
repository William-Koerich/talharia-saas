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

const ROTULO_STATUS: Record<string, string> = {
  rascunho: "Rascunho",
  conferido: "Conferido",
  entregue: "Entregue",
};

const VARIANTE_STATUS: Record<string, "secondary" | "default" | "outline"> = {
  rascunho: "secondary",
  conferido: "outline",
  entregue: "default",
};

export default async function PaginaRomaneios({
  searchParams,
}: PageProps<"/painel/romaneios">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data: romaneios } = await supabase
    .from("romaneios")
    .select("id, status, data_entrega, created_at, clientes(nome)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Romaneios</h1>
        <Button render={<Link href="/painel/romaneios/novo" />} nativeButton={false}>
          Novo romaneio
        </Button>
      </div>

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de entrega</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {romaneios?.map((romaneio) => {
            const cliente = romaneio.clientes as unknown as { nome: string } | null;
            return (
              <TableRow key={romaneio.id}>
                <TableCell>{cliente?.nome ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={VARIANTE_STATUS[romaneio.status] ?? "secondary"}>
                    {ROTULO_STATUS[romaneio.status] ?? romaneio.status}
                  </Badge>
                </TableCell>
                <TableCell>{romaneio.data_entrega ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link href={`/painel/romaneios/${romaneio.id}`} />}
                    nativeButton={false}
                  >
                    Ver
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {romaneios?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-muted-foreground text-center">
                Nenhum romaneio cadastrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
