import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioConsumivel } from "../formulario-consumivel";
import { criarConsumivel } from "../actions";

export default async function PaginaNovoConsumivel() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Novo consumível" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioConsumivel acao={criarConsumivel} />
        </CardContent>
      </Card>
    </div>
  );
}
