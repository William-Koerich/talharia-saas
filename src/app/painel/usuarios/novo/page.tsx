import { exigirGestor } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { FormularioUsuario } from "../formulario-usuario";

export default async function PaginaNovoUsuario() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Novo usuário"
        description="A conta já nasce ativa com essa senha temporária — combine com a pessoa que ela deve trocá-la no primeiro acesso."
      />
      <Card className="max-w-lg">
        <CardContent>
          <FormularioUsuario />
        </CardContent>
      </Card>
    </div>
  );
}
