import { exigirGestor } from "@/lib/auth";
import { FormularioCliente } from "../formulario-cliente";
import { criarCliente } from "../actions";

export default async function PaginaNovoCliente() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Novo cliente</h1>
      <FormularioCliente acao={criarCliente} />
    </div>
  );
}
