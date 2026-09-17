import { exigirGestor } from "@/lib/auth";
import { FormularioMotivo } from "../formulario-motivo";
import { criarMotivoParada } from "../actions";

export default async function PaginaNovoMotivoParada() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Novo motivo de parada</h1>
      <FormularioMotivo acao={criarMotivoParada} />
    </div>
  );
}
