import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { atualizarCustoHora } from "../../actions";
import { FormularioCustoHora } from "../formulario-custo-hora";

export default async function PaginaCustoHora({
  params,
}: PageProps<"/painel/usuarios/[id]/custo-hora">) {
  await exigirGestor();
  const { id } = await params;

  const supabase = await createClient();
  const { data: usuario } = await supabase
    .from("memberships")
    .select("nome, custo_hora")
    .eq("id", id)
    .maybeSingle();

  if (!usuario) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">
        Custo por hora de {usuario.nome}
      </h1>
      <FormularioCustoHora
        custoHora={usuario.custo_hora}
        acao={atualizarCustoHora.bind(null, id)}
      />
    </div>
  );
}
