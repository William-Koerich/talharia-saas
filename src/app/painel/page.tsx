import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { sair } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default async function PaginaPainel() {
  const sessao = await getSessaoAtual();

  if (!sessao) {
    redirect("/entrar");
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{sessao.tenantNome}</h1>
          <p className="text-muted-foreground text-sm">
            {sessao.email} · {sessao.role}
          </p>
        </div>
        <form action={sair}>
          <Button variant="outline" type="submit">
            Sair
          </Button>
        </form>
      </div>
    </div>
  );
}
