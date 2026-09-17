import { exigirGestor } from "@/lib/auth";
import { FormularioConsumivel } from "../formulario-consumivel";
import { criarConsumivel } from "../actions";

export default async function PaginaNovoConsumivel() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Novo consumível</h1>
      <FormularioConsumivel acao={criarConsumivel} />
    </div>
  );
}
