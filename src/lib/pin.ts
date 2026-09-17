import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashPin(pin: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(pin, salt, 32);
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function pinConfere(pin: string, pinHash: string): boolean {
  const [saltHex, hashHex] = pinHash.split(":");
  const salt = Buffer.from(saltHex, "hex");
  const hashArmazenado = Buffer.from(hashHex, "hex");
  const hashTentativa = scryptSync(pin, salt, 32);
  return timingSafeEqual(hashArmazenado, hashTentativa);
}
