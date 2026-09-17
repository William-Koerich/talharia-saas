import { notFound } from "next/navigation";
import { exigirGestor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TIPOS_ARQUIVO_MODELO } from "@/lib/tipos-arquivo-modelo";
import { FormularioDetalhes } from "./formulario-detalhes";
import { FormularioParte } from "./formulario-parte";
import { FormularioConsumo } from "./formulario-consumo";
import { FormularioArquivo } from "./formulario-arquivo";
import {
  atualizarVersao,
  adicionarParte,
  removerParte,
  adicionarConsumo,
  removerConsumo,
  enviarArquivo,
  excluirArquivo,
} from "./actions";

const SENTIDO_FIO_LABEL: Record<string, string> = {
  fio_reto: "Fio reto",
  vies: "Viés",
  indiferente: "Indiferente",
};

export default async function PaginaVersao({
  params,
}: PageProps<"/painel/modelos/[id]/versoes/[versaoId]">) {
  await exigirGestor();
  const { id: modeloId, versaoId } = await params;

  const supabase = await createClient();
  const [
    { data: versao },
    { data: modelo },
    { data: partes },
    { data: consumos },
    { data: arquivos },
  ] = await Promise.all([
    supabase
      .from("modelo_versoes")
      .select("versao, vigente, largura_exigida, eficiencia_encaixe")
      .eq("id", versaoId)
      .maybeSingle(),
    supabase.from("modelos").select("nome").eq("id", modeloId).maybeSingle(),
    supabase
      .from("modelo_partes")
      .select("id, nome, qtd_por_peca, sentido_fio, par, entretela")
      .eq("modelo_versao_id", versaoId)
      .order("nome"),
    supabase
      .from("consumo_teorico_tamanho")
      .select("id, tamanho, consumo_metros")
      .eq("modelo_versao_id", versaoId)
      .order("tamanho"),
    supabase
      .from("modelo_arquivos")
      .select("id, tipo, storage_path, nome_original")
      .eq("modelo_versao_id", versaoId)
      .order("created_at", { ascending: false }),
  ]);

  if (!versao || !modelo) notFound();

  const arquivosComUrl = await Promise.all(
    (arquivos ?? []).map(async (arquivo) => {
      const { data } = await supabase.storage
        .from("arquivos")
        .createSignedUrl(arquivo.storage_path, 300);
      return { ...arquivo, url: data?.signedUrl ?? null };
    }),
  );

  const rotuloTipoArquivo = (tipo: string) =>
    TIPOS_ARQUIVO_MODELO.find((t) => t.value === tipo)?.label ?? tipo;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">
          {modelo.nome} — v{versao.versao}
        </h1>
        {!versao.vigente && (
          <p className="text-destructive mt-1 text-sm">
            Esta não é a versão vigente — não pode ser usada em novas Ordens de
            Serviço.
          </p>
        )}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Detalhes</h2>
        <FormularioDetalhes
          versao={versao}
          modeloId={modeloId}
          versaoId={versaoId}
          acao={atualizarVersao.bind(null, modeloId, versaoId)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Partes</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Qtd/peça</TableHead>
              <TableHead>Sentido do fio</TableHead>
              <TableHead>Par</TableHead>
              <TableHead>Entretela</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partes?.map((parte) => (
              <TableRow key={parte.id}>
                <TableCell>{parte.nome}</TableCell>
                <TableCell>{parte.qtd_por_peca}</TableCell>
                <TableCell>
                  {SENTIDO_FIO_LABEL[parte.sentido_fio] ?? parte.sentido_fio}
                </TableCell>
                <TableCell>{parte.par ? "Sim" : "Não"}</TableCell>
                <TableCell>{parte.entretela ? "Sim" : "Não"}</TableCell>
                <TableCell className="text-right">
                  <form
                    action={removerParte.bind(
                      null,
                      modeloId,
                      versaoId,
                      parte.id,
                    )}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      Remover
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {partes?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground text-center"
                >
                  Nenhuma parte cadastrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <FormularioParte acao={adicionarParte.bind(null, modeloId, versaoId)} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">
          Grade e consumo teórico por tamanho
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tamanho</TableHead>
              <TableHead>Consumo (m)</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consumos?.map((consumo) => (
              <TableRow key={consumo.id}>
                <TableCell>{consumo.tamanho}</TableCell>
                <TableCell>{consumo.consumo_metros}</TableCell>
                <TableCell className="text-right">
                  <form
                    action={removerConsumo.bind(
                      null,
                      modeloId,
                      versaoId,
                      consumo.id,
                    )}
                  >
                    <Button variant="ghost" size="sm" type="submit">
                      Remover
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {consumos?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-muted-foreground text-center"
                >
                  Nenhum tamanho cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <FormularioConsumo
          acao={adicionarConsumo.bind(null, modeloId, versaoId)}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Arquivos</h2>
        <div className="flex flex-col gap-4">
          {arquivosComUrl.map((arquivo) => (
            <div key={arquivo.id} className="flex flex-col gap-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {rotuloTipoArquivo(arquivo.tipo)} — {arquivo.nome_original}
                </p>
                <form
                  action={excluirArquivo.bind(
                    null,
                    modeloId,
                    versaoId,
                    arquivo.id,
                    arquivo.storage_path,
                  )}
                >
                  <Button variant="ghost" size="sm" type="submit">
                    Excluir
                  </Button>
                </form>
              </div>
              {arquivo.url && arquivo.tipo === "croqui" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={arquivo.url}
                  alt={arquivo.nome_original ?? ""}
                  className="max-w-sm rounded border"
                />
              )}
              {arquivo.url && arquivo.tipo === "risco_pdf" && (
                <iframe
                  src={arquivo.url}
                  className="h-96 w-full rounded border"
                />
              )}
              {arquivo.url &&
                (arquivo.tipo === "plt" || arquivo.tipo === "dxf") && (
                  <a
                    href={arquivo.url}
                    className="text-primary text-sm underline-offset-4 hover:underline"
                  >
                    Baixar arquivo
                  </a>
                )}
            </div>
          ))}
          {arquivosComUrl.length === 0 && (
            <p className="text-muted-foreground text-sm">
              Nenhum arquivo enviado.
            </p>
          )}
        </div>
        <FormularioArquivo
          acao={enviarArquivo.bind(null, modeloId, versaoId)}
        />
      </section>
    </div>
  );
}
