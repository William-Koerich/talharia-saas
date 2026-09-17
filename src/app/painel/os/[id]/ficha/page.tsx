import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function PaginaFichaOS({
  params,
}: PageProps<"/painel/os/[id]/ficha">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: os }, { data: grade }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select(
        "numero, prazo, preco_acordado, clientes(nome), modelo_versoes(versao, modelos(nome))",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("os_grades")
      .select("tamanho, cor, quantidade")
      .eq("os_id", id)
      .order("tamanho"),
  ]);

  if (!os) notFound();

  const cliente = os.clientes as unknown as { nome: string } | null;
  const versao = os.modelo_versoes as unknown as {
    versao: number;
    modelos: { nome: string } | null;
  } | null;

  const qrDataUrl = await QRCode.toDataURL(String(os.numero), {
    margin: 1,
    width: 160,
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 p-6 print:p-0">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">OS #{os.numero}</h1>
          <p>{cliente?.nome ?? "—"}</p>
          <p>
            {versao?.modelos?.nome ?? "—"} — v{versao?.versao}
          </p>
          <p>Prazo: {os.prazo ?? "—"}</p>
          <p>
            Preço acordado:{" "}
            {os.preco_acordado
              ? Number(os.preco_acordado).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "—"}
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrDataUrl}
          alt={`QR code OS ${os.numero}`}
          width={160}
          height={160}
        />
      </div>

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
    </div>
  );
}
