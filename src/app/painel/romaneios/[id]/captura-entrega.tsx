"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Button } from "@/components/ui/button";
import type { EstadoForm } from "../actions";

export function CapturaEntrega({
  acao,
}: {
  acao: (estado: EstadoForm, formData: FormData) => Promise<EstadoForm>;
}) {
  const [estado, formAction, pending] = useActionState(acao, {
    erro: null,
  } as EstadoForm);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fotoCanvasRef = useRef<HTMLCanvasElement>(null);
  const assinaturaCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const desenhandoRef = useRef(false);

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [fotoCapturada, setFotoCapturada] = useState(false);
  const [assinaturaVazia, setAssinaturaVazia] = useState(true);
  const [avisoCamera, setAvisoCamera] = useState<string | null>(null);

  useEffect(() => {
    const ctx = assinaturaCanvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  useEffect(
    () => () => streamRef.current?.getTracks().forEach((t) => t.stop()),
    [],
  );

  async function iniciarCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraAtiva(true);
    } catch {
      /* usuário negou o acesso — mantém o botão para nova tentativa */
    }
  }

  function capturarFoto() {
    const video = videoRef.current;
    const canvas = fotoCanvasRef.current;
    if (!video || !canvas) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setAvisoCamera(
        "Câmera ainda carregando, aguarde um instante e tente novamente.",
      );
      return;
    }
    setAvisoCamera(null);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFotoCapturada(true);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraAtiva(false);
  }

  function posicao(e: PointerEvent<HTMLCanvasElement>) {
    const canvas = assinaturaCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function iniciarTraco(e: PointerEvent<HTMLCanvasElement>) {
    desenhandoRef.current = true;
    const ctx = assinaturaCanvasRef.current?.getContext("2d");
    const { x, y } = posicao(e);
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  }

  function desenhar(e: PointerEvent<HTMLCanvasElement>) {
    if (!desenhandoRef.current) return;
    const ctx = assinaturaCanvasRef.current?.getContext("2d");
    const { x, y } = posicao(e);
    ctx?.lineTo(x, y);
    ctx?.stroke();
    setAssinaturaVazia(false);
  }

  function pararTraco() {
    desenhandoRef.current = false;
  }

  function limparAssinatura() {
    const canvas = assinaturaCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setAssinaturaVazia(true);
  }

  async function finalizarEntrega() {
    const fotoCanvas = fotoCanvasRef.current;
    const assinaturaCanvas = assinaturaCanvasRef.current;
    if (!fotoCanvas || !fotoCapturada || !assinaturaCanvas || assinaturaVazia)
      return;

    const fotoBlob = await new Promise<Blob | null>((resolve) =>
      fotoCanvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    const assinaturaBlob = await new Promise<Blob | null>((resolve) =>
      assinaturaCanvas.toBlob(resolve, "image/png"),
    );
    if (!fotoBlob || !assinaturaBlob) return;

    const formData = new FormData();
    formData.set(
      "foto",
      new File([fotoBlob], "foto.jpg", { type: "image/jpeg" }),
    );
    formData.set(
      "assinatura",
      new File([assinaturaBlob], "assinatura.png", { type: "image/png" }),
    );
    formAction(formData);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Foto da entrega</p>
        <video
          ref={videoRef}
          className={cameraAtiva ? "w-full max-w-sm rounded border" : "hidden"}
          playsInline
          muted
        />
        {cameraAtiva ? (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={capturarFoto}
              className="w-fit"
            >
              Capturar
            </Button>
            {avisoCamera && (
              <p className="text-muted-foreground text-sm">{avisoCamera}</p>
            )}
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={iniciarCamera}
            className="w-fit"
          >
            {fotoCapturada ? "Tirar outra foto" : "Abrir câmera"}
          </Button>
        )}
        <canvas
          ref={fotoCanvasRef}
          className={
            fotoCapturada ? "w-full max-w-sm rounded border" : "hidden"
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Assinatura do recebedor</p>
        <canvas
          ref={assinaturaCanvasRef}
          width={320}
          height={160}
          className="touch-none rounded border bg-white"
          onPointerDown={iniciarTraco}
          onPointerMove={desenhar}
          onPointerUp={pararTraco}
          onPointerLeave={pararTraco}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={limparAssinatura}
          className="w-fit"
        >
          Limpar assinatura
        </Button>
      </div>

      <Button
        type="button"
        disabled={pending || !fotoCapturada || assinaturaVazia}
        onClick={finalizarEntrega}
        className="w-fit"
      >
        {pending ? "Enviando..." : "Finalizar entrega"}
      </Button>
      {estado.erro && <p className="text-destructive text-sm">{estado.erro}</p>}
    </div>
  );
}
