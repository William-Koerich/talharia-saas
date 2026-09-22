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
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <div className="bg-primary/20 pointer-events-none absolute -top-24 -right-24 size-80 rounded-full blur-3xl" />
        <span className="text-lg font-semibold tracking-tight">
          Talharia SaaS
        </span>
        <div className="flex flex-col gap-3">
          <p className="text-2xl leading-snug font-semibold">
            Comece agora — 14 dias grátis, sem cartão de crédito.
          </p>
          <p className="text-sidebar-foreground/60 text-sm">
            Cadastre sua empresa e já comece a lançar ordens de serviço,
            apontamentos e entregas.
          </p>
        </div>
        <p className="text-sidebar-foreground/40 text-xs">
          Gestão para talharias de corte de tecido
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Criar conta</CardTitle>
            <CardDescription>
              Crie sua empresa e comece a usar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioCadastro />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
