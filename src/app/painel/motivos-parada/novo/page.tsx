import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioMotivo } from "../formulario-motivo";
import { criarMotivoParada } from "../actions";

export default async function PaginaNovoMotivoParada() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Novo motivo de parada" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioMotivo acao={criarMotivoParada} />
        </CardContent>
      </Card>
    </div>
  );
}
