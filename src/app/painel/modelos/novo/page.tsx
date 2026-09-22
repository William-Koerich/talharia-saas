import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo modelo"
        description="A Versão 1 é criada automaticamente como vigente."
      />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioModelo clientes={clientes ?? []} acao={criarModelo} />
        </CardContent>
      </Card>
    </div>
  );
}
