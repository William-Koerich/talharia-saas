import { redirect } from "next/navigation";
import { getSessaoAtual } from "@/lib/auth";

export const metadata = {
  title: "Apontamento",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function ApontarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessao = await getSessaoAtual();

  if (!sessao) {
    redirect("/entrar");
  }

  return (
    <div className="bg-background flex min-h-svh justify-center overflow-x-hidden">
      <div className="flex w-full max-w-[380px] flex-col">{children}</div>
    </div>
  );
}
