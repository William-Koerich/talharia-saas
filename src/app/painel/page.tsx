import Link from "next/link";
import { getSessaoAtual } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Dashboard } from "./dashboard";

export default async function PaginaPainel() {
  const sessao = await getSessaoAtual();

  if (sessao && sessao.role !== "OPERADOR") {
    return <Dashboard />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">Olá, {sessao?.nome}</h1>
        <p className="text-muted-foreground text-sm">
          Use o apontamento para registrar seu trabalho.
        </p>
      </div>
      <Button
        render={<Link href="/apontar" />}
        nativeButton={false}
        className="self-start"
      >
        Ir para o apontamento
      </Button>
    </div>
  );
}
