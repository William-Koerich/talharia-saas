import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";
import { sair } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const LINKS_GESTOR = [
  { href: "/painel/clientes", label: "Clientes" },
  { href: "/painel/modelos", label: "Modelos" },
  { href: "/painel/os", label: "Ordens de Serviço" },
  { href: "/painel/maquinas", label: "Máquinas" },
  { href: "/painel/operacoes", label: "Operações" },
  { href: "/painel/motivos-parada", label: "Motivos de parada" },
  { href: "/painel/consumiveis", label: "Consumíveis" },
  { href: "/painel/usuarios", label: "Usuários" },
];

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessaoAtual();

  if (!sessao) {
    redirect("/entrar");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-col gap-4 border-b p-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <Link href="/painel" className="font-semibold">
            {sessao.tenantNome}
          </Link>
          <p className="text-muted-foreground text-sm">
            {sessao.nome} · {sessao.role}
          </p>
        </div>
        <form action={sair}>
          <Button variant="outline" type="submit">
            Sair
          </Button>
        </form>
      </header>
      {sessao.role !== "OPERADOR" && (
        <nav className="flex flex-wrap gap-1 border-b p-2 print:hidden">
          {LINKS_GESTOR.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              size="sm"
              render={<Link href={link.href} />}
              nativeButton={false}
            >
              {link.label}
            </Button>
          ))}
        </nav>
      )}
      <main className="flex flex-1 flex-col p-4">{children}</main>
    </div>
  );
}
