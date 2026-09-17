import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nova operação</h1>
      <FormularioOperacao maquinas={maquinas ?? []} acao={criarOperacao} />
    </div>
  );
}
