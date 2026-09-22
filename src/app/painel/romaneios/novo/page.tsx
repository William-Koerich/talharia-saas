import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SeletorCliente } from "./seletor-cliente";
import { FormularioRomaneio } from "./formulario-romaneio";
import { criarRomaneio } from "../actions";

export default async function PaginaNovoRomaneio({
  searchParams,
}: PageProps<"/painel/romaneios/novo">) {
  await exigirGestor();
  const { cliente_id } = await searchParams;
  const clienteId = Array.isArray(cliente_id) ? cliente_id[0] : cliente_id;

  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("id, nome")
    .eq("ativo", true)
    .order("nome");

  let fardos: {
    id: string;
    etiquetaCodigo: string;
    descricao: string | null;
    osNumero: number;
  }[] = [];

  if (clienteId) {
    const { data: fardosData } = await supabase
      .from("fardos")
      .select(
        "id, etiqueta_codigo, descricao, ordens_servico!inner(numero, status, cliente_id)",
      )
      .eq("ordens_servico.cliente_id", clienteId)
      .eq("ordens_servico.status", "pronto");

    const { data: itensExistentes } = await supabase
      .from("romaneio_itens")
      .select("fardo_id");
    const idsUsados = new Set((itensExistentes ?? []).map((i) => i.fardo_id));

    fardos = (fardosData ?? [])
      .filter((f) => !idsUsados.has(f.id))
      .map((f) => ({
        id: f.id,
        etiquetaCodigo: f.etiqueta_codigo,
        descricao: f.descricao,
        osNumero: (f.ordens_servico as unknown as { numero: number }).numero,
      }))
      .sort((a, b) => a.osNumero - b.osNumero);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Novo romaneio</h1>
      <SeletorCliente clientes={clientes ?? []} clienteId={clienteId ?? ""} />
      {clienteId && (
        <FormularioRomaneio clienteId={clienteId} fardos={fardos} acao={criarRomaneio} />
      )}
    </div>
  );
}
