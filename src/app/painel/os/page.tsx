import Link from "next/link";
import { Plus } from "lucide-react";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { QuadroKanban, type OSCard } from "./quadro-kanban";
import type { OsStatus } from "@/lib/os-status";

type LinhaOS = {
  id: string;
  numero: number;
  status: OsStatus;
  prazo: string | null;
  clientes: { nome: string } | null;
  modelo_versoes: {
    versao: number;
    vigente: boolean;
    modelos: { nome: string } | null;
  } | null;
};

export default async function PaginaOS({
  searchParams,
}: PageProps<"/painel/os">) {
  await exigirGestor();
  const { erro } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("ordens_servico")
    .select(
      "id, numero, status, prazo, clientes(nome), modelo_versoes(versao, vigente, modelos(nome))",
    )
    .order("numero", { ascending: false });

  const ordens: OSCard[] = ((data ?? []) as unknown as LinhaOS[]).map((os) => ({
    id: os.id,
    numero: os.numero,
    status: os.status,
    prazo: os.prazo,
    clienteNome: os.clientes?.nome ?? "—",
    modeloNome: os.modelo_versoes?.modelos?.nome ?? "—",
    versaoDesatualizada: os.modelo_versoes ? !os.modelo_versoes.vigente : false,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <PageHeader
        title="Ordens de Serviço"
        description="Acompanhe o fluxo de produção por status"
        actions={
          <Button render={<Link href="/painel/os/novo" />} nativeButton={false}>
            <Plus className="size-4" />
            Nova OS
          </Button>
        }
      />

      {erro && <p className="text-destructive text-sm">{erro}</p>}

      <QuadroKanban ordensIniciais={ordens} />
    </div>
  );
}
