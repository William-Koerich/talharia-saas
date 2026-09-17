import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">PIN de {usuario.nome}</h1>
      <FormularioPin acao={definirPin.bind(null, id)} />
    </div>
  );
}
