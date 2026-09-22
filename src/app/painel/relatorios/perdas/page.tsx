import { TrendingDown } from "lucide-react";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormularioFiltros } from "./formulario-filtros";

type LinhaAproveitamento = {
  os_id: string;
  numero: number;
  cliente_id: string;
  cliente_nome: string;
  modelo_id: string;
  modelo_nome: string;
  created_at: string;
  consumo_teorico: number;
  consumo_real: number;
};

type Grupo = {
  nome: string;
  qtdOS: number;
  teorico: number;
  real: number;
  perdaMetros: number;
  perdaPercentual: number | null;
};

function agrupar(
  linhas: LinhaAproveitamento[],
  chave: (l: LinhaAproveitamento) => string,
  nome: (l: LinhaAproveitamento) => string,
): Grupo[] {
  const grupos = new Map<
    string,
    { nome: string; qtdOS: number; teorico: number; real: number }
  >();

  for (const linha of linhas) {
    const k = chave(linha);
    const atual = grupos.get(k) ?? {
      nome: nome(linha),
      qtdOS: 0,
      teorico: 0,
      real: 0,
    };
    atual.qtdOS += 1;
    atual.teorico += Number(linha.consumo_teorico);
    atual.real += Number(linha.consumo_real);
    grupos.set(k, atual);
  }

  return Array.from(grupos.values())
    .map((g) => ({
      ...g,
      perdaMetros: g.real - g.teorico,
      perdaPercentual:
        g.real > 0 ? ((g.real - g.teorico) / g.real) * 100 : null,
    }))
    .sort(
      (a, b) =>
        (b.perdaPercentual ?? -Infinity) - (a.perdaPercentual ?? -Infinity),
    );
}

function TabelaGrupo({
  titulo,
  grupos,
  media,
}: {
  titulo: string;
  grupos: Grupo[];
  media: number | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>OS</TableHead>
              <TableHead>Teórico</TableHead>
              <TableHead>Real</TableHead>
              <TableHead>Perda</TableHead>
              <TableHead>vs. média</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grupos.map((g) => (
              <TableRow key={g.nome}>
                <TableCell>{g.nome}</TableCell>
                <TableCell>{g.qtdOS}</TableCell>
                <TableCell>{g.teorico.toFixed(2)} m</TableCell>
                <TableCell>{g.real.toFixed(2)} m</TableCell>
                <TableCell>
                  {g.perdaMetros.toFixed(2)} m
                  {g.perdaPercentual != null &&
                    ` (${g.perdaPercentual.toFixed(1)}%)`}
                </TableCell>
                <TableCell>
                  {g.perdaPercentual != null && media != null ? (
                    <Badge
                      variant={
                        g.perdaPercentual > media ? "destructive" : "default"
                      }
                    >
                      {g.perdaPercentual > media ? "+" : ""}
                      {(g.perdaPercentual - media).toFixed(1)}pp
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
              </TableRow>
            ))}
            {grupos.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground text-center"
                >
                  Nenhum dado no período.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function PaginaRelatorioPerdas({
  searchParams,
}: PageProps<"/painel/relatorios/perdas">) {
  await exigirGestor();
  const { data_inicio, data_fim, cliente_id, modelo_id } = await searchParams;

  const supabase = await createClient();

  let consulta = supabase
    .from("os_aproveitamento")
    .select(
      "os_id, numero, cliente_id, cliente_nome, modelo_id, modelo_nome, created_at, consumo_teorico, consumo_real",
    );

  if (data_inicio) consulta = consulta.gte("created_at", data_inicio);
  if (data_fim) consulta = consulta.lte("created_at", data_fim);
  if (cliente_id) consulta = consulta.eq("cliente_id", cliente_id);
  if (modelo_id) consulta = consulta.eq("modelo_id", modelo_id);

  const [{ data: linhasData }, { data: clientes }, { data: modelos }] =
    await Promise.all([
      consulta,
      supabase.from("clientes").select("id, nome").order("nome"),
      supabase.from("modelos").select("id, nome").order("nome"),
    ]);

  const linhas = (linhasData ?? []) as LinhaAproveitamento[];

  const teoricoTotal = linhas.reduce(
    (soma, l) => soma + Number(l.consumo_teorico),
    0,
  );
  const realTotal = linhas.reduce(
    (soma, l) => soma + Number(l.consumo_real),
    0,
  );
  const mediaGeral =
    realTotal > 0 ? ((realTotal - teoricoTotal) / realTotal) * 100 : null;

  const porModelo = agrupar(
    linhas,
    (l) => l.modelo_id,
    (l) => l.modelo_nome,
  );
  const porCliente = agrupar(
    linhas,
    (l) => l.cliente_id,
    (l) => l.cliente_nome,
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Relatório de perda de tecido" />

      <Card>
        <CardContent>
          <FormularioFiltros
            clientes={clientes ?? []}
            modelos={modelos ?? []}
          />
        </CardContent>
      </Card>

      {mediaGeral != null && (
        <StatCard
          label={`Média geral de perda (${linhas.length} OS com enfesto)`}
          value={`${mediaGeral.toFixed(1)}%`}
          icon={TrendingDown}
        />
      )}

      <TabelaGrupo titulo="Por modelo" grupos={porModelo} media={mediaGeral} />
      <TabelaGrupo
        titulo="Por cliente"
        grupos={porCliente}
        media={mediaGeral}
      />
    </div>
  );
}
