import { arquivo, download, n, pasta, req } from "../lib/dsl.mjs";

const RESP = "[newman] Responsável";
const datas = "pm.variables.set('hoje', nord.hoje()); pm.variables.set('amanha', nord.hoje(1));";
const lancamento = (extra = {}) => ({ cdRequisicao: "{{reqCaixinha}}", dtLancamento: "{{hoje}}", idResponsavel: n("{{idResponsavel}}"), txInsumo: "[newman] Cimento {{nordRun}}", vlValor: 150.5, ...extra });

export default pasta("10 Caixinha", `Despesas da caixinha (CAIXINHA), responsáveis e comprovantes em PDF.

Regras exercidas:
- cdRequisicao (UUID) obrigatório; repetir devolve o lançamento já criado (sem duplicar);
- responsável precisa existir e estar ativo; nome de responsável não repete;
- edição, marcação e exclusão exigem nrVersao (divergente → 409);
- filtros: situação TODOS/A_PAGAR/PAGO/NAO_LANCADO e de <= até; resumo a pagar = total - pago;
- comprovante só PDF, envio idempotente por cdRequisicao, download sem cache (no-store).
- O responsável de teste é fixo e reaproveitado (responsável não tem exclusão).`, [
  req({ nome: "GET /caixinha/responsaveis · procura o responsável de teste", op: "GET /caixinha/responsaveis",
    testes: `var r = nord.achar(b, function (x) { return x.nmResponsavel === ${JSON.stringify(RESP)}; }); nord.guardar("idResponsavel", r ? r.idResponsavel : "");` }),
  req({ nome: "POST /caixinha/responsaveis · cria o responsável de teste (primeira execução)", op: "POST /caixinha/responsaveis",
    se: "!nord.variavel('idResponsavel')", motivo: "o responsável de teste já existe",
    corpo: { nmResponsavel: RESP, inAtivo: true }, guardar: { idResponsavel: "body.idResponsavel" } }),
  req({ nome: "POST /caixinha/responsaveis · nome repetido → 400", op: "POST /caixinha/responsaveis", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmResponsavel: RESP.toUpperCase() },
    regras: [["compara sem maiúsculas", "pm.expect(j.txMensagem).to.match(/Já existe/);"]] }),
  req({ nome: "PUT /caixinha/responsaveis/{id} · garante ativo", op: "PUT /caixinha/responsaveis/{id}", url: "/caixinha/responsaveis/{{idResponsavel}}",
    corpo: { inAtivo: true }, regras: [["ativo e com o mesmo nome", `pm.expect(b.inAtivo).to.eql(true); pm.expect(b.nmResponsavel).to.eql(${JSON.stringify(RESP)});`]] }),
  req({ nome: "POST /caixinha/lancamentos · sem cdRequisicao → 400", op: "POST /caixinha/lancamentos", pre: datas, status: 400, erro: "ENTRADA_INVALIDA", corpo: lancamento({ cdRequisicao: "" }) }),
  req({ nome: "POST /caixinha/lancamentos · usuário sem CAIXINHA → 403", op: "POST /caixinha/lancamentos", auth: "usuario", pre: datas + " pm.collectionVariables.set('reqCaixinha', nord.uuid());", status: 403, corpo: lancamento() }),
  req({ nome: "POST /caixinha/lancamentos · cria", op: "POST /caixinha/lancamentos", pre: datas + " pm.collectionVariables.set('reqCaixinha', nord.uuid());",
    corpo: lancamento(), guardar: { idLancCaixinha: "body.idLancamento", nrVersaoCaixinha: "body.nrVersao" },
    regras: [["nasce não lançado e não pago, sem comprovante", "pm.expect(b.inLancado).to.eql(false); pm.expect(b.inPago).to.eql(false); pm.expect(b.qtComprovantes).to.eql(0);"]] }),
  req({ nome: "POST /caixinha/lancamentos · mesmo cdRequisicao devolve o já criado", op: "POST /caixinha/lancamentos", pre: datas,
    corpo: lancamento({ vlValor: 999 }),
    regras: [["mesmo id e valor original (não duplica)", "pm.expect(b.idLancamento).to.eql(Number(nord.variavel('idLancCaixinha'))); pm.expect(b.vlValor).to.eql(150.5);"]] }),
  req({ nome: "POST /caixinha/lancamentos · responsável inexistente → 400", op: "POST /caixinha/lancamentos", pre: datas + " pm.variables.set('reqOutro', nord.uuid());", status: 400,
    corpo: lancamento({ cdRequisicao: "{{reqOutro}}", idResponsavel: 999999999 }) }),
  req({ nome: "GET /caixinha/lancamentos · filtro de hoje, a pagar", op: "GET /caixinha/lancamentos", pre: datas, query: { situacao: "A_PAGAR", de: "{{hoje}}", ate: "{{hoje}}" },
    regras: [["o lançamento aparece e os responsáveis vêm junto", "pm.expect(b.lancamentos.map(function (l) { return l.idLancamento; })).to.include(Number(nord.variavel('idLancCaixinha'))); pm.expect(b.responsaveis).to.not.be.empty;"]] }),
  req({ nome: "GET /caixinha/lancamentos · situação inválida → 400", op: "GET /caixinha/lancamentos", query: { situacao: "QUALQUER" }, status: 400, erro: "ENTRADA_INVALIDA" }),
  req({ nome: "GET /caixinha/lancamentos · de depois de até → 400", op: "GET /caixinha/lancamentos", pre: datas, query: { de: "{{amanha}}", ate: "{{hoje}}" }, status: 400, erro: "ENTRADA_INVALIDA" }),
  req({ nome: "GET /caixinha/lancamentos · usuário sem CAIXINHA → 403", op: "GET /caixinha/lancamentos", auth: "usuario", status: 403, erro: "ACESSO_NEGADO" }),
  req({ nome: "PUT /caixinha/lancamentos/{id} · edita", op: "PUT /caixinha/lancamentos/{id}", url: "/caixinha/lancamentos/{{idLancCaixinha}}", pre: datas,
    corpo: lancamento({ vlValor: 200, txInsumo: "[newman] Cimento editado", nrVersao: n("{{nrVersaoCaixinha}}") }), guardar: { nrVersaoCaixinha: "body.nrVersao" },
    regras: [["valor novo", "pm.expect(b.vlValor).to.eql(200);"]] }),
  req({ nome: "PUT /caixinha/lancamentos/{id} · versão antiga → 409", op: "PUT /caixinha/lancamentos/{id}", url: "/caixinha/lancamentos/{{idLancCaixinha}}", status: 409, erro: "CONFLITO_VERSAO",
    pre: datas + " pm.variables.set('velha', Number(nord.variavel('nrVersaoCaixinha')) - 1);", corpo: lancamento({ nrVersao: n("{{velha}}") }) }),
  req({ nome: "PUT /caixinha/lancamentos/{id}/marcacao · lançado e pago", op: "PUT /caixinha/lancamentos/{id}/marcacao", url: "/caixinha/lancamentos/{{idLancCaixinha}}/marcacao",
    corpo: { lancado: true, pago: true, nrVersao: n("{{nrVersaoCaixinha}}") }, guardar: { nrVersaoCaixinha: "body.nrVersao" },
    regras: [["marcado", "pm.expect(b.inLancado).to.eql(true); pm.expect(b.inPago).to.eql(true);"]] }),
  req({ nome: "PUT /caixinha/lancamentos/{id}/marcacao · sem versão → 400", op: "PUT /caixinha/lancamentos/{id}/marcacao", url: "/caixinha/lancamentos/{{idLancCaixinha}}/marcacao", status: 400, corpo: { pago: false } }),
  req({ nome: "GET /caixinha/resumo · totais do dia", op: "GET /caixinha/resumo", pre: datas, query: { de: "{{hoje}}", ate: "{{hoje}}" },
    regras: [["a pagar = total - pago e pendentes = lançamentos - pagos", "pm.expect(Math.round((b.total - b.pago) * 100)).to.eql(Math.round(b.aPagar * 100)); pm.expect(b.qtPendentes).to.eql(b.qtLancamentos - b.qtPagos); pm.expect(b.qtPagos).to.be.at.least(1);"]] }),
  req({ nome: "POST /caixinha/lancamentos/{id}/comprovantes · anexa PDF", op: "POST /caixinha/lancamentos/{id}/comprovantes", url: "/caixinha/lancamentos/{{idLancCaixinha}}/comprovantes",
    pre: "pm.collectionVariables.set('reqComprovante', nord.uuid());", query: { cdRequisicao: "{{reqComprovante}}" }, form: { arquivo: arquivo("documento.pdf") },
    guardar: { idComprovante: "body.idComprovante" }, regras: [["PDF", "pm.expect(b.nmContentType).to.eql('application/pdf'); pm.expect(b.nrTamanhoBytes).to.be.above(0);"]] }),
  req({ nome: "POST /caixinha/lancamentos/{id}/comprovantes · reenvio com o mesmo cdRequisicao não duplica", op: "POST /caixinha/lancamentos/{id}/comprovantes", url: "/caixinha/lancamentos/{{idLancCaixinha}}/comprovantes",
    query: { cdRequisicao: "{{reqComprovante}}" }, form: { arquivo: arquivo("documento.pdf") },
    regras: [["mesmo comprovante", "pm.expect(b.idComprovante).to.eql(Number(nord.variavel('idComprovante')));"]] }),
  req({ nome: "POST /caixinha/lancamentos/{id}/comprovantes · imagem não é aceita → 400", op: "POST /caixinha/lancamentos/{id}/comprovantes", url: "/caixinha/lancamentos/{{idLancCaixinha}}/comprovantes", status: 400,
    form: { arquivo: arquivo("imagem.png") } }),
  req({ nome: "GET /caixinha/lancamentos/{id}/comprovantes · um comprovante", op: "GET /caixinha/lancamentos/{id}/comprovantes", url: "/caixinha/lancamentos/{{idLancCaixinha}}/comprovantes",
    regras: [["só um (o reenvio não duplicou)", "pm.expect(b).to.have.length(1);"]] }),
  download({ nome: "PDF do comprovante", op: "GET /caixinha/comprovantes/{idComprovante}/arquivo", url: "/caixinha/comprovantes/{{idComprovante}}/arquivo", cache: "nenhum", tipo: /application\/pdf/ }),
  req({ nome: "DELETE /caixinha/comprovantes/{idComprovante} · exclui", op: "DELETE /caixinha/comprovantes/{idComprovante}", url: "/caixinha/comprovantes/{{idComprovante}}" }),
  req({ nome: "GET /caixinha/comprovantes/{idComprovante}/arquivo · excluído → 404", op: "GET /caixinha/comprovantes/{idComprovante}/arquivo", url: "/caixinha/comprovantes/{{idComprovante}}/arquivo", status: 404 }),
  req({ nome: "DELETE /caixinha/lancamentos/{id} · versão antiga → 409", op: "DELETE /caixinha/lancamentos/{id}", url: "/caixinha/lancamentos/{{idLancCaixinha}}", query: { nrVersao: 0 }, status: 409 }),
  req({ nome: "DELETE /caixinha/lancamentos/{id} · exclui", op: "DELETE /caixinha/lancamentos/{id}", url: "/caixinha/lancamentos/{{idLancCaixinha}}", query: { nrVersao: "{{nrVersaoCaixinha}}" } }),
  req({ nome: "PUT /caixinha/responsaveis/{id} · desativa o responsável", op: "PUT /caixinha/responsaveis/{id}", url: "/caixinha/responsaveis/{{idResponsavel}}",
    corpo: { inAtivo: false }, regras: [["inativo", "pm.expect(b.inAtivo).to.eql(false);"]] }),
  req({ nome: "POST /caixinha/lancamentos · responsável inativo → 400", op: "POST /caixinha/lancamentos", pre: datas + " pm.variables.set('reqOutro', nord.uuid());", status: 400,
    corpo: lancamento({ cdRequisicao: "{{reqOutro}}" }), regras: [["avisa que está inativo", "pm.expect(j.txMensagem).to.match(/inativo/);"]] }),
]);
