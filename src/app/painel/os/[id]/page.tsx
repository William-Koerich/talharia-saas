import Link from "next/link";
import { notFound } from "next/navigation";
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
import { SeletorStatus } from "./seletor-status";
import { FormularioDetalhesOS } from "./formulario-detalhes-os";
import { FormularioRolo } from "./formulario-rolo";
import { atualizarOS, excluirOS, adicionarRolo, removerRolo } from "../actions";

export default async function PaginaOSDetalhe({
  params,
}: PageProps<"/painel/os/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: os }, { data: grade }, { data: rolosVinculados }] =
    await Promise.all([
      supabase
        .from("ordens_servico")
        .select(
          "numero, status, prazo, preco_acordado, clientes(nome), modelo_versoes(versao, vigente, modelos(nome))",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("os_grades")
        .select("tamanho, cor, quantidade")
        .eq("os_id", id)
        .order("tamanho"),
      supabase
        .from("os_rolo_consumo")
        .select(
          "id, metros_consumidos, rolos(id, partida, cor, origem, metragem)",
        )
        .eq("os_id", id),
    ]);

  if (!os) notFound();

  const cliente = os.clientes as unknown as { nome: string } | null;
  const versao = os.modelo_versoes as unknown as {
    versao: number;
    vigente: boolean;
    modelos: { nome: string } | null;
  } | null;

  const rolos = (rolosVinculados ?? []).map((r) => ({
    id: r.id,
    metrosConsumidos: r.metros_consumidos,
    rolo: r.rolos as unknown as {
      id: string;
      partida: string | null;
      cor: string | null;
      origem: string;
      metragem: number;
    } | null,
  }));

  const partidasDistintas = new Set(
    rolos.map((r) => r.rolo?.partida).filter((p): p is string => !!p),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">OS #{os.numero}</h1>
          <p className="text-muted-foreground text-sm">
            {cliente?.nome ?? "—"} · {versao?.modelos?.nome ?? "—"} (v
            {versao?.versao})
          </p>
        </div>
        <Button
          variant="outline"
          render={<Link href={`/painel/os/${id}/ficha`} />}
          nativeButton={false}
        >
          Ficha para impressão
        </Button>
      </div>

      {versao && !versao.vigente && (
        <p className="text-destructive text-sm">
          Atenção: esta OS usa uma versão do modelo que não é mais a vigente.
        </p>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Status</h2>
        <SeletorStatus osId={id} status={os.status} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Detalhes</h2>
        <FormularioDetalhesOS
          prazo={os.prazo}
          precoAcordado={os.preco_acordado}
          acao={atualizarOS.bind(null, id)}
        />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Grade</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tamanho</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Quantidade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grade?.map((item, i) => (
              <TableRow key={i}>
                <TableCell>{item.tamanho}</TableCell>
                <TableCell>{item.cor}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Rolos vinculados</h2>
        {partidasDistintas.size > 1 && (
          <p className="text-destructive text-sm">
            Atenção: os rolos vinculados a esta OS têm partidas diferentes (
            {Array.from(partidasDistintas).join(", ")}) — pode gerar variação de
            cor no mesmo enfesto.
          </p>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Origem</TableHead>
              <TableHead>Partida</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Metros consumidos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rolos.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.rolo?.origem}</TableCell>
                <TableCell>{item.rolo?.partida ?? "—"}</TableCell>
                <TableCell>{item.rolo?.cor ?? "—"}</TableCell>
                <TableCell>{item.metrosConsumidos}</TableCell>
                <TableCell className="text-right">
                  <form action={removerRolo.bind(null, id, item.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      Remover
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {rolos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground text-center"
                >
                  Nenhum rolo vinculado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <FormularioRolo acao={adicionarRolo.bind(null, id)} />
      </section>

      <form action={excluirOS.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir OS
        </Button>
      </form>
    </div>
  );
}
