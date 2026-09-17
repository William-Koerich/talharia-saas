import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { AcaoFila, ApontamentoAtivo, Operador, Referencia } from "./tipos";

interface ApontamentoDB extends DBSchema {
  referencia: { key: string; value: Referencia };
  fila: { key: string; value: AcaoFila };
  estado: { key: string; value: Operador | ApontamentoAtivo };
}

let dbPromise: Promise<IDBPDatabase<ApontamentoDB>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<ApontamentoDB>("talharia-apontamento", 1, {
      upgrade(db) {
        db.createObjectStore("referencia");
        db.createObjectStore("fila", { keyPath: "id" });
        db.createObjectStore("estado");
      },
    });
  }
  return dbPromise;
}

export async function salvarReferencia(referencia: Referencia) {
  const db = await getDb();
  await db.put("referencia", referencia, "dados");
}

export async function lerReferencia(): Promise<Referencia | undefined> {
  const db = await getDb();
  return db.get("referencia", "dados");
}

export async function salvarOperador(operador: Operador) {
  const db = await getDb();
  await db.put("estado", operador, "operador");
}

export async function lerOperador(): Promise<Operador | undefined> {
  const db = await getDb();
  return db.get("estado", "operador") as Promise<Operador | undefined>;
}

export async function limparOperador() {
  const db = await getDb();
  await db.delete("estado", "operador");
}

export async function salvarApontamentoAtivo(ativo: ApontamentoAtivo) {
  const db = await getDb();
  await db.put("estado", ativo, "apontamentoAtivo");
}

export async function lerApontamentoAtivo(): Promise<
  ApontamentoAtivo | undefined
> {
  const db = await getDb();
  return db.get("estado", "apontamentoAtivo") as Promise<
    ApontamentoAtivo | undefined
  >;
}

export async function limparApontamentoAtivo() {
  const db = await getDb();
  await db.delete("estado", "apontamentoAtivo");
}

export async function enfileirarAcao(acao: AcaoFila) {
  const db = await getDb();
  await db.put("fila", acao);
}

export async function listarFila(): Promise<AcaoFila[]> {
  const db = await getDb();
  const todas = await db.getAll("fila");
  return todas.sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
}

export async function removerDaFila(id: string) {
  const db = await getDb();
  await db.delete("fila", id);
}

export async function contarFila(): Promise<number> {
  const db = await getDb();
  return db.count("fila");
}
