import { sair } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function TrialExpirado({ tenantNome }: { tenantNome: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-xl font-semibold">Seu período de teste terminou</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        O período gratuito de {tenantNome} chegou ao fim. Entre em contato pra reativar o acesso.
      </p>
      <form action={sair}>
        <Button variant="outline" type="submit">
          Sair
        </Button>
      </form>
    </div>
  );
}
