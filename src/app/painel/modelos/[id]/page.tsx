import Link from "next/link";
import { notFound } from "next/navigation";
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
import { FormularioModelo } from "../formulario-modelo";
import { atualizarModelo, excluirModelo } from "../actions";

export default async function PaginaModelo({
  params,
}: PageProps<"/painel/modelos/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: modelo }, { data: clientes }, { data: versoes }] =
    await Promise.all([
      supabase
        .from("modelos")
        .select("nome, cliente_id")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("clientes")
        .select("id, nome")
        .eq("ativo", true)
        .order("nome"),
      supabase
        .from("modelo_versoes")
        .select("id, versao, vigente, largura_exigida, eficiencia_encaixe")
        .eq("modelo_id", id)
        .order("versao", { ascending: false }),
    ]);

  if (!modelo) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Editar modelo</h1>
        <FormularioModelo
          modelo={modelo}
          clientes={clientes ?? []}
          acao={atualizarModelo.bind(null, id)}
        />
        <form action={excluirModelo.bind(null, id)}>
          <Button variant="destructive" type="submit">
            Excluir modelo
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Versões</h2>
          <Button
            render={<Link href={`/painel/modelos/${id}/versoes/novo`} />}
            nativeButton={false}
          >
            Nova versão
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Versão</TableHead>
              <TableHead>Largura exigida</TableHead>
              <TableHead>Eficiência do encaixe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versoes?.map((versao) => (
              <TableRow key={versao.id}>
                <TableCell>v{versao.versao}</TableCell>
                <TableCell>{versao.largura_exigida ?? "—"}</TableCell>
                <TableCell>
                  {versao.eficiencia_encaixe
                    ? `${versao.eficiencia_encaixe}%`
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={versao.vigente ? "default" : "secondary"}>
                    {versao.vigente ? "Vigente" : "Antiga"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <Link
                        href={`/painel/modelos/${id}/versoes/${versao.id}`}
                      />
                    }
                    nativeButton={false}
                  >
                    Abrir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
