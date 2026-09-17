import { exigirGestor } from "@/lib/auth";
import { FormularioVersao } from "../formulario-versao";
import { criarVersao } from "../actions";

export default async function PaginaNovaVersao({
  params,
}: PageProps<"/painel/modelos/[id]/versoes/novo">) {
  await exigirGestor();
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nova versão</h1>
      <FormularioVersao acao={criarVersao.bind(null, id)} />
    </div>
  );
}
