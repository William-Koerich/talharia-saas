import { exigirGestor } from "@/lib/auth";
import { FormularioUsuario } from "../formulario-usuario";

export default async function PaginaNovoUsuario() {
  await exigirGestor();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Novo usuário</h1>
      <p className="text-muted-foreground max-w-md text-sm">
        A conta já nasce ativa com essa senha temporária — combine com a pessoa
        que ela deve trocá-la no primeiro acesso.
      </p>
      <FormularioUsuario />
    </div>
  );
}
