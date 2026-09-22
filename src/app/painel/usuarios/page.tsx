import Link from "next/link";
import { Plus } from "lucide-react";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { removerUsuario } from "./actions";

export default async function PaginaUsuarios() {
  await exigirGestor();

  const supabase = await createClient();
  const { data: usuarios } = await supabase
    .from("memberships")
    .select("id, nome, email, role, custo_hora, pin_codes(id)")
    .order("nome");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Usuários"
        description="Membros do time com acesso ao sistema"
        actions={
          <Button
            render={<Link href="/painel/usuarios/novo" />}
            nativeButton={false}
          >
            <Plus className="size-4" />
            Novo usuário
          </Button>
        }
      />

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>PIN</TableHead>
                <TableHead>Custo/hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios?.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>{usuario.nome}</TableCell>
                  <TableCell>{usuario.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{usuario.role}</Badge>
                  </TableCell>
                  <TableCell>{usuario.pin_codes ? "Definido" : "—"}</TableCell>
                  <TableCell>
                    {usuario.custo_hora != null
                      ? Number(usuario.custo_hora).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={
                        <Link
                          href={`/painel/usuarios/${usuario.id}/custo-hora`}
                        />
                      }
                      nativeButton={false}
                    >
                      Custo/hora
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      render={
                        <Link href={`/painel/usuarios/${usuario.id}/pin`} />
                      }
                      nativeButton={false}
                    >
                      Definir PIN
                    </Button>
                    {usuario.role !== "OWNER" && (
                      <form action={removerUsuario.bind(null, usuario.id)}>
                        <Button variant="ghost" size="sm" type="submit">
                          Remover
                        </Button>
                      </form>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
