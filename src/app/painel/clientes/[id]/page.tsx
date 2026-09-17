import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormularioCliente } from "../formulario-cliente";
import { atualizarCliente, excluirCliente } from "../actions";

export default async function PaginaEditarCliente({
  params,
}: PageProps<"/painel/clientes/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: cliente } = await supabase
    .from("clientes")
    .select("nome, documento, contato, endereco")
    .eq("id", id)
    .maybeSingle();

  if (!cliente) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar cliente</h1>
      <FormularioCliente
        cliente={cliente}
        acao={atualizarCliente.bind(null, id)}
      />
      <form action={excluirCliente.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir cliente
        </Button>
      </form>
    </div>
  );
}
