import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
import { FormularioFiltrosMargem } from "./formulario-filtros";

type LinhaOS = {
  id: string;
  cliente_id: string;
  cliente_nome: string;
  created_at: string;
};

type LinhaCusto = {
  os_id: string;
  numero: number;
  preco_acordado: number | null;
  custo_total: number;
  margem: number | null;
};

function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function PaginaRelatorioMargem({
  searchParams,
}: PageProps<"/painel/relatorios/margem">) {
  await exigirGestor();
  const { data_inicio, data_fim, cliente_id } = await searchParams;

  const supabase = await createClient();

  let consultaOS = supabase
    .from("ordens_servico")
    .select("id, cliente_id, clientes(nome), created_at");

  if (data_inicio) consultaOS = consultaOS.gte("created_at", data_inicio);
  if (data_fim) consultaOS = consultaOS.lte("created_at", data_fim);
  if (cliente_id) consultaOS = consultaOS.eq("cliente_id", cliente_id);

  const [{ data: ordensData }, { data: custosData }, { data: clientes }] =
    await Promise.all([
      consultaOS,
      supabase
        .from("os_custos")
        .select(
          "os_id, numero, preco_acordado, custo_total, margem, margem_percentual",
        ),
      supabase.from("clientes").select("id, nome").order("nome"),
    ]);

  const ordens = (ordensData ?? []).map((o) => ({
    id: o.id,
    cliente_id: o.cliente_id,
    cliente_nome:
      (o.clientes as unknown as { nome: string } | null)?.nome ?? "—",
    created_at: o.created_at,
  })) as LinhaOS[];

  const idsFiltrados = new Set(ordens.map((o) => o.id));
  const custosPorOS = new Map(
    (custosData ?? []).map((c) => [c.os_id, c as LinhaCusto]),
  );

  const porCliente = new Map<
    string,
    {
      nome: string;
      qtdOS: number;
      preco: number;
      custo: number;
      margem: number;
    }
  >();

  for (const os of ordens) {
    if (!idsFiltrados.has(os.id)) continue;
    const custo = custosPorOS.get(os.id);
    if (!custo || custo.preco_acordado == null) continue;

    const atual = porCliente.get(os.cliente_id) ?? {
      nome: os.cliente_nome,
      qtdOS: 0,
      preco: 0,
      custo: 0,
      margem: 0,
    };
    atual.qtdOS += 1;
    atual.preco += Number(custo.preco_acordado);
    atual.custo += Number(custo.custo_total);
    atual.margem += Number(custo.margem ?? 0);
    porCliente.set(os.cliente_id, atual);
  }

  const linhas = Array.from(porCliente.values())
    .map((g) => ({
      ...g,
      margemPercentual: g.preco > 0 ? (g.margem / g.preco) * 100 : null,
    }))
    .sort((a, b) => a.margem - b.margem);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Margem por cliente" />

      <Card>
        <CardContent>
          <FormularioFiltrosMargem clientes={clientes ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>OS</TableHead>
                <TableHead>Preço acordado</TableHead>
                <TableHead>Custo</TableHead>
                <TableHead>Margem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.map((g) => (
                <TableRow key={g.nome}>
                  <TableCell>
                    {g.nome}
                    {g.margem < 0 && (
                      <Badge variant="destructive" className="ml-2">
                        Deficitário
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{g.qtdOS}</TableCell>
                  <TableCell>{formatarReais(g.preco)}</TableCell>
                  <TableCell>{formatarReais(g.custo)}</TableCell>
                  <TableCell
                    className={
                      g.margem < 0 ? "text-destructive font-medium" : ""
                    }
                  >
                    {formatarReais(g.margem)}
                    {g.margemPercentual != null &&
                      ` (${g.margemPercentual.toFixed(1)}%)`}
                  </TableCell>
                </TableRow>
              ))}
              {linhas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-muted-foreground text-center"
                  >
                    Nenhuma OS com preço acordado no período.
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
