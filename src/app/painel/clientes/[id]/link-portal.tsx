"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LinkPortal({
  url,
  acaoRegenerar,
}: {
  url: string;
  acaoRegenerar: () => Promise<void>;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* clipboard indisponível — o campo já mostra o link pra copiar manualmente */
    }
  }

  return (
    <div className="flex max-w-lg flex-col gap-2">
      <div className="flex gap-2">
        <Input value={url} readOnly />
        <Button type="button" variant="outline" onClick={copiar}>
          {copiado ? "Copiado!" : "Copiar"}
        </Button>
      </div>
      <form action={acaoRegenerar}>
        <Button type="submit" variant="ghost" size="sm">
          Gerar novo link (invalida o atual)
        </Button>
      </form>
    </div>
  );
}
