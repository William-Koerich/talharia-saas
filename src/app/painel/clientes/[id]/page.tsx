import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormularioCliente } from "../formulario-cliente";
import { atualizarCliente, excluirCliente, regenerarPortalLink } from "../actions";
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-semibold">Editar cliente</h1>
        <FormularioCliente
          cliente={cliente}
          acao={atualizarCliente.bind(null, id)}
        />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Portal do cliente</h2>
        <p className="text-muted-foreground text-sm">
          Link público, sem senha, pra o cliente acompanhar as OS e baixar os romaneios de entrega.
        </p>
        <LinkPortal url={urlPortal} acaoRegenerar={regenerarPortalLink.bind(null, id)} />
      </section>

      <form action={excluirCliente.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir cliente
        </Button>
      </form>
    </div>
  );
}
