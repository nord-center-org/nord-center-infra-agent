import { arquivo, download, n, pasta, req } from "../lib/dsl.mjs";

const limparImportados = `(b || []).filter(function (c) { return /^\\[newman\\]/.test(c.nmConvidado || ""); }).forEach(function (c) {
  pm.sendRequest({ url: nord.variavel("baseUrl") + "/api/v1/nord-tool/casamento/convidados/" + c.idConvidado, method: "DELETE", header: { Authorization: "Bearer " + nord.variavel("token") } }, function () {});
});`;

export default pasta("12 Casamento", `Planejamento do casamento (CASAMENTO): configuração, fornecedores com anexos, convidados e marcos.

Regras exercidas:
- configuração: data yyyy-MM-dd válida (é lida e regravada igual, sem mudar a real);
- fornecedor: status PESQUISANDO/ORCAMENTO/CONTRATADO, anexo PDF ou imagem (texto → 400), download sem cache, excluir leva os anexos;
- convidado: status NAO_CONVIDADO/CONVIDADO/CONFIRMADO/NAO_IRA, não acompanha a si mesmo, sem ligação circular;
- importação .xlsx: coluna Nome obrigatória, linhas inválidas voltam no relatório; outro formato → 400;
- marcos padrão só com a lista vazia; marco concluído/desfeito.`, [
  pasta("Configuração e painel", "", [
    req({ nome: "GET /casamento/configuracao · casal e data", op: "GET /casamento/configuracao", testes: "nord.guardar('cfgCasamento', b && b.dataCasamento ? JSON.stringify(b) : '');" }),
    req({ nome: "PUT /casamento/configuracao · regrava os mesmos valores", op: "PUT /casamento/configuracao", se: "nord.variavel('cfgCasamento')", motivo: "configuração ainda vazia: não grava dados de teste no lugar",
      corpo: "{{cfgCasamento}}", regras: [["nada mudou", "var a = JSON.parse(nord.variavel('cfgCasamento')); pm.expect(b.casal).to.eql(a.casal); pm.expect(b.dataCasamento).to.eql(a.dataCasamento);"]] }),
    req({ nome: "PUT /casamento/configuracao · data inexistente → 400", op: "PUT /casamento/configuracao", status: 400, erro: "ENTRADA_INVALIDA", corpo: { casal: "[newman]", dataCasamento: "2027-02-30" } }),
    req({ nome: "GET /casamento/dashboard · totais", op: "GET /casamento/dashboard",
      regras: [["contagens coerentes", "pm.expect(b.qtConvidadosConfirmados).to.be.at.most(b.qtConvidados); pm.expect(b.qtMarcosConcluidos).to.be.at.most(b.qtMarcos); pm.expect(b.pcMarcosConcluidos).to.be.within(0, 100); pm.expect(b.proximosMarcos.length).to.be.at.most(5);"]] }),
    req({ nome: "GET /casamento/dashboard · usuário sem CASAMENTO → 403", op: "GET /casamento/dashboard", auth: "usuario", status: 403, erro: "ACESSO_NEGADO" }),
  ]),

  pasta("Fornecedores e anexos", "", [
    req({ nome: "POST /casamento/fornecedores · cria", op: "POST /casamento/fornecedores",
      corpo: { nmFornecedor: "[newman] Buffet {{nordRun}}", nmCategoria: "Buffet", txContato: "buffet@nordtool.test", nmStatus: "ORCAMENTO", vlValor: 15000, txObservacao: "[newman]" },
      guardar: { idFornecedor: "body.idFornecedor" }, regras: [["status e valor", "pm.expect(b.nmStatus).to.eql('ORCAMENTO'); pm.expect(b.vlValor).to.eql(15000); pm.expect(b.qtAnexos).to.eql(0);"]] }),
    req({ nome: "POST /casamento/fornecedores · status desconhecido → 400", op: "POST /casamento/fornecedores", status: 400, corpo: { nmFornecedor: "[newman] inválido", nmCategoria: "Buffet", nmStatus: "FECHADO" } }),
    req({ nome: "POST /casamento/fornecedores · sem categoria → 400", op: "POST /casamento/fornecedores", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmFornecedor: "[newman] inválido" } }),
    req({ nome: "GET /casamento/fornecedores · lista", op: "GET /casamento/fornecedores",
      regras: [["o fornecedor aparece", "pm.expect(b.map(function (f) { return f.idFornecedor; })).to.include(Number(nord.variavel('idFornecedor')));"]] }),
    req({ nome: "GET /casamento/fornecedores/{id} · busca", op: "GET /casamento/fornecedores/{id}", url: "/casamento/fornecedores/{{idFornecedor}}" }),
    req({ nome: "PUT /casamento/fornecedores/{id} · contratado", op: "PUT /casamento/fornecedores/{id}", url: "/casamento/fornecedores/{{idFornecedor}}",
      corpo: { nmFornecedor: "[newman] Buffet {{nordRun}}", nmCategoria: "Buffet", nmStatus: "CONTRATADO", vlValor: 14000 },
      regras: [["contratado", "pm.expect(b.nmStatus).to.eql('CONTRATADO'); pm.expect(b.vlValor).to.eql(14000);"]] }),
    req({ nome: "POST /casamento/fornecedores/{id}/anexos · contrato em PDF", op: "POST /casamento/fornecedores/{id}/anexos", url: "/casamento/fornecedores/{{idFornecedor}}/anexos",
      query: { descricao: "[newman] contrato" }, form: { arquivo: arquivo("documento.pdf") }, guardar: { idAnexoCas: "body.idAnexo" },
      regras: [["PDF com descrição", "pm.expect(b.nmContentType).to.eql('application/pdf'); pm.expect(b.txDescricao).to.eql('[newman] contrato');"]] }),
    req({ nome: "POST /casamento/fornecedores/{id}/anexos · comprovante em imagem", op: "POST /casamento/fornecedores/{id}/anexos", url: "/casamento/fornecedores/{{idFornecedor}}/anexos",
      form: { arquivo: arquivo("imagem.jpg") }, regras: [["imagem aceita", "pm.expect(b.nmContentType).to.match(/image\\//);"]] }),
    req({ nome: "POST /casamento/fornecedores/{id}/anexos · texto → 400", op: "POST /casamento/fornecedores/{id}/anexos", url: "/casamento/fornecedores/{{idFornecedor}}/anexos", status: 400, form: { arquivo: arquivo("texto.txt") } }),
    req({ nome: "GET /casamento/fornecedores/{id}/anexos · dois anexos", op: "GET /casamento/fornecedores/{id}/anexos", url: "/casamento/fornecedores/{{idFornecedor}}/anexos",
      regras: [["dois", "pm.expect(b).to.have.length(2);"]] }),
    download({ nome: "arquivo do anexo (sem cache)", op: "GET /casamento/fornecedores/anexos/{idAnexo}/arquivo", url: "/casamento/fornecedores/anexos/{{idAnexoCas}}/arquivo", cache: "nenhum", tipo: /application\/pdf/ }),
    req({ nome: "DELETE /casamento/fornecedores/anexos/{idAnexo} · exclui um anexo", op: "DELETE /casamento/fornecedores/anexos/{idAnexo}", url: "/casamento/fornecedores/anexos/{{idAnexoCas}}" }),
    req({ nome: "GET /casamento/fornecedores/{id} · conta o anexo que sobrou", op: "GET /casamento/fornecedores/{id}", url: "/casamento/fornecedores/{{idFornecedor}}",
      regras: [["um anexo", "pm.expect(b.qtAnexos).to.eql(1);"]] }),
    req({ nome: "DELETE /casamento/fornecedores/{id} · exclui com os anexos", op: "DELETE /casamento/fornecedores/{id}", url: "/casamento/fornecedores/{{idFornecedor}}" }),
    req({ nome: "GET /casamento/fornecedores/{id} · excluído → 404", op: "GET /casamento/fornecedores/{id}", url: "/casamento/fornecedores/{{idFornecedor}}", status: 404 }),
  ]),

  pasta("Convidados", "", [
    req({ nome: "POST /casamento/convidados · convidado principal", op: "POST /casamento/convidados",
      corpo: { nmConvidado: "[newman] Convidado {{nordRun}}", nmGrupo: "Amigos", nrTelefone: "11999990000", nmRelacao: "Amigo", nmStatus: "CONVIDADO", nrAcompanhantes: 1, nmMesa: "M1" },
      guardar: { idConvidado: "body.idConvidado" }, regras: [["status gravado", "pm.expect(b.nmStatus).to.eql('CONVIDADO');"]] }),
    req({ nome: "POST /casamento/convidados · acompanhante ligado ao principal", op: "POST /casamento/convidados",
      corpo: { nmConvidado: "[newman] Acompanhante {{nordRun}}", nmStatus: "CONFIRMADO", idConvidadoPrincipal: n("{{idConvidado}}") },
      guardar: { idAcompanhante: "body.idConvidado" }, regras: [["nome do principal", "pm.expect(b.nmConvidadoPrincipal).to.eql('[newman] Convidado ' + nord.variavel('nordRun'));"]] }),
    req({ nome: "POST /casamento/convidados · 51 acompanhantes → 400", op: "POST /casamento/convidados", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmConvidado: "[newman] inválido", nrAcompanhantes: 51 } }),
    req({ nome: "GET /casamento/convidados · lista", op: "GET /casamento/convidados",
      regras: [["os dois aparecem", "var ids = b.map(function (c) { return c.idConvidado; }); pm.expect(ids).to.include(Number(nord.variavel('idConvidado'))); pm.expect(ids).to.include(Number(nord.variavel('idAcompanhante')));"]] }),
    req({ nome: "GET /casamento/convidados/{id} · busca", op: "GET /casamento/convidados/{id}", url: "/casamento/convidados/{{idAcompanhante}}" }),
    req({ nome: "PUT /casamento/convidados/{id} · acompanhar a si mesmo → 400", op: "PUT /casamento/convidados/{id}", url: "/casamento/convidados/{{idConvidado}}", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmConvidado: "[newman] Convidado {{nordRun}}", idConvidadoPrincipal: n("{{idConvidado}}") } }),
    req({ nome: "PUT /casamento/convidados/{id} · ligação circular → 400", op: "PUT /casamento/convidados/{id}", url: "/casamento/convidados/{{idConvidado}}", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmConvidado: "[newman] Convidado {{nordRun}}", idConvidadoPrincipal: n("{{idAcompanhante}}") }, regras: [["circular", "pm.expect(j.txMensagem).to.match(/circular/);"]] }),
    req({ nome: "PUT /casamento/convidados/{id} · confirma presença", op: "PUT /casamento/convidados/{id}", url: "/casamento/convidados/{{idConvidado}}",
      corpo: { nmConvidado: "[newman] Convidado {{nordRun}}", nmStatus: "CONFIRMADO", nrAcompanhantes: 1, nmCortejo: "Padrinho" },
      regras: [["confirmado", "pm.expect(b.nmStatus).to.eql('CONFIRMADO'); pm.expect(b.nmCortejo).to.eql('Padrinho');"]] }),
    req({ nome: "POST /casamento/convidados/importar · planilha com linha boa e linhas inválidas", op: "POST /casamento/convidados/importar", form: { planilha: arquivo("convidados.xlsx") },
      regras: [["importa a boa e relata as inválidas", "pm.expect(b.importados).to.eql(1); pm.expect(b.rejeitados.length).to.eql(2); b.rejeitados.forEach(function (r) { pm.expect(r.motivo).to.be.a('string').and.not.empty; });"]] }),
    req({ nome: "POST /casamento/convidados/importar · arquivo que não é .xlsx → 400", op: "POST /casamento/convidados/importar", status: 400, erro: "ENTRADA_INVALIDA", form: { planilha: arquivo("texto.txt") } }),
    req({ nome: "DELETE /casamento/convidados/{id} · exclui o acompanhante", op: "DELETE /casamento/convidados/{id}", url: "/casamento/convidados/{{idAcompanhante}}" }),
    req({ nome: "DELETE /casamento/convidados/{id} · exclui o principal", op: "DELETE /casamento/convidados/{id}", url: "/casamento/convidados/{{idConvidado}}" }),
    req({ nome: "GET /casamento/convidados/{id} · excluído → 404", op: "GET /casamento/convidados/{id}", url: "/casamento/convidados/{{idConvidado}}", status: 404 }),
    req({ nome: "GET /casamento/convidados · apaga os importados [newman]", op: "GET /casamento/convidados", testes: limparImportados }),
  ]),

  pasta("Marcos", "", [
    req({ nome: "GET /casamento/marcos · por prazo", op: "GET /casamento/marcos", testes: "nord.guardar('qtMarcos', (b || []).length);",
      regras: [["ordenados por prazo", "var d = b.filter(function (m) { return m.dtPrazo; }).map(function (m) { return m.dtPrazo; }); pm.expect(d).to.eql(d.slice().sort());"]] }),
    req({ nome: "POST /casamento/marcos/padrao · lista vazia cria os 10 marcos padrão", op: "POST /casamento/marcos/padrao", se: "nord.variavel('qtMarcos') === '0'", motivo: "já há marcos cadastrados",
      regras: [["dez marcos", "pm.expect(b).to.have.length(10);"]],
      testes: `(b || []).forEach(function (m) { pm.sendRequest({ url: nord.variavel("baseUrl") + "/api/v1/nord-tool/casamento/marcos/" + m.idMarco, method: "DELETE", header: { Authorization: "Bearer " + nord.variavel("token") } }, function () {}); });` }),
    req({ nome: "POST /casamento/marcos · cria", op: "POST /casamento/marcos", pre: "pm.variables.set('prazo', nord.hoje(30));",
      corpo: { nmTitulo: "[newman] Marco {{nordRun}}", dtPrazo: "{{prazo}}", txObservacao: "[newman]" }, guardar: { idMarco: "body.idMarco" },
      regras: [["nasce não concluído", "pm.expect(b.inConcluido).to.eql(false);"]] }),
    req({ nome: "POST /casamento/marcos/padrao · com marcos cadastrados → 400", op: "POST /casamento/marcos/padrao", status: 400, erro: "ENTRADA_INVALIDA" }),
    req({ nome: "GET /casamento/marcos/{id} · busca", op: "GET /casamento/marcos/{id}", url: "/casamento/marcos/{{idMarco}}" }),
    req({ nome: "PUT /casamento/marcos/{id} · edita", op: "PUT /casamento/marcos/{id}", url: "/casamento/marcos/{{idMarco}}", pre: "pm.variables.set('prazo', nord.hoje(60));",
      corpo: { nmTitulo: "[newman] Marco editado {{nordRun}}", dtPrazo: "{{prazo}}" }, regras: [["título novo", "pm.expect(b.nmTitulo).to.match(/editado/);"]] }),
    req({ nome: "PUT /casamento/marcos/{id}/concluido · conclui", op: "PUT /casamento/marcos/{id}/concluido", url: "/casamento/marcos/{{idMarco}}/concluido", corpo: { concluido: true },
      regras: [["concluído", "pm.expect(b.inConcluido).to.eql(true);"]] }),
    req({ nome: "PUT /casamento/marcos/{id}/concluido · sem o campo → 400", op: "PUT /casamento/marcos/{id}/concluido", url: "/casamento/marcos/{{idMarco}}/concluido", status: 400, corpo: {} }),
    req({ nome: "DELETE /casamento/marcos/{id} · exclui", op: "DELETE /casamento/marcos/{id}", url: "/casamento/marcos/{{idMarco}}" }),
    req({ nome: "GET /casamento/marcos/{id} · excluído → 404", op: "GET /casamento/marcos/{id}", url: "/casamento/marcos/{{idMarco}}", status: 404 }),
  ]),
]);
