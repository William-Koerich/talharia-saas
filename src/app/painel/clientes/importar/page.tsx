import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioImportar } from "./formulario-importar";

export default async function PaginaImportarClientes() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Importar clientes por CSV"
        description={
          <>
            Colunas esperadas (com cabeçalho): <code>nome</code>,{" "}
            <code>documento</code>, <code>contato</code>, <code>endereco</code>.
            Só <code>nome</code> é obrigatória.
          </>
        }
      />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioImportar />
        </CardContent>
      </Card>
    </div>
  );
}
