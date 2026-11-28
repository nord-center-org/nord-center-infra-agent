import { pasta, req } from "../lib/dsl.mjs";

// Datas do cronograma vão como o front manda: dd/MM/yyyy HH:mm:ss (FormatDateTimeDeserializer).
const datas = `
function br(d) { function z(n) { return String(n).padStart(2, "0"); } return z(d.getDate()) + "/" + z(d.getMonth() + 1) + "/" + d.getFullYear() + " " + z(d.getHours()) + ":" + z(d.getMinutes()) + ":00"; }
var amanha = new Date(Date.now() + 86400000); amanha.setHours(9, 0, 0, 0);
var depois = new Date(amanha.getTime() + 2 * 86400000);
var antes = new Date(amanha.getTime() - 2 * 86400000);
pm.variables.set("dtAmanha", br(amanha)); pm.variables.set("dtDepois", br(depois)); pm.variables.set("dtAntes", br(antes));
var seg = new Date(); seg.setDate(seg.getDate() + ((8 - seg.getDay()) % 7 || 7));
pm.variables.set("proximaSegunda", seg.toISOString().slice(0, 10));
`;
const demanda = (extra = {}) => ({
  nmCronogramaSemanal: "[newman] Demanda {{nordRun}}",
  nmCategoria: "Engenharia",
  nmStatusCronograma: "pendentes",
  txObservacao: "[newman] criada pela collection",
  nmTag: "newman",
  dtAgendamento: "{{dtAmanha}}",
  flFixo: false,
  ...extra,
});

