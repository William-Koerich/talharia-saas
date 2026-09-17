import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar máquina</h1>
      <FormularioMaquina
        maquina={maquina}
        acao={atualizarMaquina.bind(null, id)}
      />
      <form action={excluirMaquina.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir máquina
        </Button>
      </form>
    </div>
  );
}
