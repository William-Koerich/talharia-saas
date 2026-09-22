"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OSAtiva, Referencia } from "@/lib/apontamento/tipos";

export function TelaBuscarOS({
  referencia,
  nomeOperador,
  aoEncontrarOS,
  aoTrocarOperador,
}: {
  referencia: Referencia | null;
  nomeOperador: string;
  aoEncontrarOS: (os: OSAtiva) => void;
  aoTrocarOperador: () => void;
}) {
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [escaneando, setEscaneando] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const quadroRef = useRef<number | null>(null);

  function buscarPorNumero(numeroTexto: string) {
    const numero = Number(numeroTexto.trim());
    const os = referencia?.osAtivas.find((o) => o.numero === numero);

    if (!os) {
      setErro("OS não encontrada. Verifique o número ou conecte à internet.");
      return;
    }

    setErro(null);
    pararCamera();
    aoEncontrarOS(os);
  }

  function pararCamera() {
    if (quadroRef.current) cancelAnimationFrame(quadroRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setEscaneando(false);
  }

  async function iniciarCamera() {
    setErro(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setEscaneando(true);
      escanear();
    } catch {
      setErro("Não foi possível acessar a câmera. Use a busca por código.");
    }
  }

  function escanear() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      quadroRef.current = requestAnimationFrame(escanear);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imagem = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const codigoLido = jsQR(imagem.data, imagem.width, imagem.height);

    if (codigoLido?.data) {
      buscarPorNumero(codigoLido.data);
      return;
    }

    quadroRef.current = requestAnimationFrame(escanear);
  }

  useEffect(() => pararCamera, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <p className="text-lg font-medium">Olá, {nomeOperador}</p>
        <Button variant="ghost" size="sm" onClick={aoTrocarOperador}>
          Trocar
        </Button>
      </div>

      <h1 className="text-2xl font-bold">Buscar OS</h1>

      <video
        ref={videoRef}
        className={escaneando ? "w-full rounded border" : "hidden"}
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />
      {escaneando ? (
        <Button
          variant="outline"
          className="h-14 text-lg"
          onClick={pararCamera}
        >
          Cancelar
        </Button>
      ) : (
        <Button className="h-16 text-lg" onClick={iniciarCamera}>
          Ler QR da OS
        </Button>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="codigo-os" className="text-sm font-medium">
          Ou digite o número da OS
        </label>
        <div className="flex gap-2">
          <Input
            id="codigo-os"
            inputMode="numeric"
            className="h-14 text-lg"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Button className="h-14" onClick={() => buscarPorNumero(codigo)}>
            Buscar
          </Button>
        </div>
      </div>

      {erro && (
        <p className="text-destructive text-center text-lg font-medium">
          {erro}
        </p>
      )}
    </div>
  );
}
