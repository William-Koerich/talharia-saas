/**
 * Hash de PIN isomórfico (roda igual no servidor e no navegador) via Web
 * Crypto/PBKDF2 — necessário pra poder conferir o PIN offline no tablet
 * (ver /apontar), sem depender de node:crypto (scrypt não existe no browser).
 */

const ITERACOES_PBKDF2 = 100_000;

function paraHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function deHex(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function derivarChave(
  pin: string,
  salt: Uint8Array,
): Promise<Uint8Array> {
  const chaveBase = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERACOES_PBKDF2,
      hash: "SHA-256",
    },
    chaveBase,
    256,
  );
  return new Uint8Array(bits);
}

export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivarChave(pin, salt);
  return `${paraHex(salt)}:${paraHex(hash)}`;
}

export async function pinConfere(
  pin: string,
  pinHash: string,
): Promise<boolean> {
  const [saltHex, hashHex] = pinHash.split(":");
  if (!saltHex || !hashHex) return false;

  const salt = deHex(saltHex);
  const hashArmazenado = deHex(hashHex);
  const hashTentativa = await derivarChave(pin, salt);

  if (hashArmazenado.length !== hashTentativa.length) return false;
  let diferenca = 0;
  for (let i = 0; i < hashArmazenado.length; i++) {
    diferenca |= hashArmazenado[i] ^ hashTentativa[i];
  }
  return diferenca === 0;
}
