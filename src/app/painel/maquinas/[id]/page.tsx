import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioMaquina } from "../formulario-maquina";
import { atualizarMaquina, excluirMaquina } from "../actions";

export default async function PaginaEditarMaquina({
  params,
}: PageProps<"/painel/maquinas/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: maquina } = await supabase
    .from("maquinas")
    .select("nome, tipo, custo_hora")
    .eq("id", id)
    .maybeSingle();

  if (!maquina) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar máquina" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioMaquina
            maquina={maquina}
            acao={atualizarMaquina.bind(null, id)}
          />
        </CardContent>
      </Card>
      <form action={excluirMaquina.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir máquina
        </Button>
      </form>
    </div>
  );
}
