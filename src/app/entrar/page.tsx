import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormularioEntrar } from "./formulario-entrar";

export default function PaginaEntrar() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>Acesse sua conta da talharia.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormularioEntrar />
        </CardContent>
      </Card>
    </div>
  );
}
