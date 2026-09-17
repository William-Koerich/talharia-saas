import { exigirGestor } from "@/lib/auth";
import { FormularioImportar } from "./formulario-importar";

export default async function PaginaImportarClientes() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Importar clientes por CSV</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        Colunas esperadas (com cabeçalho): <code>nome</code>,{" "}
        <code>documento</code>, <code>contato</code>, <code>endereco</code>. Só{" "}
        <code>nome</code> é obrigatória.
      </p>
      <FormularioImportar />
    </div>
  );
}
