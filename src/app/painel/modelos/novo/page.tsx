import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FormularioModelo } from "../formulario-modelo";
import { criarModelo } from "../actions";

export default async function PaginaNovoModelo() {
  await exigirGestor();

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Novo modelo</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        A Versão 1 é criada automaticamente como vigente.
      </p>
      <FormularioModelo clientes={clientes ?? []} acao={criarModelo} />
    </div>
  );
}
