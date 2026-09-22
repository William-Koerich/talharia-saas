import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { sair } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { TrialExpirado } from "./trial-expirado";
import { SidebarNav } from "./sidebar-nav";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessaoAtual();

  if (!sessao) {
    redirect("/entrar");
  }

  if (sessao.trialExpirado) {
    return <TrialExpirado tenantNome={sessao.tenantNome} />;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="bg-sidebar text-sidebar-foreground flex flex-col md:w-64 md:shrink-0 print:hidden">
        <div className="flex items-center justify-between px-4 py-4 md:flex-col md:items-start md:gap-1 md:py-6">
          <Link
            href="/painel"
            className="text-base font-semibold tracking-tight"
          >
            {sessao.tenantNome}
          </Link>
          <form action={sair} className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              type="submit"
              className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              Sair
            </Button>
          </form>
        </div>

        {sessao.role !== "OPERADOR" && <SidebarNav />}

        <div className="border-sidebar-border mt-auto hidden flex-col gap-3 border-t px-4 py-4 md:flex">
          <div className="text-sm">
            <p className="font-medium">{sessao.nome}</p>
            <p className="text-sidebar-foreground/60 text-xs">{sessao.role}</p>
          </div>
          <form action={sair}>
            <Button
              variant="outline"
              size="sm"
              type="submit"
              className="border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full bg-transparent"
            >
              Sair
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {!sessao.assinaturaAtiva && (
          <p className="bg-accent text-accent-foreground px-4 py-2 text-center text-sm print:hidden">
            Período de teste: {sessao.diasRestantesTrial}{" "}
            {sessao.diasRestantesTrial === 1
              ? "dia restante"
              : "dias restantes"}
            .
          </p>
        )}
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
