import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioOperacao } from "../formulario-operacao";
import { criarOperacao } from "../actions";

export default async function PaginaNovaOperacao() {
  await exigirGestor();

  const supabase = await createClient();
  const { data: maquinas } = await supabase
    .from("maquinas")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nova operação" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioOperacao maquinas={maquinas ?? []} acao={criarOperacao} />
        </CardContent>
      </Card>
    </div>
  );
}
