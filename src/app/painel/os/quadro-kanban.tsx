"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { OS_STATUS, type OsStatus } from "@/lib/os-status";
import { atualizarStatusOS } from "./actions";

export type OSCard = {
  id: string;
  numero: number;
  status: OsStatus;
  prazo: string | null;
  clienteNome: string;
  modeloNome: string;
  versaoDesatualizada: boolean;
};

function Cartao({ os }: { os: OSCard }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: os.id,
    });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? {
              transform: `translate(${transform.x}px, ${transform.y}px)`,
              zIndex: 10,
            }
          : undefined
      }
      className={`bg-card ring-foreground/10 cursor-grab rounded-lg p-3 text-sm shadow-sm ring-1 transition-shadow hover:shadow-md active:cursor-grabbing ${isDragging ? "opacity-50" : ""}`}
    >
      <Link
        href={`/painel/os/${os.id}`}
        className="font-medium hover:underline"
      >
        OS #{os.numero}
      </Link>
      <p className="text-muted-foreground">{os.clienteNome}</p>
      <p className="text-muted-foreground">{os.modeloNome}</p>
      {os.prazo && (
        <p className="text-muted-foreground text-xs">Prazo: {os.prazo}</p>
      )}
      {os.versaoDesatualizada && (
        <Badge variant="secondary" className="mt-1">
          Versão desatualizada
        </Badge>
      )}
    </div>
  );
}

function Coluna({ status, ordens }: { status: OsStatus; ordens: OSCard[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const rotulo = OS_STATUS.find((s) => s.value === status)?.label ?? status;

  return (
    <div
      ref={setNodeRef}
      className={`bg-secondary/40 flex w-64 shrink-0 flex-col gap-2 rounded-xl border p-2 transition-colors ${isOver ? "bg-accent" : ""}`}
    >
      <h3 className="flex items-center justify-between px-1 pt-1 text-sm font-semibold">
        {rotulo}
        <span className="text-muted-foreground bg-background rounded-full px-1.5 py-0.5 text-xs font-normal">
          {ordens.length}
        </span>
      </h3>
      <div className="flex flex-col gap-2">
        {ordens.map((os) => (
          <Cartao key={os.id} os={os} />
        ))}
      </div>
    </div>
  );
}

export function QuadroKanban({ ordensIniciais }: { ordensIniciais: OSCard[] }) {
  const [ordensAnteriores, setOrdensAnteriores] = useState(ordensIniciais);
  const [ordens, setOrdens] = useState(ordensIniciais);
  const router = useRouter();

  if (ordensIniciais !== ordensAnteriores) {
    setOrdensAnteriores(ordensIniciais);
    setOrdens(ordensIniciais);
  }

  function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over) return;

    const novoStatus = over.id as OsStatus;
    const os = ordens.find((o) => o.id === active.id);
    if (!os || os.status === novoStatus) return;

    setOrdens((atual) =>
      atual.map((o) => (o.id === os.id ? { ...o, status: novoStatus } : o)),
    );

    atualizarStatusOS(os.id, novoStatus).then(() => router.refresh());
  }

  return (
    <DndContext onDragEnd={aoSoltar}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {OS_STATUS.map((status) => (
          <Coluna
            key={status.value}
            status={status.value}
            ordens={ordens.filter((o) => o.status === status.value)}
          />
        ))}
      </div>
    </DndContext>
  );
}
