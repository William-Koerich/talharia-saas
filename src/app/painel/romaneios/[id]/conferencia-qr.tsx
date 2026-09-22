"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Button } from "@/components/ui/button";

type Item = { id: string; etiquetaCodigo: string; conferido: boolean };

export function ConferenciaQr({
  itens,
  acao,
}: {
  itens: Item[];
  acao: (itemId: string, conferido: boolean) => Promise<void>;
}) {
  const [escaneando, setEscaneando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const quadroRef = useRef<number | null>(null);
  const itensRef = useRef(itens);
  useEffect(() => {
    itensRef.current = itens;
  }, [itens]);

  function pararCamera() {
    if (quadroRef.current) cancelAnimationFrame(quadroRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setEscaneando(false);
  }

  async function iniciarCamera() {
    setMensagem(null);
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
      setMensagem("Não foi possível acessar a câmera.");
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
      void processarCodigo(codigoLido.data);
      return;
    }

    quadroRef.current = requestAnimationFrame(escanear);
  }

  async function processarCodigo(codigo: string) {
    const item = itensRef.current.find((i) => i.etiquetaCodigo === codigo);
    if (!item) {
      setMensagem(`Fardo "${codigo}" não pertence a este romaneio.`);
    } else if (item.conferido) {
      setMensagem(`${codigo} já estava conferido.`);
    } else {
      await acao(item.id, true);
      setMensagem(`${codigo} conferido.`);
    }
    quadroRef.current = requestAnimationFrame(escanear);
  }

  return (
    <div className="flex flex-col gap-3">
      {escaneando ? (
        <div className="flex flex-col gap-2">
          <video
            ref={videoRef}
            className="w-full max-w-sm rounded border"
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <Button variant="outline" size="sm" onClick={pararCamera} className="w-fit">
            Parar câmera
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={iniciarCamera} className="w-fit">
          Conferir por QR code
        </Button>
      )}
      {mensagem && <p className="text-sm">{mensagem}</p>}
    </div>
  );
}
