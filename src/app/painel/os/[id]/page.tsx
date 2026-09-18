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
import { Badge } from "@/components/ui/badge";
import { SeletorStatus } from "./seletor-status";
import { FormularioDetalhesOS } from "./formulario-detalhes-os";
import { FormularioRolo } from "./formulario-rolo";
import { FormularioEnfesto } from "./formulario-enfesto";
import { FormularioSobra } from "./formulario-sobra";
import { atualizarOS, excluirOS, adicionarRolo, removerRolo } from "../actions";
import {
  criarEnfesto,
  excluirEnfesto,
  criarSobra,
  excluirSobra,
} from "./enfesto-actions";

const ROTULO_TIPO_SOBRA: Record<string, string> = {
  retalho: "Retalho",
  ponta: "Ponta",
  emenda: "Emenda",
};

export default async function PaginaOSDetalhe({
  params,
}: PageProps<"/painel/os/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const [
    { data: os },
    { data: grade },
    { data: rolosVinculados },
    { data: enfestosData },
    { data: sobrasData },
    { data: aproveitamento },
  ] = await Promise.all([
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
    supabase
      .from("enfestos")
      .select("id, folhas, comprimento, created_at")
      .eq("os_id", id)
      .order("created_at"),
    supabase
      .from("sobras")
      .select("id, tipo, metros, valor, enfesto_id")
      .eq("os_id", id)
      .order("created_at"),
    supabase
      .from("os_aproveitamento")
      .select("consumo_teorico, consumo_real, perda_metros, perda_percentual")
      .eq("os_id", id)
      .maybeSingle(),
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

  const rolosDaOS = rolos
    .filter((r) => r.rolo)
    .map((r) => ({
      id: r.rolo!.id,
      partida: r.rolo!.partida,
      cor: r.rolo!.cor,
    }));

  const enfestos = enfestosData ?? [];
  const sobras = sobrasData ?? [];

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

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Enfestos</h2>
        {aproveitamento && (
          <div className="bg-muted flex flex-wrap gap-4 rounded p-3 text-sm">
            <span>
              Teórico: {Number(aproveitamento.consumo_teorico).toFixed(2)} m
            </span>
            <span>
              Real: {Number(aproveitamento.consumo_real).toFixed(2)} m
            </span>
            <span>
              Perda: {Number(aproveitamento.perda_metros).toFixed(2)} m
            </span>
            <span>
              {aproveitamento.perda_percentual != null
                ? `${aproveitamento.perda_percentual}% de perda sobre o real`
                : "Sem enfesto registrado ainda"}
            </span>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Folhas</TableHead>
              <TableHead>Comprimento</TableHead>
              <TableHead>Consumo (folhas × comprimento)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enfestos.map((enfesto) => (
              <TableRow key={enfesto.id}>
                <TableCell>{enfesto.folhas}</TableCell>
                <TableCell>{enfesto.comprimento} m</TableCell>
                <TableCell>
                  {(enfesto.folhas * enfesto.comprimento).toFixed(2)} m
                </TableCell>
                <TableCell className="text-right">
                  <form action={excluirEnfesto.bind(null, id, enfesto.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      Remover
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {enfestos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  Nenhum enfesto registrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <FormularioEnfesto
          rolosDaOS={rolosDaOS}
          acao={criarEnfesto.bind(null, id)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sobras</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Metros</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sobras.map((sobra) => (
              <TableRow key={sobra.id}>
                <TableCell>
                  <Badge variant="secondary">
                    {ROTULO_TIPO_SOBRA[sobra.tipo] ?? sobra.tipo}
                  </Badge>
                </TableCell>
                <TableCell>{sobra.metros} m</TableCell>
                <TableCell>
                  {sobra.valor != null
                    ? Number(sobra.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <form action={excluirSobra.bind(null, id, sobra.id)}>
                    <Button variant="ghost" size="sm" type="submit">
                      Remover
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {sobras.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground text-center"
                >
                  Nenhuma sobra registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <FormularioSobra enfestos={enfestos} acao={criarSobra.bind(null, id)} />
      </section>

      <form action={excluirOS.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir OS
        </Button>
      </form>
    </div>
  );
}
