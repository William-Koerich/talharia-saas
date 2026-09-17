import { getSessaoAtual } from "@/lib/auth";

export default async function PaginaPainel() {
  const sessao = await getSessaoAtual();

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold">Olá, {sessao?.nome}</h1>
      <p className="text-muted-foreground text-sm">
        Use o menu acima para gerenciar clientes, máquinas e usuários.
      </p>
    </div>
  );
}
