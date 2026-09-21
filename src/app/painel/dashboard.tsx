import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarHoras(horas: number) {
  return `${horas.toFixed(1)}h`;
}

export async function Dashboard() {
  const supabase = await createClient();
  const hoje = new Date();
  const inicioMes = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    1,
  ).toISOString();
  const hojeISO = hoje.toISOString().slice(0, 10);

  const [
    { data: atrasadasData },
    { data: apontamentosMes },
    { data: custosMes },
    { data: ordensMes },
  ] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select("id, numero, prazo, clientes(nome)")
      .lt("prazo", hojeISO)
      .neq("status", "entregue")
      .order("prazo"),
    supabase
      .from("apontamentos")
      .select("tipo, inicio, fim, maquinas(nome), motivos_parada(nome)")
      .gte("inicio", inicioMes)
      .not("fim", "is", null),
    supabase.from("os_custos").select("os_id, margem"),
    supabase
      .from("ordens_servico")
      .select("id, created_at")
      .gte("created_at", inicioMes),
  ]);

  const atrasadas = (atrasadasData ?? []).map((os) => ({
    id: os.id,
    numero: os.numero,
    prazo: os.prazo,
    clienteNome:
      (os.clientes as unknown as { nome: string } | null)?.nome ?? "—",
  }));

  const ocupacaoPorMaquina = new Map<string, number>();
  const paradaPorMotivo = new Map<string, number>();

  for (const a of apontamentosMes ?? []) {
    const horas =
      (new Date(a.fim as string).getTime() - new Date(a.inicio).getTime()) /
      3_600_000;

    if (a.tipo === "setup" || a.tipo === "produtivo") {
      const nomeMaquina =
        (a.maquinas as unknown as { nome: string } | null)?.nome ?? "—";
      ocupacaoPorMaquina.set(
        nomeMaquina,
        (ocupacaoPorMaquina.get(nomeMaquina) ?? 0) + horas,
      );
    } else if (a.tipo === "parada") {
      const nomeMotivo =
        (a.motivos_parada as unknown as { nome: string } | null)?.nome ?? "—";
      paradaPorMotivo.set(
        nomeMotivo,
        (paradaPorMotivo.get(nomeMotivo) ?? 0) + horas,
      );
    }
  }

  const ocupacaoOrdenada = Array.from(ocupacaoPorMaquina.entries()).sort(
    (a, b) => b[1] - a[1],
  );
  const paradasOrdenadas = Array.from(paradaPorMotivo.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const idsDoMes = new Set((ordensMes ?? []).map((o) => o.id));
  const margemDoMes = (custosMes ?? [])
    .filter((c) => idsDoMes.has(c.os_id))
    .reduce((soma, c) => soma + Number(c.margem ?? 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Margem do mês:{" "}
          <span
            className={
              margemDoMes < 0 ? "text-destructive font-medium" : "font-medium"
            }
          >
            {formatarReais(margemDoMes)}
          </span>
        </p>
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          OS atrasadas ({atrasadas.length})
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OS</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atrasadas.map((os) => (
              <TableRow key={os.id}>
                <TableCell>
                  <Link
                    href={`/painel/os/${os.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    OS #{os.numero}
                  </Link>
                </TableCell>
                <TableCell>{os.clienteNome}</TableCell>
                <TableCell>
                  <Badge variant="destructive">{os.prazo}</Badge>
                </TableCell>
              </TableRow>
            ))}
            {atrasadas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground text-center"
                >
                  Nenhuma OS atrasada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          Ocupação por máquina (mês atual)
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Máquina</TableHead>
              <TableHead>Horas (setup + produtivo)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ocupacaoOrdenada.map(([nome, horas]) => (
              <TableRow key={nome}>
                <TableCell>{nome}</TableCell>
                <TableCell>{formatarHoras(horas)}</TableCell>
              </TableRow>
            ))}
            {ocupacaoOrdenada.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-muted-foreground text-center"
                >
                  Nenhum apontamento este mês.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">
          Top motivos de parada (mês atual)
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motivo</TableHead>
              <TableHead>Horas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paradasOrdenadas.map(([nome, horas]) => (
              <TableRow key={nome}>
                <TableCell className="capitalize">{nome}</TableCell>
                <TableCell>{formatarHoras(horas)}</TableCell>
              </TableRow>
            ))}
            {paradasOrdenadas.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-muted-foreground text-center"
                >
                  Nenhuma parada este mês.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
