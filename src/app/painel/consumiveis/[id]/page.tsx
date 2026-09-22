import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioConsumivel } from "../formulario-consumivel";
import { atualizarConsumivel, excluirConsumivel } from "../actions";

export default async function PaginaEditarConsumivel({
  params,
}: PageProps<"/painel/consumiveis/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: consumivel } = await supabase
    .from("consumiveis")
    .select("nome, unidade, custo_unitario")
    .eq("id", id)
    .maybeSingle();

  if (!consumivel) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar consumível" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioConsumivel
            consumivel={consumivel}
            acao={atualizarConsumivel.bind(null, id)}
          />
        </CardContent>
      </Card>
      <form action={excluirConsumivel.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir consumível
        </Button>
      </form>
    </div>
  );
}
