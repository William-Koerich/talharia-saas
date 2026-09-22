import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConferenciaQr } from "./conferencia-qr";
import { CapturaEntrega } from "./captura-entrega";
import {
  alternarConferidoItem,
  excluirRomaneio,
  finalizarEntrega,
  marcarRomaneioConferido,
} from "../actions";

const ROTULO_STATUS: Record<string, string> = {
  rascunho: "Rascunho",
  conferido: "Conferido",
  entregue: "Entregue",
};

export default async function PaginaRomaneioDetalhe({
  params,
}: PageProps<"/painel/romaneios/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: romaneio }, { data: itensData }] = await Promise.all([
    supabase
      .from("romaneios")
      .select(
        "status, data_entrega, foto_entrega_storage_path, assinatura_storage_path, clientes(nome)",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("romaneio_itens")
      .select("id, conferido, fardos(etiqueta_codigo, descricao)"),
  ]);

  if (!romaneio) notFound();

  const cliente = romaneio.clientes as unknown as { nome: string } | null;

  const itens = (itensData ?? []).map((item) => {
    const fardo = item.fardos as unknown as {
      etiqueta_codigo: string;
      descricao: string | null;
    } | null;
    return {
      id: item.id,
      conferido: item.conferido,
      etiquetaCodigo: fardo?.etiqueta_codigo ?? "—",
      descricao: fardo?.descricao ?? null,
    };
  });

  const totalConferido = itens.filter((i) => i.conferido).length;
  const todosConferidos = itens.length > 0 && totalConferido === itens.length;

  let fotoUrl: string | null = null;
  let assinaturaUrl: string | null = null;
  if (romaneio.foto_entrega_storage_path) {
    const { data } = await supabase.storage
      .from("arquivos")
      .createSignedUrl(romaneio.foto_entrega_storage_path, 300);
    fotoUrl = data?.signedUrl ?? null;
  }
  if (romaneio.assinatura_storage_path) {
    const { data } = await supabase.storage
      .from("arquivos")
      .createSignedUrl(romaneio.assinatura_storage_path, 300);
    assinaturaUrl = data?.signedUrl ?? null;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            Romaneio — {cliente?.nome ?? "—"}
            <Badge>{ROTULO_STATUS[romaneio.status] ?? romaneio.status}</Badge>
          </span>
        }
        description={`${totalConferido}/${itens.length} fardos conferidos`}
        actions={
          <Button
            variant="outline"
            render={<a href={`/api/romaneios/${id}/pdf`} />}
            nativeButton={false}
          >
            <Download className="size-4" />
            Baixar PDF
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Fardos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {romaneio.status === "rascunho" && (
            <ConferenciaQr
              itens={itens.map((i) => ({
                id: i.id,
                etiquetaCodigo: i.etiquetaCodigo,
                conferido: i.conferido,
              }))}
              acao={alternarConferidoItem.bind(null, id)}
            />
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Conferido</TableHead>
                {romaneio.status === "rascunho" && (
                  <TableHead className="text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.etiquetaCodigo}</TableCell>
                  <TableCell>{item.descricao ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={item.conferido ? "default" : "secondary"}>
                      {item.conferido ? "Sim" : "Não"}
                    </Badge>
                  </TableCell>
                  {romaneio.status === "rascunho" && (
                    <TableCell className="text-right">
                      <form
                        action={alternarConferidoItem.bind(
                          null,
                          id,
                          item.id,
                          !item.conferido,
                        )}
                      >
                        <Button variant="ghost" size="sm" type="submit">
                          {item.conferido ? "Desconferir" : "Marcar conferido"}
                        </Button>
                      </form>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {romaneio.status === "rascunho" && (
            <form
              action={marcarRomaneioConferido.bind(null, id)}
              className="w-fit"
            >
              <Button type="submit" disabled={!todosConferidos}>
                Marcar romaneio como conferido
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {romaneio.status === "conferido" && (
        <Card>
          <CardHeader>
            <CardTitle>Finalizar entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <CapturaEntrega acao={finalizarEntrega.bind(null, id)} />
          </CardContent>
        </Card>
      )}

      {romaneio.status === "entregue" && (
        <Card>
          <CardHeader>
            <CardTitle>Entrega confirmada</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm">Data de entrega: {romaneio.data_entrega}</p>
            <div className="flex flex-wrap gap-6">
              {fotoUrl && (
                <a
                  href={fotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-1"
                >
                  <span className="text-sm font-medium">Foto</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fotoUrl}
                    alt="Foto da entrega"
                    className="h-40 rounded-lg border object-cover"
                  />
                </a>
              )}
              {assinaturaUrl && (
                <a
                  href={assinaturaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-1"
                >
                  <span className="text-sm font-medium">Assinatura</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={assinaturaUrl}
                    alt="Assinatura do recebedor"
                    className="h-40 rounded-lg border bg-white object-contain"
                  />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        {romaneio.status === "rascunho" && (
          <form action={excluirRomaneio.bind(null, id)}>
            <Button variant="destructive" type="submit">
              Excluir romaneio
            </Button>
          </form>
        )}
        <Button
          variant="ghost"
          render={<Link href="/painel/romaneios" />}
          nativeButton={false}
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </div>
    </div>
  );
}
