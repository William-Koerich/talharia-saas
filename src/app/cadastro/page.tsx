import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioCadastro } from "./formulario-cadastro";

export default function PaginaCadastro() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>
            Crie sua empresa e comece a usar o sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioCadastro />
        </CardContent>
      </Card>
    </div>
  );
}
