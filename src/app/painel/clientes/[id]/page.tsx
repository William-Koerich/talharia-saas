import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioCliente } from "../formulario-cliente";
import {
  atualizarCliente,
  excluirCliente,
  regenerarPortalLink,
} from "../actions";
import { LinkPortal } from "./link-portal";

export default async function PaginaEditarCliente({
  params,
}: PageProps<"/painel/clientes/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("nome, documento, contato, endereco, portal_token")
    .eq("id", id)
    .maybeSingle();

  if (!cliente) notFound();

  const headersList = await headers();
  const origem = `${headersList.get("x-forwarded-proto") ?? "https"}://${headersList.get("host")}`;
  const urlPortal = `${origem}/portal/${cliente.portal_token}`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar cliente" />

      <Card className="max-w-lg">
        <CardContent>
          <FormularioCliente
            cliente={cliente}
            acao={atualizarCliente.bind(null, id)}
          />
        </CardContent>
      </Card>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Portal do cliente</CardTitle>
          <CardDescription>
            Link público, sem senha, pra o cliente acompanhar as OS e baixar os
            romaneios de entrega.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkPortal
            url={urlPortal}
            acaoRegenerar={regenerarPortalLink.bind(null, id)}
          />
        </CardContent>
      </Card>

      <form action={excluirCliente.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir cliente
        </Button>
      </form>
    </div>
  );
}