export default pasta("06 Cronograma semanal e integrações", `Demandas (CRONOGRAMA), rotina fixa (CRONOGRAMA_ROTINA), compartilhamento, equipes da obra (CRONOGRAMA:ADMIN) e links de leitura para IA.

Regras exercidas:
- status da esteira: pendentes, executar, aguardar, acompanhar, finalizada (outro → 400; demanda fora do alcance → 404);
- atividade fixa precisa de dia da semana; só fixa aceita exceção por dia;
- fim antes do início → 400; compartilhado comigo é só leitura (compartilhar o item de outro → 403);
- equipe: nome único na obra (409), ao menos uma pessoa ativa;
- link de IA: chave só na criação, até 5 ativos, revogado deixa de funcionar (404).
- interpretar com a Lugia só é testado na validação (não chama provedor de IA).`, [
  pasta("Demandas", "", [
    req({
      nome: "POST /cronogramaSemanal · cria demanda",
      op: "POST /cronogramaSemanal", pre: datas, corpo: demanda(),
      guardar: { idDemanda: "body.id" },
      regras: [
        ["é do usuário logado", "pm.expect(b.flProprio).to.eql(true); pm.expect(b.idDono).to.eql(Number(nord.variavel('idAdmin')));"],
        ["status e categoria gravados", "pm.expect(b.nmStatusCronograma).to.eql('pendentes'); pm.expect(b.nmCategoria).to.eql('Engenharia');"],
      ],
    }),
    req({ nome: "POST /cronogramaSemanal · fim antes do início → 400", op: "POST /cronogramaSemanal", pre: datas, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: demanda({ dtFimAgendamento: "{{dtAntes}}" }) }),
    req({ nome: "POST /cronogramaSemanal · fixa sem dia da semana → 400", op: "POST /cronogramaSemanal", pre: datas, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: demanda({ flFixo: true }) }),
    req({
      nome: "POST /cronogramaSemanal · atividade fixa (rotina) na segunda",
      op: "POST /cronogramaSemanal", pre: datas, corpo: demanda({ nmCronogramaSemanal: "[newman] Rotina {{nordRun}}", flFixo: true, idDiaSemana: 1, nmHorario: "07:30", dtFimAgendamento: "{{dtDepois}}" }),
      guardar: { idRotina: "body.id" },
      regras: [["fixa não tem período (fim descartado)", "pm.expect(b.flFixo).to.eql(true); pm.expect(b.dtFimAgendamento == null).to.eql(true);"]],
    }),
    req({ nome: "POST /cronogramaSemanal · usuário comum cria a própria demanda", op: "POST /cronogramaSemanal", auth: "usuario", pre: datas,
      corpo: demanda({ nmCronogramaSemanal: "[newman] Demanda do usuário {{nordRun}}" }), guardar: { idDemandaUsuario: "body.id" } }),
    req({ nome: "GET /cronogramaSemanal · lista", op: "GET /cronogramaSemanal",
      regras: [["a demanda e a rotina aparecem", "var ids = b.map(function (d) { return d.id; }); pm.expect(ids).to.include(Number(nord.variavel('idDemanda'))); pm.expect(ids).to.include(Number(nord.variavel('idRotina')));"]] }),
    req({ nome: "GET /cronogramaSemanal/{id} · busca", op: "GET /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idDemanda}}",
      regras: [["data no formato do front (dd/MM/yyyy HH:mm:ss)", "pm.expect(b.dtAgendamento).to.match(/^\\d{2}\\/\\d{2}\\/\\d{4} \\d{2}:\\d{2}:\\d{2}$/);"]] }),
    req({
      nome: "PUT /cronogramaSemanal · edita a demanda",
      op: "PUT /cronogramaSemanal", pre: datas,
      corpo: demanda({ idCronogramaSemanal: "__cru__{{idDemanda}}__fim__", nmCronogramaSemanal: "[newman] Demanda editada {{nordRun}}", dtPrazo: "{{dtDepois}}" }),
      regras: [["título e prazo novos", "pm.expect(b.nmCronogramaSemanal).to.match(/editada/); pm.expect(b.dtPrazo).to.be.a('string');"]],
    }),
    req({ nome: "PUT /cronogramaSemanal/{id}/status · move para executar", op: "PUT /cronogramaSemanal/{id}/status", url: "/cronogramaSemanal/{{idDemanda}}/status",
      corpo: { nmStatusCronograma: "Executar" },
      regras: [["status normalizado em minúsculas", "pm.expect(b.nmStatusCronograma).to.eql('executar');"]] }),
    req({ nome: "PUT /cronogramaSemanal/{id}/status · status inválido → 400", op: "PUT /cronogramaSemanal/{id}/status", url: "/cronogramaSemanal/{{idDemanda}}/status", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmStatusCronograma: "parado" } }),
    req({ nome: "PUT /cronogramaSemanal/{id}/status · demanda inexistente → 404", op: "PUT /cronogramaSemanal/{id}/status", url: "/cronogramaSemanal/999999999/status", status: 404,
      corpo: { nmStatusCronograma: "executar" } }),
    req({ nome: "GET /cronogramaSemanal/pessoas · com quem compartilhar", op: "GET /cronogramaSemanal/pessoas",
      regras: [["o usuário de teste aparece", "pm.expect(b.map(function (p) { return p.id; })).to.include(Number(nord.variavel('idUsuario')));"]] }),
    req({ nome: "PUT /cronogramaSemanal/{id}/compartilhamento · compartilha com o usuário de teste", op: "PUT /cronogramaSemanal/{id}/compartilhamento", url: "/cronogramaSemanal/{{idDemanda}}/compartilhamento",
      corpo: { idsUsuarios: ["__cru__{{idUsuario}}__fim__"] },
      regras: [["lista de quem vê", "pm.expect(b.idsCompartilhados).to.eql([Number(nord.variavel('idUsuario'))]);"]] }),
    req({ nome: "PUT /cronogramaSemanal/{id}/compartilhamento · pessoa inexistente → 400", op: "PUT /cronogramaSemanal/{id}/compartilhamento", url: "/cronogramaSemanal/{{idDemanda}}/compartilhamento", status: 400,
      corpo: { idsUsuarios: [999999999] } }),
    req({ nome: "GET /cronogramaSemanal/{id} · o usuário de teste vê o item compartilhado", op: "GET /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idDemanda}}", auth: "usuario",
      regras: [["não é dele", "pm.expect(b.flProprio).to.eql(false);"]] }),
    req({ nome: "PUT /cronogramaSemanal/{id}/compartilhamento · quem recebeu não recompartilha → 403", op: "PUT /cronogramaSemanal/{id}/compartilhamento", url: "/cronogramaSemanal/{{idDemanda}}/compartilhamento", auth: "usuario", status: 403,
      corpo: { idsUsuarios: [] } }),
    req({ nome: "PUT /cronogramaSemanal/{id}/excecoes/{data} · desmarca a rotina na próxima segunda", op: "PUT /cronogramaSemanal/{id}/excecoes/{data}", url: "/cronogramaSemanal/{{idRotina}}/excecoes/{{proximaSegunda}}", pre: datas }),
    req({ nome: "PUT /cronogramaSemanal/{id}/excecoes/{data} · demanda não fixa → 400", op: "PUT /cronogramaSemanal/{id}/excecoes/{data}", url: "/cronogramaSemanal/{{idDemanda}}/excecoes/{{proximaSegunda}}", pre: datas, status: 400 }),
    req({ nome: "GET /cronogramaSemanal/excecoes · a exceção aparece", op: "GET /cronogramaSemanal/excecoes",
      regras: [["exceção da rotina", "pm.expect(b.some(function (e) { return e.idCronogramaSemanal == nord.variavel('idRotina'); })).to.eql(true);"]] }),
    req({ nome: "DELETE /cronogramaSemanal/{id}/excecoes/{data} · reativa o dia", op: "DELETE /cronogramaSemanal/{id}/excecoes/{data}", url: "/cronogramaSemanal/{{idRotina}}/excecoes/{{proximaSegunda}}", pre: datas }),
    req({ nome: "POST /cronogramaSemanal/interpretar · texto vazio → 400 (sem chamar a IA)", op: "POST /cronogramaSemanal/interpretar", status: 400, erro: "ENTRADA_INVALIDA", corpo: { anteriores: [] } }),
    req({ nome: "POST /cronogramaSemanal/interpretar · token inválido → 401", op: "POST /cronogramaSemanal/interpretar", auth: "{{tokenInvalido}}", status: 401,
      pre: "pm.variables.set('tokenInvalido', 'x.y.z');", corpo: { texto: "reunião amanhã" } }),
    req({ nome: "DELETE /cronogramaSemanal/{id} · quem recebeu o compartilhamento não exclui → 403", op: "DELETE /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idDemanda}}", auth: "usuario", status: 403, erro: "ACESSO_NEGADO",
      regras: [["só quem criou exclui", "pm.expect(j.txMensagem).to.match(/Só quem criou/);"]] }),
    req({ nome: "DELETE /cronogramaSemanal/{id} · exclui a demanda", op: "DELETE /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idDemanda}}" }),
    req({ nome: "DELETE /cronogramaSemanal/{id} · exclui a rotina", op: "DELETE /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idRotina}}" }),
    req({ nome: "DELETE /cronogramaSemanal/{id} · o usuário exclui a própria demanda (CRONOGRAMA_EXCLUIR)", op: "DELETE /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idDemandaUsuario}}", auth: "usuario" }),
    req({ nome: "GET /cronogramaSemanal/{id} · excluída → 404", op: "GET /cronogramaSemanal/{id}", url: "/cronogramaSemanal/{{idDemanda}}", status: 404 }),
  ]),

  pasta("Equipes da obra", "Exigem CRONOGRAMA:ADMIN e a obra escolhida (X-Obra).", [
    req({
      nome: "POST /cronogramaSemanal/equipes · cria equipe na obra de teste",
      op: "POST /cronogramaSemanal/equipes",
      corpo: { nmEquipe: "[newman] Equipe {{nordRun}}", idLider: "__cru__{{idAdmin}}__fim__", idsMembros: ["__cru__{{idUsuario}}__fim__"] },
      guardar: { idEquipe: "body.id" },
      regras: [["da obra de teste, com o membro", "pm.expect(b.idObra).to.eql(Number(nord.variavel('idObra'))); pm.expect(b.idsMembros).to.include(Number(nord.variavel('idUsuario')));"]],
    }),
    req({ nome: "POST /cronogramaSemanal/equipes · nome repetido na obra → 409", op: "POST /cronogramaSemanal/equipes", status: 409,
      corpo: { nmEquipe: "[newman] Equipe {{nordRun}}", idLider: "__cru__{{idAdmin}}__fim__", idsMembros: ["__cru__{{idUsuario}}__fim__"] } }),
    req({ nome: "POST /cronogramaSemanal/equipes · sem membros → 400", op: "POST /cronogramaSemanal/equipes", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmEquipe: "[newman] Equipe vazia {{nordRun}}", idsMembros: [] } }),
    req({ nome: "POST /cronogramaSemanal/equipes · sem obra escolhida → 400", op: "POST /cronogramaSemanal/equipes", semContexto: true, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmEquipe: "[newman] Equipe sem obra", idsMembros: ["__cru__{{idUsuario}}__fim__"] } }),
    req({ nome: "POST /cronogramaSemanal/equipes · usuário sem CRONOGRAMA:ADMIN → 403", op: "POST /cronogramaSemanal/equipes", auth: "usuario", status: 403,
      corpo: { nmEquipe: "[newman] Equipe proibida", idsMembros: ["__cru__{{idUsuario}}__fim__"] } }),
    req({ nome: "GET /cronogramaSemanal/equipes · equipes que eu enxergo", op: "GET /cronogramaSemanal/equipes",
      regras: [["a equipe nova aparece", "pm.expect(b.map(function (e) { return e.id; })).to.include(Number(nord.variavel('idEquipe')));"]] }),
    req({ nome: "GET /cronogramaSemanal/equipes · o membro enxerga a equipe", op: "GET /cronogramaSemanal/equipes", auth: "usuario",
      regras: [["a equipe aparece para o membro", "pm.expect(b.map(function (e) { return e.id; })).to.include(Number(nord.variavel('idEquipe')));"]] }),
    req({ nome: "GET /cronogramaSemanal/equipes/obra · equipes da obra escolhida", op: "GET /cronogramaSemanal/equipes/obra",
      regras: [["todas da obra de teste", "b.forEach(function (e) { pm.expect(e.idObra).to.eql(Number(nord.variavel('idObra'))); });"]] }),
    req({ nome: "GET /cronogramaSemanal/equipes/hierarquia/{idLider} · sugestão pela hierarquia", op: "GET /cronogramaSemanal/equipes/hierarquia/{idLider}", url: "/cronogramaSemanal/equipes/hierarquia/{{idAdmin}}",
      regras: [["inclui o líder e quem está abaixo (usuário de teste)", "pm.expect(b).to.include(Number(nord.variavel('idAdmin'))); pm.expect(b).to.include(Number(nord.variavel('idUsuario')));"]] }),
    req({ nome: "PUT /cronogramaSemanal/equipes/{id} · renomeia", op: "PUT /cronogramaSemanal/equipes/{id}", url: "/cronogramaSemanal/equipes/{{idEquipe}}",
      corpo: { nmEquipe: "[newman] Equipe editada {{nordRun}}", idLider: "__cru__{{idAdmin}}__fim__", idsMembros: ["__cru__{{idUsuario}}__fim__", "__cru__{{idAdmin}}__fim__"] },
      regras: [["nome e membros novos", "pm.expect(b.nmEquipe).to.match(/editada/); pm.expect(b.idsMembros).to.have.length(2);"]] }),
    req({ nome: "DELETE /cronogramaSemanal/equipes/{id} · exclui", op: "DELETE /cronogramaSemanal/equipes/{id}", url: "/cronogramaSemanal/equipes/{{idEquipe}}" }),
    req({ nome: "DELETE /cronogramaSemanal/equipes/{id} · já excluída → 404", op: "DELETE /cronogramaSemanal/equipes/{id}", url: "/cronogramaSemanal/equipes/{{idEquipe}}", status: 404 }),
  ]),

  pasta("Links de leitura para IA (Integrações)", "", [
    req({
      nome: "GET /integracoes/tokens · lista (e revoga links [newman] que sobraram de outro run)",
      op: "GET /integracoes/tokens",
      regras: [["a chave nunca volta na listagem", "b.forEach(function (t) { pm.expect(t.chave == null).to.eql(true); });"]],
      testes: `(b || []).filter(function (t) { return /^\\[newman\\]/.test(t.nmRotulo || ""); }).forEach(function (t) {
  pm.sendRequest({ url: nord.variavel("baseUrl") + "/api/v1/nord-tool/integracoes/tokens/" + t.idToken, method: "DELETE", header: { Authorization: "Bearer " + nord.variavel("token") } }, function () {});
});`,
    }),
    req({ nome: "POST /integracoes/tokens · sem rótulo → 400", op: "POST /integracoes/tokens", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmRotulo: "" } }),
    req({
      nome: "POST /integracoes/tokens · cria link (a chave só aparece aqui)",
      op: "POST /integracoes/tokens", corpo: { nmRotulo: "[newman] {{nordRun}}" },
      guardar: { idLinkIa: "body.idToken", chaveLinkIa: "body.chave" },
      regras: [["chave ntk_ com 43 caracteres e escopo de leitura do cronograma", "pm.expect(b.chave).to.match(/^ntk_[A-Za-z0-9_-]{43}$/); pm.expect(b.cdEscopo).to.eql('CRONOGRAMA_LEITURA'); pm.expect(b.chave.indexOf(b.txPrefixo)).to.eql(0);"]],
    }),
    req({ nome: "GET /publico/cronograma/{chave} · relatório em JSON sem login", op: "GET /publico/cronograma/{chave}", url: "/publico/cronograma/{{chaveLinkIa}}", auth: "nenhum", semContexto: true,
      query: { formato: "json", dias: 30 }, envelope: false, schema: false,
      regras: [["relatório com o nome de quem criou o link", "pm.expect(j).to.be.an('object');"]] }),
    req({ nome: "GET /publico/cronograma/{chave} · relatório em texto", op: "GET /publico/cronograma/{chave}", url: "/publico/cronograma/{{chaveLinkIa}}", auth: "nenhum", semContexto: true,
      query: { formato: "texto", dias: 7 }, texto: true, envelope: false, schema: false,
      regras: [["texto simples", "pm.expect(String(pm.response.headers.get('Content-Type'))).to.match(/text\\/plain/); pm.expect(pm.response.text().length).to.be.above(0);"]] }),
    req({ nome: "GET /publico/cronograma/{chave} · chave inválida → 404", op: "GET /publico/cronograma/{chave}", url: "/publico/cronograma/ntk_invalida", auth: "nenhum", semContexto: true, status: 404 }),
    req({ nome: "DELETE /integracoes/tokens/{id} · revoga", op: "DELETE /integracoes/tokens/{id}", url: "/integracoes/tokens/{{idLinkIa}}" }),
    req({ nome: "GET /publico/cronograma/{chave} · revogado deixa de funcionar → 404", op: "GET /publico/cronograma/{chave}", url: "/publico/cronograma/{{chaveLinkIa}}", auth: "nenhum", semContexto: true, status: 404 }),
    req({ nome: "DELETE /integracoes/tokens/{id} · já revogado → 404", op: "DELETE /integracoes/tokens/{id}", url: "/integracoes/tokens/{{idLinkIa}}", status: 404 }),
  ]),
]);
