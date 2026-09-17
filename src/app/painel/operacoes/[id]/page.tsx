import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { FormularioOperacao } from "../formulario-operacao";
import { atualizarOperacao, excluirOperacao } from "../actions";

export default async function PaginaEditarOperacao({
  params,
}: PageProps<"/painel/operacoes/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const [{ data: operacao }, { data: maquinas }] = await Promise.all([
    supabase
      .from("operacoes")
      .select("nome, maquina_padrao_id")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("maquinas")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome"),
  ]);

  if (!operacao) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar operação</h1>
      <FormularioOperacao
        operacao={operacao}
        maquinas={maquinas ?? []}
        acao={atualizarOperacao.bind(null, id)}
      />
      <form action={excluirOperacao.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir operação
        </Button>
      </form>
    </div>
  );
}
