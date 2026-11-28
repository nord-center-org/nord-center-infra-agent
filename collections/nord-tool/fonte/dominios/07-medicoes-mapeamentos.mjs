import { n, pasta, req } from "../lib/dsl.mjs";

const medicao = (extra = {}) => ({
  nrMedicao: 1,
  cdContrato: "NW-{{nordRun}}",
  nmRazaoSocial: "[newman] Construtora de teste",
  nrContrato: "CT-{{nordRun}}",
  dtMedicao: "{{hoje}}",
  vlMedicao: 1234.56,
  txMemorial: "[newman] memorial",
  ...extra,
});
const hoje = "pm.variables.set('hoje', nord.hoje());";
const mapeamento = (extra = {}) => ({
  cdTipo: "QUANTITATIVO",
  nmTitulo: "[newman] Mapeamento {{nordRun}}",
  nmLocal: "Torre A",
  dtMapeamento: "{{hoje}}",
  pcTolerancia: 5,
  linhas: [
    { nmGrupo: "Alvenaria", nmItem: "Bloco cerâmico", nmUnidade: "un", qtProjeto: 100, qtMedida: 98, qtSolicitada: 2 },
    { nmGrupo: "Alvenaria", nmItem: "Argamassa", nmUnidade: "kg", qtProjeto: 50, qtMedida: 51 },
  ],
  ...extra,
});

