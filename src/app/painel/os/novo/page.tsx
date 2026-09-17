import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { FormularioOS } from "../formulario-os";

export default async function PaginaNovaOS() {
  await exigirGestor();

  const supabase = await createClient();
  const [{ data: clientes }, { data: modelosData }] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("modelo_versoes")
      .select("id, versao, modelos!inner(id, nome, cliente_id, ativo)")
      .eq("vigente", true)
      .eq("modelos.ativo", true),
  ]);

  const modelos = (modelosData ?? [])
    .map((mv) => {
      const modelo = mv.modelos as unknown as {
        id: string;
        nome: string;
        cliente_id: string;
      };
      return {
        id: modelo.id,
        nome: modelo.nome,
        cliente_id: modelo.cliente_id,
        modelo_versao_id: mv.id,
        versao: mv.versao,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nova ordem de serviço</h1>
      <FormularioOS clientes={clientes ?? []} modelos={modelos} />
    </div>
  );
}
