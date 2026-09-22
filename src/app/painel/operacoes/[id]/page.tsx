import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
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
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar operação" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioOperacao
            operacao={operacao}
            maquinas={maquinas ?? []}
            acao={atualizarOperacao.bind(null, id)}
          />
        </CardContent>
      </Card>
      <form action={excluirOperacao.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir operação
        </Button>
      </form>
    </div>
  );
}
