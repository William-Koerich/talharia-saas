import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { definirPin } from "../../actions";
import { FormularioPin } from "../formulario-pin";

export default async function PaginaDefinirPin({
  params,
}: PageProps<"/painel/usuarios/[id]/pin">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: usuario } = await supabase
    .from("memberships")
    .select("nome")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`PIN de ${usuario.nome}`} />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioPin acao={definirPin.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
