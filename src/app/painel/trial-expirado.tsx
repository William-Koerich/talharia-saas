import { Clock } from "lucide-react";
import { sair } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TrialExpirado({ tenantNome }: { tenantNome: string }) {
  return (
    <div className="bg-secondary/40 flex min-h-screen flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Card className="max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 pt-2 pb-6 text-center">
          <div className="bg-accent flex size-12 items-center justify-center rounded-full">
            <Clock className="text-accent-foreground size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">
              Seu período de teste terminou
            </h1>
            <p className="text-muted-foreground text-sm">
              O período gratuito de{" "}
              <span className="font-medium">{tenantNome}</span> chegou ao fim.
              Entre em contato pra reativar o acesso.
            </p>
          </div>
          <form action={sair}>
            <Button variant="outline" type="submit">
              Sair
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
