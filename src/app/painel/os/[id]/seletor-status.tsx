"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OS_STATUS, type OsStatus } from "@/lib/os-status";
import { atualizarStatusOS } from "../actions";

export function SeletorStatus({
  osId,
  status,
}: {
  osId: string;
  status: OsStatus;
}) {
  const router = useRouter();

  return (
    <Select
      defaultValue={status}
      onValueChange={(valor) => {
        atualizarStatusOS(osId, valor as OsStatus).then(() => router.refresh());
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue>
          {(valor: string | null) =>
            OS_STATUS.find((s) => s.value === valor)?.label
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {OS_STATUS.map((s) => (
          <SelectItem key={s.value} value={s.value}>
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
