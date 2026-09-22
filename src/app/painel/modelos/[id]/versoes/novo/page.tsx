import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioVersao } from "../formulario-versao";
import { criarVersao } from "../actions";

export default async function PaginaNovaVersao({
  params,
}: PageProps<"/painel/modelos/[id]/versoes/novo">) {
  await exigirGestor();
  const { id } = await params;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Nova versão" />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioVersao acao={criarVersao.bind(null, id)} />
        </CardContent>
      </Card>
    </div>
  );
}
