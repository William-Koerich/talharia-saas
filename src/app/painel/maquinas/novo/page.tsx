import { exigirGestor } from "@/lib/auth";
import { FormularioMaquina } from "../formulario-maquina";
import { criarMaquina } from "../actions";

export default async function PaginaNovaMaquina() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Nova máquina</h1>
      <FormularioMaquina acao={criarMaquina} />
    </div>
  );
}
