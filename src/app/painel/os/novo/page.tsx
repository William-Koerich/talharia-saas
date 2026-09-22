import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioOS } from "../formulario-os";

export default async function PaginaNovaOS() {
  await exigirGestor();

  const supabase = await createClient();
  const [{ data: clientes }, { data: modelosData }, { data: temposPadrao }] =
    await Promise.all([
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
      supabase
        .from("tempo_padrao_modelo_operacao")
        .select("modelo_id, horas_por_peca"),
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

  const horasPorPecaPorModelo = new Map<string, number>();
  for (const t of temposPadrao ?? []) {
    horasPorPecaPorModelo.set(
      t.modelo_id,
      (horasPorPecaPorModelo.get(t.modelo_id) ?? 0) + Number(t.horas_por_peca),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nova ordem de serviço" />
      <Card className="max-w-2xl">
        <CardContent>
          <FormularioOS
            clientes={clientes ?? []}
            modelos={modelos}
            horasPorPecaPorModelo={Object.fromEntries(horasPorPecaPorModelo)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
