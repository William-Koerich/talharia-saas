import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Editar consumível</h1>
      <FormularioConsumivel
        consumivel={consumivel}
        acao={atualizarConsumivel.bind(null, id)}
      />
      <form action={excluirConsumivel.bind(null, id)}>
        <Button variant="destructive" type="submit">
          Excluir consumível
        </Button>
      </form>
    </div>
  );
}
