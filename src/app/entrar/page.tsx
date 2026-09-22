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
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-10 md:flex">
        <div className="bg-primary/20 pointer-events-none absolute -top-24 -right-24 size-80 rounded-full blur-3xl" />
        <span className="text-lg font-semibold tracking-tight">
          Talharia SaaS
        </span>
        <div className="flex flex-col gap-3">
          <p className="text-2xl leading-snug font-semibold">
            Corte, apontamento e entrega da sua talharia num só lugar.
          </p>
          <p className="text-sidebar-foreground/60 text-sm">
            Ordens de serviço, enfesto, custos e romaneios de entrega — tudo num
            fluxo pensado pro chão de fábrica.
          </p>
        </div>
        <p className="text-sidebar-foreground/40 text-xs">
          Gestão para talharias de corte de tecido
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Entrar</CardTitle>
            <CardDescription>Acesse sua conta da talharia.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormularioEntrar />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
