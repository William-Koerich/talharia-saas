import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OS_STATUS } from "@/lib/os-status";

const ROTULO_STATUS_ROMANEIO: Record<string, string> = {
  rascunho: "Em preparação",
  conferido: "Conferido",
  entregue: "Entregue",
};

export default async function PaginaPortalCliente({
  params,
}: PageProps<"/portal/[token]">) {
  const { token } = await params;

  const supabase = createAdminClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("portal_token", token)
    .maybeSingle();

  if (!cliente) notFound();

  const [{ data: osData }, { data: romaneiosData }] = await Promise.all([
    supabase
      .from("ordens_servico")
      .select("id, numero, status, prazo, modelo_versoes(modelos(nome))")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("romaneios")
      .select("id, status, data_entrega, created_at")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false }),
  ]);

  const rotuloOsStatus = (status: string) =>
    OS_STATUS.find((s) => s.value === status)?.label ?? status;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 p-6">
      <div>
        <h1 className="text-xl font-semibold">{cliente.nome}</h1>
        <p className="text-muted-foreground text-sm">
          Acompanhamento de ordens de serviço e entregas
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ordens de serviço</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OS</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {osData?.map((os) => {
              const versao = os.modelo_versoes as unknown as {
                modelos: { nome: string } | null;
              } | null;
              return (
                <TableRow key={os.id}>
                  <TableCell>#{os.numero}</TableCell>
                  <TableCell>{versao?.modelos?.nome ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={os.status === "entregue" ? "default" : "secondary"}>
                      {rotuloOsStatus(os.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{os.prazo ?? "—"}</TableCell>
                </TableRow>
              );
            })}
            {osData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground text-center">
                  Nenhuma ordem de serviço ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Entregas</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Data de entrega</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {romaneiosData?.map((romaneio) => (
              <TableRow key={romaneio.id}>
                <TableCell>
                  <Badge variant={romaneio.status === "entregue" ? "default" : "secondary"}>
                    {ROTULO_STATUS_ROMANEIO[romaneio.status] ?? romaneio.status}
                  </Badge>
                </TableCell>
                <TableCell>{romaneio.data_entrega ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {romaneio.status === "entregue" && (
                    <a
                      href={`/portal/${token}/romaneios/${romaneio.id}/pdf`}
                      className="text-primary text-sm underline underline-offset-4"
                    >
                      Baixar romaneio
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {romaneiosData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground text-center">
                  Nenhuma entrega ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
