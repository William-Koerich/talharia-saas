import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioMotivo } from "../formulario-motivo";
import { atualizarMotivoParada, excluirMotivoParada } from "../actions";

export default async function PaginaEditarMotivoParada({
  params,
}: PageProps<"/painel/motivos-parada/[id]">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: motivo } = await supabase
    .from("motivos_parada")
    .select("nome")
    .eq("id", id)
    .maybeSingle();

  if (!motivo) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Editar motivo de parada" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioMotivo
            nome={motivo.nome}
            acao={atualizarMotivoParada.bind(null, id)}
          />
        </CardContent>
      </Card>
      <form action={excluirMotivoParada.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir motivo
        </Button>
      </form>
    </div>
  );
}
