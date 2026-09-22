"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Shirt,
  ClipboardList,
  Truck,
  TrendingDown,
  PieChart,
  Cog,
  Workflow,
  PauseCircle,
  Package,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { cn } from "cn";

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/painel/clientes", label: "Clientes", icon: Users },
  { href: "/painel/modelos", label: "Modelos", icon: Shirt },
  { href: "/painel/os", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/painel/romaneios", label: "Romaneios", icon: Truck },
  {
    href: "/painel/relatorios/perdas",
    label: "Relatório de perdas",
    icon: TrendingDown,
  },
  {
    href: "/painel/relatorios/margem",
    label: "Margem por cliente",
    icon: PieChart,
  },
  { href: "/painel/maquinas", label: "Máquinas", icon: Cog },
  { href: "/painel/operacoes", label: "Operações", icon: Workflow },
  {
    href: "/painel/motivos-parada",
    label: "Motivos de parada",
    icon: PauseCircle,
  },
  { href: "/painel/consumiveis", label: "Consumíveis", icon: Package },
  { href: "/painel/usuarios", label: "Usuários", icon: UserCog },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-0.5 overflow-x-auto px-3 py-2 md:flex-col md:overflow-visible md:px-3 md:py-0">
      {LINKS.map((link) => {
        const ativo =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              ativo
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
