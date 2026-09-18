"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EstadoForm, ItemRoloEnfesto } from "./enfesto-actions";

type RoloDaOS = { id: string; partida: string | null; cor: string | null };

export function FormularioEnfesto({
  rolosDaOS,
  acao,
}: {
  rolosDaOS: RoloDaOS[];
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, {
    erro: null,
  } as EstadoForm);
  const [rolos, setRolos] = useState<ItemRoloEnfesto[]>([
    { roloId: "", metrosUsados: 0 },
  ]);

  function rotuloRolo(rolo: RoloDaOS) {
    return (
      [rolo.partida, rolo.cor].filter(Boolean).join(" · ") ||
      "Rolo sem identificação"
    );
  }

  function atualizar(
    index: number,
    campo: keyof ItemRoloEnfesto,
    valor: string,
  ) {
    setRolos((atual) =>
      atual.map((item, i) =>
        i === index
          ? {
              ...item,
              [campo]: campo === "metrosUsados" ? Number(valor) || 0 : valor,
            }
          : item,
      ),
    );
  }

  return (
    <form
      action={formAction}
      className="flex max-w-lg flex-col gap-3 border-t pt-4"
    >
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="folhas">Folhas</Label>
          <Input id="folhas" name="folhas" type="number" min="1" required />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="comprimento">Comprimento do risco (m)</Label>
          <Input
            id="comprimento"
            name="comprimento"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
      </div>

      {rolosDaOS.length > 0 && (
        <div className="flex flex-col gap-2">
          <Label>Rolos consumidos neste enfesto</Label>
          {rolos.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Select
                value={item.roloId}
                onValueChange={(v) => atualizar(index, "roloId", v ?? "")}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue>
                    {(valor: string | null) =>
                      rolosDaOS.find((r) => r.id === valor)
                        ? rotuloRolo(rolosDaOS.find((r) => r.id === valor)!)
                        : "Selecione o rolo"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {rolosDaOS.map((rolo) => (
                    <SelectItem key={rolo.id} value={rolo.id}>
                      {rotuloRolo(rolo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="metros"
                className="w-28"
                value={item.metrosUsados || ""}
                onChange={(e) =>
                  atualizar(index, "metrosUsados", e.target.value)
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() =>
              setRolos((atual) => [...atual, { roloId: "", metrosUsados: 0 }])
            }
          >
            Adicionar rolo
          </Button>
        </div>
      )}

      <input type="hidden" name="rolos" value={JSON.stringify(rolos)} />
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Salvando..." : "Registrar enfesto"}
      </Button>
    </form>
  );
}