export default pasta("07 Medições, mapeamentos e cubicagem", `Medições de contrato (MEDICOES), mapeamentos de campo (MAPEAMENTOS) e cubicagem de concreto (CUBICAGEM).

Regras exercidas:
- toda edição/exclusão exige nrVersao; versão divergente → 409 CONFLITO_VERSAO; sem versão → 400;
- medição: status vazio vira PENDENTE, status inexistente → 400, contrato + nº da medição não repete (422 REGISTRO_DUPLICADO);
- mapeamento: tipo CONTAGEM ou QUANTITATIVO, concluído não edita (422) até reabrir, entra na fase do contexto;
- cubicagem: peças em lista JSON, versão obrigatória e conflito em outro aparelho → 409.`, [
  pasta("Medições", "", [
    req({ nome: "GET /medicoes · lista e status disponíveis", op: "GET /medicoes",
      guardar: { cdStatusMedicao: "(b.status.filter(function (s) { return s.inAtivo !== false && s.cdStatus !== 'PENDENTE'; })[0] || {}).cdStatus" },
      regras: [["status inclui PENDENTE", "pm.expect(b.status.map(function (s) { return s.cdStatus; })).to.include('PENDENTE');"]] }),
    req({
      nome: "POST /medicoes · cria (status vazio vira PENDENTE)",
      op: "POST /medicoes", pre: hoje, corpo: medicao(),
      guardar: { idMedicao: "body.id", nrVersaoMedicao: "body.nrVersao" },
      regras: [["PENDENTE e na fase de teste", "pm.expect(b.cdStatus).to.eql('PENDENTE'); pm.expect(b.idFase).to.eql(Number(nord.variavel('idFase')));"],
        ["valor com centavos", "pm.expect(b.vlMedicao).to.eql(1234.56);"]],
    }),
    req({ nome: "POST /medicoes · mesmo contrato e nº → 422 REGISTRO_DUPLICADO", op: "POST /medicoes", pre: hoje, status: 422, erro: "REGISTRO_DUPLICADO", corpo: medicao() }),
    req({ nome: "POST /medicoes · status inexistente → 400", op: "POST /medicoes", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: medicao({ nrMedicao: 2, cdStatus: "NAO_EXISTE" }) }),
    req({ nome: "POST /medicoes · valor zero → 400", op: "POST /medicoes", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: medicao({ nrMedicao: 3, vlMedicao: 0 }) }),
    req({ nome: "POST /medicoes · usuário com MEDICOES:LEITURA → 403", op: "POST /medicoes", auth: "usuario", pre: hoje, status: 403, erro: "ACESSO_NEGADO", corpo: medicao({ nrMedicao: 4 }) }),
    req({ nome: "GET /medicoes · usuário com LEITURA vê a medição da fase", op: "GET /medicoes", auth: "usuario",
      regras: [["a medição aparece", "pm.expect(b.medicoes.map(function (m) { return m.id; })).to.include(Number(nord.variavel('idMedicao')));"]] }),
    req({
      nome: "PUT /medicoes/{id} · edita com a versão atual",
      op: "PUT /medicoes/{id}", url: "/medicoes/{{idMedicao}}", pre: hoje,
      corpo: medicao({ vlMedicao: 2000, txMemorial: "[newman] memorial editado", nrVersao: n("{{nrVersaoMedicao}}") }),
      guardar: { nrVersaoMedicao: "body.nrVersao" },
      regras: [["mantém o status quando não vem no formulário", "pm.expect(b.cdStatus).to.eql('PENDENTE'); pm.expect(b.vlMedicao).to.eql(2000);"]],
    }),
    req({ nome: "PUT /medicoes/{id} · versão antiga → 409", op: "PUT /medicoes/{id}", url: "/medicoes/{{idMedicao}}", status: 409, erro: "CONFLITO_VERSAO",
      pre: hoje + "\npm.variables.set('velha', Number(nord.variavel('nrVersaoMedicao')) - 1);", corpo: medicao({ nrVersao: n("{{velha}}") }),
      regras: [["mensagem pede para sincronizar", "pm.expect(j.txMensagem).to.match(/Sincronize/);"]] }),
    req({ nome: "PUT /medicoes/{id} · sem versão → 400", op: "PUT /medicoes/{id}", url: "/medicoes/{{idMedicao}}", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: medicao() }),
    req({
      nome: "PUT /medicoes/{id}/status · troca só o status",
      op: "PUT /medicoes/{id}/status", url: "/medicoes/{{idMedicao}}/status",
      se: "nord.variavel('cdStatusMedicao')", motivo: "não há outro status ativo além de PENDENTE",
      corpo: { cdStatus: "{{cdStatusMedicao}}", nrVersao: n("{{nrVersaoMedicao}}") },
      guardar: { nrVersaoMedicao: "body.nrVersao" },
      regras: [["status novo e nome do status", "pm.expect(b.cdStatus).to.eql(nord.variavel('cdStatusMedicao')); pm.expect(b.nmStatus).to.be.a('string');"]],
    }),
    req({ nome: "PUT /medicoes/{id}/status · medição inexistente → 404", op: "PUT /medicoes/{id}/status", url: "/medicoes/999999999/status", status: 404,
      corpo: { cdStatus: "PENDENTE", nrVersao: 0 } }),
    req({ nome: "DELETE /medicoes/{id} · versão antiga → 409", op: "DELETE /medicoes/{id}", url: "/medicoes/{{idMedicao}}", query: { nrVersao: 0 }, status: 409, erro: "CONFLITO_VERSAO" }),
    req({ nome: "DELETE /medicoes/{id} · exclui com a versão atual", op: "DELETE /medicoes/{id}", url: "/medicoes/{{idMedicao}}", query: { nrVersao: "{{nrVersaoMedicao}}" } }),
    req({ nome: "DELETE /medicoes/{id} · já excluída → 404", op: "DELETE /medicoes/{id}", url: "/medicoes/{{idMedicao}}", query: { nrVersao: "{{nrVersaoMedicao}}" }, status: 404 }),
  ]),

  pasta("Mapeamentos", "", [
    req({
      nome: "POST /mapeamentos · cria quantitativo com linhas",
      op: "POST /mapeamentos", pre: hoje, corpo: mapeamento(),
      guardar: { idMapeamento: "body.id", nrVersaoMap: "body.nrVersao" },
      regras: [["rascunho na fase de teste, duas linhas", "pm.expect(b.cdStatus).to.eql('RASCUNHO'); pm.expect(b.idFase).to.eql(Number(nord.variavel('idFase'))); pm.expect(b.linhas).to.have.length(2);"]],
    }),
    req({ nome: "POST /mapeamentos · tipo inválido → 400", op: "POST /mapeamentos", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: mapeamento({ cdTipo: "OUTRO" }) }),
    req({ nome: "POST /mapeamentos · tolerância acima de 100 → 400", op: "POST /mapeamentos", pre: hoje, status: 400, erro: "ENTRADA_INVALIDA", corpo: mapeamento({ pcTolerancia: 150 }) }),
    req({ nome: "POST /mapeamentos · usuário sem MAPEAMENTOS → 403", op: "POST /mapeamentos", auth: "usuario", pre: hoje, status: 403, corpo: mapeamento() }),
    req({ nome: "GET /mapeamentos · lista (sem linhas)", op: "GET /mapeamentos",
      regras: [["o mapeamento aparece sem as linhas", "var m = nord.achar(b, function (x) { return x.id == nord.variavel('idMapeamento'); }); pm.expect(m.qtLinhas).to.eql(2); pm.expect(m.linhas == null || m.linhas.length === 0).to.eql(true);"]] }),
    req({ nome: "GET /mapeamentos/{id} · detalha com linhas", op: "GET /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}",
      regras: [["linhas na ordem", "pm.expect(b.linhas.map(function (l) { return l.nmItem; })).to.eql(['Bloco cerâmico', 'Argamassa']);"]] }),
    req({
      nome: "PUT /mapeamentos/{id} · substitui as linhas",
      op: "PUT /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}", pre: hoje,
      corpo: mapeamento({ nrVersao: n("{{nrVersaoMap}}"), linhas: [{ nmItem: "Concreto", nmUnidade: "m3", qtProjeto: 10, qtMedida: 9.5 }] }),
      guardar: { nrVersaoMap: "body.nrVersao" },
      regras: [["uma linha só", "pm.expect(b.linhas).to.have.length(1); pm.expect(b.linhas[0].nmItem).to.eql('Concreto');"]],
    }),
    req({ nome: "PUT /mapeamentos/{id} · versão antiga → 409", op: "PUT /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}", status: 409, erro: "CONFLITO_VERSAO",
      pre: hoje + "\npm.variables.set('velha', Number(nord.variavel('nrVersaoMap')) - 1);", corpo: mapeamento({ nrVersao: n("{{velha}}") }) }),
    req({ nome: "PUT /mapeamentos/{id}/status · conclui", op: "PUT /mapeamentos/{id}/status", url: "/mapeamentos/{{idMapeamento}}/status",
      corpo: { cdStatus: "CONCLUIDO", nrVersao: n("{{nrVersaoMap}}") }, guardar: { nrVersaoMap: "body.nrVersao" },
      regras: [["CONCLUIDO", "pm.expect(b.cdStatus).to.eql('CONCLUIDO');"]] }),
    req({ nome: "PUT /mapeamentos/{id} · concluído não edita → 422", op: "PUT /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}", pre: hoje, status: 422, erro: "REGRA_NEGOCIO",
      corpo: mapeamento({ nrVersao: n("{{nrVersaoMap}}") }), regras: [["pede para reabrir", "pm.expect(j.txMensagem).to.match(/Reabra/);"]] }),
    req({ nome: "PUT /mapeamentos/{id}/status · status inválido → 400", op: "PUT /mapeamentos/{id}/status", url: "/mapeamentos/{{idMapeamento}}/status", status: 400,
      corpo: { cdStatus: "APROVADO", nrVersao: n("{{nrVersaoMap}}") } }),
    req({ nome: "PUT /mapeamentos/{id}/status · reabre", op: "PUT /mapeamentos/{id}/status", url: "/mapeamentos/{{idMapeamento}}/status",
      corpo: { cdStatus: "RASCUNHO", nrVersao: n("{{nrVersaoMap}}") }, guardar: { nrVersaoMap: "body.nrVersao" } }),
    req({ nome: "DELETE /mapeamentos/{id} · sem versão → 400", op: "DELETE /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}", status: 400 }),
    req({ nome: "DELETE /mapeamentos/{id} · exclui", op: "DELETE /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}", query: { nrVersao: "{{nrVersaoMap}}" } }),
    req({ nome: "GET /mapeamentos/{id} · excluído → 404", op: "GET /mapeamentos/{id}", url: "/mapeamentos/{{idMapeamento}}", status: 404 }),
  ]),

  pasta("Cubicagem", "Volume de concreto: cada pessoa vê só as próprias cubicagens.", [
    req({
      nome: "POST /cubicagens · cria com duas peças",
      op: "POST /cubicagens",
      corpo: { nmTitulo: "[newman] Cubicagem {{nordRun}}", nrPerda: 5, pecas: [{ nome: "Pilar P1", largura: 0.2, comprimento: 0.4, altura: 3, quantidade: 4 }, { nome: "Viga V1", largura: 0.15, comprimento: 5, altura: 0.4, quantidade: 2 }] },
      guardar: { idCubicagem: "body.id", nrVersaoCub: "body.nrVersao" },
      regras: [["guarda as duas peças", "pm.expect(b.pecas).to.have.length(2); pm.expect(b.nrPerda).to.eql(5);"]],
    }),
    req({ nome: "POST /cubicagens · peças que não são lista → 400", op: "POST /cubicagens", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmTitulo: "[newman] inválida", pecas: { nome: "x" } } }),
    req({ nome: "POST /cubicagens · perda acima de 50% → 400", op: "POST /cubicagens", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmTitulo: "[newman] inválida", nrPerda: 60, pecas: [] } }),
    req({ nome: "GET /cubicagens · minhas cubicagens (sem as peças)", op: "GET /cubicagens",
      regras: [["aparece sem as peças", "var c = nord.achar(b, function (x) { return x.id == nord.variavel('idCubicagem'); }); pm.expect(c.qtPecas).to.eql(2); pm.expect(c.pecas == null).to.eql(true);"]] }),
    req({ nome: "GET /cubicagens/{id} · abre com as peças", op: "GET /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}",
      regras: [["peças na ordem gravada", "pm.expect(b.pecas.map(function (p) { return p.nome; })).to.eql(['Pilar P1', 'Viga V1']);"]] }),
    req({ nome: "GET /cubicagens/{id} · de outra pessoa → 404", op: "GET /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}", auth: "usuario", status: [403, 404] }),
    req({
      nome: "PUT /cubicagens/{id} · salva com a versão da tela",
      op: "PUT /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}",
      corpo: { nmTitulo: "[newman] Cubicagem editada {{nordRun}}", nrPerda: 10, pecas: [{ nome: "Laje L1", largura: 4, comprimento: 5, altura: 0.12, quantidade: 1 }], nrVersao: n("{{nrVersaoCub}}") },
      guardar: { nrVersaoCub: "body.nrVersao" },
      regras: [["uma peça e versão nova", "pm.expect(b.pecas).to.have.length(1); pm.expect(b.nrVersao).to.be.above(0);"]],
    }),
    req({ nome: "PUT /cubicagens/{id} · versão antiga (outro aparelho) → 409", op: "PUT /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}", status: 409,
      pre: "pm.variables.set('velha', Number(nord.variavel('nrVersaoCub')) - 1);",
      corpo: { nmTitulo: "[newman] conflito", pecas: [], nrVersao: n("{{velha}}") } }),
    req({ nome: "PUT /cubicagens/{id} · sem versão → 400", op: "PUT /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmTitulo: "[newman] sem versão", pecas: [] } }),
    req({ nome: "DELETE /cubicagens/{id} · exclui", op: "DELETE /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}" }),
    req({ nome: "GET /cubicagens/{id} · excluída → 404", op: "GET /cubicagens/{id}", url: "/cubicagens/{{idCubicagem}}", status: 404 }),
  ]),
]);
