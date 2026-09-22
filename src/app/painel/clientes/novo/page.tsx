import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioCliente } from "../formulario-cliente";
import { criarCliente } from "../actions";

export default async function PaginaNovoCliente() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Novo cliente" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioCliente acao={criarCliente} />
        </CardContent>
      </Card>
    </div>
  );
}
