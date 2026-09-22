import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getSessaoAtual } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dashboard } from "./dashboard";

export default async function PaginaPainel() {
  const sessao = await getSessaoAtual();

  if (sessao && sessao.role !== "OPERADOR") {
    return <Dashboard />;
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 pt-2 pb-2 text-center">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">Olá, {sessao?.nome}</h1>
            <p className="text-muted-foreground text-sm">
              Use o apontamento para registrar seu trabalho.
            </p>
          </div>
          <Button render={<Link href="/apontar" />} nativeButton={false}>
            Ir para o apontamento
            <ArrowRight className="size-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
