import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioMaquina } from "../formulario-maquina";
import { criarMaquina } from "../actions";

export default async function PaginaNovaMaquina() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nova máquina" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioMaquina acao={criarMaquina} />
        </CardContent>
      </Card>
    </div>
  );
}
