import { arquivo, download, n, pasta, req } from "../lib/dsl.mjs";

const hoje = "pm.variables.set('hoje', nord.hoje());";
const MODELO = "[newman] Modelo de relatório";
const modelo = (extra = {}) => ({
  nmModelo: MODELO, txDescricao: "Modelo usado pela collection", cdLayout: "R4", cdFonte: "times", inCabecalho: true, nrOpacidadeFundo: 12, inAtivo: true,
  itens: [{ nmItem: "Fachada", txOrientacao: "Foto frontal" }, { nmItem: "Interior", txOrientacao: "Cômodos" }],
  ...extra,
});
const relatorio = (extra = {}) => ({ nmTitulo: "[newman] Relatório {{nordRun}}", nmLocal: "Obra de teste", dtRelatorio: "{{hoje}}", ...extra });
const atualizarVersao = { nrVersaoRel: "body.nrVersao" };
const refrescar = req({
  nome: "GET /relatorios-fotograficos/{id} · versão atual do relatório",
  op: "GET /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", guardar: atualizarVersao,
});

export default pasta("09 Relatório fotográfico", `Modelos (RELATORIO_FOTOGRAFICO:ADMIN), relatórios, itens e fotos (ESCRITA) e compartilhamento só para ver.

Regras exercidas:
- relatório sem itens e com modelo copia os itens e o layout do modelo; modelo desativado não cria relatório (400);
- layouts válidos (R1…P6), fontes HELVETICA/TIMES/COURIER, opacidade do fundo de 3% a 60%;
- edição com nrVersao (divergente → 409); concluído não edita (422) até reabrir;
- os itens enviados substituem os do relatório; item de outro relatório → 400;
- quem recebe o compartilhamento só vê (alterar → 403); imagens do modelo: fundo ou icone.
- O modelo é fixo e reaproveitado entre execuções (não há exclusão de modelo).`, [
  pasta("Modelos", "", [
    req({ nome: "GET /relatorios-fotograficos/modelos · procura o modelo fixo", op: "GET /relatorios-fotograficos/modelos",
      testes: `var m = nord.achar(b, function (x) { return x.nmModelo === ${JSON.stringify(MODELO)}; });
nord.guardar("idModeloRel", m ? m.id : ""); nord.guardar("nrVersaoModeloRel", m ? m.nrVersao : "");` }),
    req({ nome: "POST /relatorios-fotograficos/modelos · cria o modelo fixo (primeira execução)", op: "POST /relatorios-fotograficos/modelos",
      se: "!nord.variavel('idModeloRel')", motivo: "o modelo fixo já existe",
      corpo: modelo(), guardar: { idModeloRel: "body.id", nrVersaoModeloRel: "body.nrVersao" },
      regras: [["fonte em maiúsculas e fotos por página do layout", "pm.expect(b.cdFonte).to.eql('TIMES'); pm.expect(b.nrFotosPagina).to.eql(4);"]] }),
    req({ nome: "POST /relatorios-fotograficos/modelos · fonte inválida → 400", op: "POST /relatorios-fotograficos/modelos", status: 400, erro: "ENTRADA_INVALIDA", corpo: modelo({ nmModelo: "[newman] inválido", cdFonte: "COMIC" }) }),
    req({ nome: "POST /relatorios-fotograficos/modelos · opacidade 70% → 400", op: "POST /relatorios-fotograficos/modelos", status: 400, erro: "ENTRADA_INVALIDA", corpo: modelo({ nmModelo: "[newman] inválido", nrOpacidadeFundo: 70 }) }),
    req({ nome: "POST /relatorios-fotograficos/modelos · usuário sem ADMIN do módulo → 403", op: "POST /relatorios-fotograficos/modelos", auth: "usuario", status: 403, corpo: modelo({ nmModelo: "[newman] proibido" }) }),
    req({ nome: "PUT /relatorios-fotograficos/modelos/{id} · altera e substitui os itens", op: "PUT /relatorios-fotograficos/modelos/{id}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}",
      corpo: modelo({ nrVersao: n("{{nrVersaoModeloRel}}") }), guardar: { nrVersaoModeloRel: "body.nrVersao" },
      regras: [["dois itens na ordem", "pm.expect(b.itens.map(function (i) { return i.nmItem; })).to.eql(['Fachada', 'Interior']);"]] }),
    req({ nome: "PUT /relatorios-fotograficos/modelos/{id} · versão antiga → 409", op: "PUT /relatorios-fotograficos/modelos/{id}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}", status: 409,
      pre: "pm.variables.set('velha', Number(nord.variavel('nrVersaoModeloRel')) - 1);", corpo: modelo({ nrVersao: n("{{velha}}") }) }),
    req({ nome: "POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · fundo (marca d'água)", op: "POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}/imagens/fundo",
      form: { arquivo: arquivo("imagem.png") }, regras: [["inFundo", "pm.expect(b.inFundo).to.eql(true);"]] }),
    req({ nome: "POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · ícone", op: "POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}/imagens/icone",
      form: { arquivo: arquivo("imagem.jpg") }, regras: [["inIcone", "pm.expect(b.inIcone).to.eql(true);"]] }),
    req({ nome: "POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · tipo logo → 400", op: "POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}/imagens/logo", status: 400,
      form: { arquivo: arquivo("imagem.png") } }),
    download({ nome: "fundo do modelo", op: "GET /relatorios-fotograficos/modelos/{id}/imagens/{tipo}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}/imagens/fundo", tipo: /image\/png/ }),
    req({ nome: "DELETE /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · remove o ícone", op: "DELETE /relatorios-fotograficos/modelos/{id}/imagens/{tipo}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}/imagens/icone",
      regras: [["sem ícone", "pm.expect(b.inIcone).to.eql(false);"]] }),
    req({ nome: "GET /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · sem ícone → 404", op: "GET /relatorios-fotograficos/modelos/{id}/imagens/{tipo}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}/imagens/icone", status: 404 }),
    req({ nome: "GET /relatorios-fotograficos/modelos · versão atual do modelo", op: "GET /relatorios-fotograficos/modelos",
      testes: "var m = nord.achar(b, function (x) { return x.id == nord.variavel('idModeloRel'); }); nord.guardar('nrVersaoModeloRel', m.nrVersao);" }),
    req({ nome: "PUT /relatorios-fotograficos/modelos/{id} · desativa", op: "PUT /relatorios-fotograficos/modelos/{id}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}",
      corpo: modelo({ inAtivo: false, nrVersao: n("{{nrVersaoModeloRel}}") }), guardar: { nrVersaoModeloRel: "body.nrVersao" } }),
    req({ nome: "POST /relatorios-fotograficos · modelo desativado → 400", op: "POST /relatorios-fotograficos", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: relatorio({ idModelo: n("{{idModeloRel}}") }), regras: [["avisa que está desativado", "pm.expect(j.txMensagem).to.match(/desativado/);"]] }),
    req({ nome: "PUT /relatorios-fotograficos/modelos/{id} · reativa", op: "PUT /relatorios-fotograficos/modelos/{id}", url: "/relatorios-fotograficos/modelos/{{idModeloRel}}",
      corpo: modelo({ nrVersao: n("{{nrVersaoModeloRel}}") }), guardar: { nrVersaoModeloRel: "body.nrVersao" } }),
  ]),

  pasta("Relatórios, itens e fotos", "", [
    req({ nome: "POST /relatorios-fotograficos · com modelo e sem itens copia os itens do modelo", op: "POST /relatorios-fotograficos", pre: hoje,
      corpo: relatorio({ idModelo: n("{{idModeloRel}}") }),
      guardar: { idRelatorio: "body.id", nrVersaoRel: "body.nrVersao", idItemRel: "body.itens[0].id", idItemRel2: "body.itens[1].id" },
      regras: [["itens e layout do modelo, rascunho", "pm.expect(b.itens.map(function (i) { return i.nmItem; })).to.eql(['Fachada', 'Interior']); pm.expect(b.cdLayout).to.eql('R4'); pm.expect(b.cdStatus).to.eql('RASCUNHO'); pm.expect(b.inProprio).to.eql(true);"]] }),
    req({ nome: "POST /relatorios-fotograficos · layout inválido → 400", op: "POST /relatorios-fotograficos", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: relatorio({ cdLayout: "Z9" }) }),
    req({ nome: "POST /relatorios-fotograficos · sem título → 400", op: "POST /relatorios-fotograficos", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: { dtRelatorio: "{{hoje}}" } }),
    req({ nome: "POST /relatorios-fotograficos · usuário com LEITURA → 403", op: "POST /relatorios-fotograficos", auth: "usuario", pre: hoje, status: 403, corpo: relatorio() }),
    req({ nome: "GET /relatorios-fotograficos · lista (sem itens)", op: "GET /relatorios-fotograficos",
      regras: [["o relatório aparece", "pm.expect(b.map(function (r) { return r.id; })).to.include(Number(nord.variavel('idRelatorio')));"]] }),
    req({ nome: "POST /relatorios-fotograficos/itens/{idItem}/fotos · foto no primeiro item", op: "POST /relatorios-fotograficos/itens/{idItem}/fotos", url: "/relatorios-fotograficos/itens/{{idItemRel}}/fotos",
      query: { txLegenda: "[newman] fachada" }, form: { arquivo: arquivo("imagem.jpg") }, guardar: { idFotoRel: "body.id" },
      regras: [["foto do item com legenda", "pm.expect(b.idItem).to.eql(Number(nord.variavel('idItemRel'))); pm.expect(b.txLegenda).to.eql('[newman] fachada');"]] }),
    req({ nome: "POST /relatorios-fotograficos/itens/{idItem}/fotos · arquivo que não é imagem → 400", op: "POST /relatorios-fotograficos/itens/{idItem}/fotos", url: "/relatorios-fotograficos/itens/{{idItemRel}}/fotos", status: 400,
      form: { arquivo: arquivo("texto.txt") } }),
    req({ nome: "PUT /relatorios-fotograficos/fotos/{idFoto} · legenda e ordem", op: "PUT /relatorios-fotograficos/fotos/{idFoto}", url: "/relatorios-fotograficos/fotos/{{idFotoRel}}",
      corpo: { txLegenda: "[newman] fachada (editada)", nrOrdem: 1 }, regras: [["legenda nova", "pm.expect(b.txLegenda).to.eql('[newman] fachada (editada)');"]] }),
    req({ nome: "PUT /relatorios-fotograficos/fotos/{idFoto} · ordem 0 → 400", op: "PUT /relatorios-fotograficos/fotos/{idFoto}", url: "/relatorios-fotograficos/fotos/{{idFotoRel}}", status: 400, corpo: { nrOrdem: 0 } }),
    req({ nome: "PUT /relatorios-fotograficos/fotos/{idFoto}/imagem · troca a imagem (legenda fica)", op: "PUT /relatorios-fotograficos/fotos/{idFoto}/imagem", url: "/relatorios-fotograficos/fotos/{{idFotoRel}}/imagem",
      form: { arquivo: arquivo("imagem.png") }, regras: [["legenda mantida", "pm.expect(b.txLegenda).to.eql('[newman] fachada (editada)');"]] }),
    download({ nome: "imagem da foto", op: "GET /relatorios-fotograficos/fotos/{idFoto}/imagem", url: "/relatorios-fotograficos/fotos/{{idFotoRel}}/imagem", tipo: /image\/png/ }),
    refrescar,
    req({ nome: "PUT /relatorios-fotograficos/{id} · item de outro relatório → 400", op: "PUT /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", pre: hoje, status: 400,
      corpo: relatorio({ nrVersao: n("{{nrVersaoRel}}"), itens: [{ id: 999999999, nmItem: "Intruso" }] }) }),
    req({ nome: "PUT /relatorios-fotograficos/{id} · os itens enviados substituem os atuais", op: "PUT /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", pre: hoje,
      corpo: relatorio({ nmTitulo: "[newman] Relatório editado {{nordRun}}", nrVersao: n("{{nrVersaoRel}}"), itens: [{ id: n("{{idItemRel}}"), nmItem: "Fachada editada", txResposta: "Sem patologias" }] }),
      guardar: atualizarVersao,
      regras: [["fica só o primeiro item, com a foto", "pm.expect(b.itens).to.have.length(1); pm.expect(b.itens[0].nmItem).to.eql('Fachada editada'); pm.expect(b.itens[0].fotos).to.have.length(1);"]] }),
    req({ nome: "PUT /relatorios-fotograficos/{id} · versão antiga → 409", op: "PUT /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", status: 409,
      pre: hoje + "\npm.variables.set('velha', Number(nord.variavel('nrVersaoRel')) - 1);", corpo: relatorio({ nrVersao: n("{{velha}}") }) }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/modelo · tira o modelo", op: "PUT /relatorios-fotograficos/{id}/modelo", url: "/relatorios-fotograficos/{{idRelatorio}}/modelo",
      corpo: { idModelo: null, nrVersao: n("{{nrVersaoRel}}") }, guardar: atualizarVersao, regras: [["sem modelo", "pm.expect(b.idModelo == null).to.eql(true);"]] }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/modelo · volta o modelo com itens e layout", op: "PUT /relatorios-fotograficos/{id}/modelo", url: "/relatorios-fotograficos/{{idRelatorio}}/modelo",
      corpo: { idModelo: n("{{idModeloRel}}"), nrVersao: n("{{nrVersaoRel}}"), inAdicionarItens: true, inUsarLayout: true }, guardar: atualizarVersao,
      regras: [["modelo, layout e itens do modelo acrescentados", "pm.expect(b.idModelo).to.eql(Number(nord.variavel('idModeloRel'))); pm.expect(b.cdLayout).to.eql('R4'); pm.expect(b.itens.length).to.be.at.least(3);"]] }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/status · conclui", op: "PUT /relatorios-fotograficos/{id}/status", url: "/relatorios-fotograficos/{{idRelatorio}}/status",
      corpo: { cdStatus: "CONCLUIDO", nrVersao: n("{{nrVersaoRel}}") }, guardar: atualizarVersao }),
    req({ nome: "PUT /relatorios-fotograficos/{id} · concluído não edita → 422", op: "PUT /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", pre: hoje, status: 422,
      corpo: relatorio({ nrVersao: n("{{nrVersaoRel}}") }) }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/status · status inválido → 400", op: "PUT /relatorios-fotograficos/{id}/status", url: "/relatorios-fotograficos/{{idRelatorio}}/status", status: 400,
      corpo: { cdStatus: "APROVADO", nrVersao: n("{{nrVersaoRel}}") } }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/status · reabre", op: "PUT /relatorios-fotograficos/{id}/status", url: "/relatorios-fotograficos/{{idRelatorio}}/status",
      corpo: { cdStatus: "RASCUNHO", nrVersao: n("{{nrVersaoRel}}") }, guardar: atualizarVersao }),
  ]),

  pasta("Compartilhamento", "", [
    req({ nome: "GET /relatorios-fotograficos/pessoas · com quem compartilhar", op: "GET /relatorios-fotograficos/pessoas",
      regras: [["o usuário de teste aparece", "pm.expect(b.map(function (p) { return p.id; })).to.include(Number(nord.variavel('idUsuario')));"]] }),
    req({ nome: "GET /relatorios-fotograficos/equipes · equipes que eu enxergo", op: "GET /relatorios-fotograficos/equipes" }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/compartilhamento · compartilha com o usuário de teste", op: "PUT /relatorios-fotograficos/{id}/compartilhamento", url: "/relatorios-fotograficos/{{idRelatorio}}/compartilhamento",
      corpo: { idsUsuarios: [n("{{idUsuario}}")] }, guardar: atualizarVersao,
      regras: [["lista de quem vê", "pm.expect(b.idsCompartilhados).to.eql([Number(nord.variavel('idUsuario'))]);"]] }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/compartilhamento · pessoa inexistente → 400", op: "PUT /relatorios-fotograficos/{id}/compartilhamento", url: "/relatorios-fotograficos/{{idRelatorio}}/compartilhamento", status: 400,
      corpo: { idsUsuarios: [999999999] } }),
    req({ nome: "GET /relatorios-fotograficos/{id} · quem recebeu vê", op: "GET /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", auth: "usuario",
      regras: [["não é dele", "pm.expect(b.inProprio).to.eql(false);"]] }),
    req({ nome: "GET /relatorios-fotograficos · aparece na lista de quem recebeu", op: "GET /relatorios-fotograficos", auth: "usuario",
      regras: [["o relatório aparece", "pm.expect(b.map(function (r) { return r.id; })).to.include(Number(nord.variavel('idRelatorio')));"]] }),
    req({ nome: "PUT /relatorios-fotograficos/{id}/status · quem recebeu não altera → 403", op: "PUT /relatorios-fotograficos/{id}/status", url: "/relatorios-fotograficos/{{idRelatorio}}/status", auth: "usuario", status: 403,
      corpo: { cdStatus: "CONCLUIDO", nrVersao: n("{{nrVersaoRel}}") } }),
  ]),

  pasta("Limpeza", "", [
    req({ nome: "DELETE /relatorios-fotograficos/fotos/{idFoto} · exclui a foto", op: "DELETE /relatorios-fotograficos/fotos/{idFoto}", url: "/relatorios-fotograficos/fotos/{{idFotoRel}}" }),
    refrescar,
    req({ nome: "DELETE /relatorios-fotograficos/{id} · versão antiga → 409", op: "DELETE /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", query: { nrVersao: 0 }, status: 409 }),
    req({ nome: "DELETE /relatorios-fotograficos/{id} · exclui", op: "DELETE /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", query: { nrVersao: "{{nrVersaoRel}}" } }),
    req({ nome: "GET /relatorios-fotograficos/{id} · excluído → 404", op: "GET /relatorios-fotograficos/{id}", url: "/relatorios-fotograficos/{{idRelatorio}}", status: 404 }),
  ]),
]);
