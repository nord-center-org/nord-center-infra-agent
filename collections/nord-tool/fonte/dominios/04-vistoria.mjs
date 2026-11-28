import { arquivo, download, pasta, req } from "../lib/dsl.mjs";

// Apartamentos da fase de teste: o nome começa com a sigla NWQA, que liga o apartamento à fase (faseParaCriar).
const aptoForm = (nome, extra = {}) => ({
  nmApartamentoVistoria: nome,
  idDiaSemana: "__cru__{{idDiaSemana}}__fim__",
  dtApartamentoVigente: "{{hoje}}",
  nmHorarioVistoria: "08:00",
  idStatusVistoria: "__cru__{{idStatusVistoria}}__fim__",
  inMarcarRevistoria: false,
  txObservacaoRevistoria: "[newman] vistoria de teste",
  ...extra,
});
const hoje = "pm.variables.set('hoje', nord.hoje()); pm.collectionVariables.set('nmApto', 'NWQA-' + nord.variavel('nordRun').slice(-5).toUpperCase());";

export default pasta("04 Vistoria e termos de reprova", `Apartamentos em vistoria (VISTORIA), histórico de alterações e termos de reprova em PDF com fotos (TERMO_REPROVA).

Regras exercidas:
- o apartamento entra na fase pela sigla do nome (NWQA-…);
- editar gera histórico; apartamento com histórico não pode ser excluído (422 REGISTRO_EM_USO), sem histórico exclui;
- lista filtrada pagina de 1 a 100 por página;
- termo: número automático (max + 1), páginas de 1 a 80, concluir exige foto, foto em página inexistente → 400,
  trocar o PDF por um com menos páginas remove as fotos das páginas que sumiram (aviso), imagem e miniatura vão juntas;
- downloads com ETag por versão (If-None-Match → 304).`, [
  pasta("Apartamentos", "", [
    req({
      nome: "GET /apartamentoVistoria/lista-filtrada · procura o apartamento fixo de histórico",
      op: "GET /apartamentoVistoria/lista-filtrada",
      query: { nmApartamentoVistoria: "NWQA-HIST", nrPagina: 0, nrQuantidadePorPagina: 20 },
      testes: `var a = nord.achar(b, function (x) { return x.nmApartamentoVistoria === "NWQA-HIST"; });
nord.guardar("idAptoHist", a ? a.idApartamentoVistoria : "");`,
    }),
    req({
      nome: "POST /apartamentoVistoria · cria o apartamento fixo de histórico (primeira execução)",
      op: "POST /apartamentoVistoria", pre: hoje,
      se: "!nord.variavel('idAptoHist')", motivo: "o apartamento NWQA-HIST já existe",
      corpo: aptoForm("NWQA-HIST"),
      guardar: { idAptoHist: "body.idApartamentoVistoria" },
    }),
    req({ nome: "POST /apartamentoVistoria · nome com mais de 10 caracteres → 400", op: "POST /apartamentoVistoria", pre: hoje, status: 400,
      corpo: aptoForm("NWQA-NOME-MUITO-LONGO"), obs: "O nome é VARCHAR(10) no banco; hoje a recusa vem do banco (DADO_INVALIDO), sem validação no form." }),
    req({
      nome: "POST /apartamentoVistoria · cria apartamento temporário",
      op: "POST /apartamentoVistoria", pre: hoje,
      corpo: aptoForm("{{nmApto}}"),
      guardar: { idApto: "body.idApartamentoVistoria" },
      regras: [
        ["entra na fase de teste pela sigla do nome", "pm.expect(b.idFase).to.eql(Number(nord.variavel('idFase')));"],
        ["nasce sem termo", "pm.expect(b.inTermoAnexado).to.not.eql(true); pm.expect(b.qtTermos || 0).to.eql(0);"],
      ],
    }),
    req({ nome: "POST /apartamentoVistoria · usuário comum → 403", op: "POST /apartamentoVistoria", auth: "usuario", status: 403, erro: "ACESSO_NEGADO", pre: hoje, corpo: aptoForm("NWQA-PROIBIDO") }),
    req({
      nome: "GET /apartamentoVistoria · lista da fase de teste",
      op: "GET /apartamentoVistoria",
      regras: [["só apartamentos das fases da obra escolhida", "b.forEach(function (a) { pm.expect(a.idFase).to.eql(Number(nord.variavel('idFase'))); });"],
        ["o temporário aparece", "pm.expect(b.map(function (a) { return a.idApartamentoVistoria; })).to.include(Number(nord.variavel('idApto')));"]],
    }),
    req({ nome: "GET /apartamentoVistoria/{id} · busca", op: "GET /apartamentoVistoria/{id}", url: "/apartamentoVistoria/{{idApto}}",
      regras: [["nome gravado", "pm.expect(b.nmApartamentoVistoria).to.eql(nord.variavel('nmApto'));"]] }),
    req({
      nome: "GET /apartamentoVistoria/lista-filtrada · filtra pelo nome",
      op: "GET /apartamentoVistoria/lista-filtrada",
      query: { nmApartamentoVistoria: "{{nmApto}}", nrPagina: 0, nrQuantidadePorPagina: 20 },
      regras: [["acha o temporário", "pm.expect(b.map(function (a) { return a.idApartamentoVistoria; })).to.include(Number(nord.variavel('idApto')));"]],
    }),
    req({
      nome: "GET /apartamentoVistoria/lista-filtrada · 101 por página → 400",
      op: "GET /apartamentoVistoria/lista-filtrada", status: 400, erro: "ENTRADA_INVALIDA",
      query: { nrPagina: 0, nrQuantidadePorPagina: 101 },
    }),
    req({
      nome: "PUT /apartamentoVistoria · edita o apartamento fixo (gera histórico)",
      op: "PUT /apartamentoVistoria", pre: hoje + "\npm.variables.set('obsRun', '[newman] revistoria ' + nord.variavel('nordRun'));",
      corpo: aptoForm("NWQA-HIST", { idApartamentoVistoria: "__cru__{{idAptoHist}}__fim__", inMarcarRevistoria: true, txObservacaoRevistoria: "{{obsRun}}", dtRevistoriaVigente: "{{hoje}}" }),
      regras: [["alteração gravada", "pm.expect(b.inMarcarRevistoria).to.eql(true); pm.expect(b.txObservacaoRevistoria).to.eql(pm.variables.get('obsRun'));"]],
    }),
    req({
      nome: "GET /apartamentoVistoria/historico/{id} · a edição aparece no histórico",
      op: "GET /apartamentoVistoria/historico/{idApartamentoVistoria}", url: "/apartamentoVistoria/historico/{{idAptoHist}}",
      regras: [["há versão com a observação alterada", "var achou = b.some(function (v) { return (v.lsApartamentoVistoriaAlterado || []).some(function (a) { return String(a.txAtual || '').indexOf(nord.variavel('nordRun')) >= 0; }); }); pm.expect(achou).to.eql(true);"]],
    }),
    req({
      nome: "GET /apartamentoVistoria/InfoGeralApartamentoVistoria · totais por status",
      op: "GET /apartamentoVistoria/InfoGeralApartamentoVistoria",
      query: { dtiApartamentoVistoria: "01-01-2000", dtfApartamentoVistoria: "31-12-2099" },
      regras: [["percentuais entre 0 e 100", "b.forEach(function (s) { pm.expect(s.pcApartamentoStatusVistoria).to.be.within(0, 100); });"]],
    }),
    req({
      nome: "POST /apartamentoVistoria/importar · arquivo que não é planilha → 400",
      op: "POST /apartamentoVistoria/importar", status: 400,
      form: { planilha: arquivo("texto.txt") },
      obs: "Não importa planilha real: só confere que um arquivo inválido é recusado sem 500.",
    }),
    req({ nome: "DELETE /apartamentoVistoria/{id} · com histórico → 422 REGISTRO_EM_USO", op: "DELETE /apartamentoVistoria/{id}", url: "/apartamentoVistoria/{{idAptoHist}}", status: 422, erro: "REGISTRO_EM_USO" }),
  ]),

  pasta("Termos de reprova", "", [
    req({
      nome: "POST /apartamentoVistoria/{id}/termos-reprova · anexa termo de 2 páginas",
      op: "POST /apartamentoVistoria/{idApartamento}/termos-reprova", url: "/apartamentoVistoria/{{idApto}}/termos-reprova",
      query: { nrPaginas: 2 }, form: { arquivo: arquivo("documento.pdf") },
      guardar: { idTermo: "body.idTermoReprova" },
      regras: [["primeiro termo do apartamento é o nº 1, pendente", "pm.expect(b.nrTermo).to.eql(1); pm.expect(b.nrPaginas).to.eql(2); pm.expect(b.nmSituacao).to.eql('PENDENTE');"]],
    }),
    req({
      nome: "POST /apartamentoVistoria/{id}/termos-reprova · segundo termo recebe o nº 2",
      op: "POST /apartamentoVistoria/{idApartamento}/termos-reprova", url: "/apartamentoVistoria/{{idApto}}/termos-reprova",
      query: { nrPaginas: 1 }, form: { arquivo: arquivo("documento-1-pagina.pdf") },
      guardar: { idTermo2: "body.idTermoReprova" },
      regras: [["numeração automática max + 1", "pm.expect(b.nrTermo).to.eql(2);"]],
    }),
    req({
      nome: "POST /apartamentoVistoria/{id}/termos-reprova · 81 páginas → 400",
      op: "POST /apartamentoVistoria/{idApartamento}/termos-reprova", url: "/apartamentoVistoria/{{idApto}}/termos-reprova", status: 400,
      query: { nrPaginas: 81 }, form: { arquivo: arquivo("documento.pdf") },
    }),
    req({
      nome: "POST /apartamentoVistoria/{id}/termos-reprova · apartamento inexistente → 404",
      op: "POST /apartamentoVistoria/{idApartamento}/termos-reprova", url: "/apartamentoVistoria/999999999/termos-reprova", status: 404,
      query: { nrPaginas: 1 }, form: { arquivo: arquivo("documento.pdf") },
    }),
    req({ nome: "GET /apartamentoVistoria/{id}/termos-reprova · lista do apartamento", op: "GET /apartamentoVistoria/{idApartamento}/termos-reprova", url: "/apartamentoVistoria/{{idApto}}/termos-reprova",
      regras: [["os dois termos", "pm.expect(b.map(function (t) { return t.nrTermo; }).sort()).to.eql([1, 2]);"]] }),
    req({ nome: "GET /apartamentoVistoria/termos-reprova/{idTermo} · metadados", op: "GET /apartamentoVistoria/termos-reprova/{idTermo}", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}",
      regras: [["sem fotos ainda", "pm.expect(b.fotos || []).to.be.empty;"]] }),
    download({ nome: "PDF do termo", op: "GET /apartamentoVistoria/termos-reprova/{idTermo}/arquivo", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/arquivo", cache: "pdf", tipo: /application\/pdf/ }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao · concluir sem foto → 400",
      op: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/situacao", status: 400,
      corpo: { situacao: "CONCLUIDO" },
      regras: [["pede ao menos uma foto", "pm.expect(j.txMensagem).to.match(/foto/);"]],
    }),
    req({
      nome: "POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos · foto na página 1",
      op: "POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/fotos",
      query: { nrPagina: 1, legenda: "[newman] parede" }, form: { imagem: arquivo("imagem.jpg"), miniatura: arquivo("miniatura.jpg") },
      guardar: { idFotoTermo: "body.idTermoFoto" },
      regras: [["foto na página e com legenda", "pm.expect(b.nrPagina).to.eql(1); pm.expect(b.txLegenda).to.eql('[newman] parede');"]],
    }),
    req({
      nome: "POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos · segunda foto",
      op: "POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/fotos",
      query: { nrPagina: 1 }, form: { imagem: arquivo("imagem.png"), miniatura: arquivo("imagem.png") },
      guardar: { idFotoTermo2: "body.idTermoFoto" },
    }),
    req({
      nome: "POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos · página inexistente → 400",
      op: "POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/fotos", status: 400,
      query: { nrPagina: 9 }, form: { imagem: arquivo("imagem.jpg"), miniatura: arquivo("miniatura.jpg") },
      regras: [["diz quantas páginas o termo tem", "pm.expect(j.txMensagem).to.match(/2 página/);"]],
    }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem · inverte a ordem",
      op: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/fotos/ordem",
      corpo: [{ idTermoFoto: "__cru__{{idFotoTermo2}}__fim__", nrOrdem: 0 }, { idTermoFoto: "__cru__{{idFotoTermo}}__fim__", nrOrdem: 1 }],
      regras: [["ordem gravada", "var o = {}; b.forEach(function (f) { o[f.idTermoFoto] = f.nrOrdem; }); pm.expect(o[nord.variavel('idFotoTermo2')]).to.eql(0); pm.expect(o[nord.variavel('idFotoTermo')]).to.eql(1);"]],
    }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem · foto de outro termo → 400",
      op: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem", url: "/apartamentoVistoria/termos-reprova/{{idTermo2}}/fotos/ordem", status: 400,
      corpo: [{ idTermoFoto: "__cru__{{idFotoTermo}}__fim__", nrOrdem: 0 }],
    }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/fotos/{idFoto} · só a imagem, sem miniatura → 400",
      op: "PUT /apartamentoVistoria/termos-reprova/fotos/{idFoto}", url: "/apartamentoVistoria/termos-reprova/fotos/{{idFotoTermo}}", status: 400,
      form: { imagem: arquivo("imagem.png") },
      regras: [["imagem e miniatura vão juntas", "pm.expect(j.txMensagem).to.match(/juntas/);"]],
    }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/fotos/{idFoto} · troca imagem, legenda e página",
      op: "PUT /apartamentoVistoria/termos-reprova/fotos/{idFoto}", url: "/apartamentoVistoria/termos-reprova/fotos/{{idFotoTermo}}",
      query: { legenda: "[newman] parede (editada)", nrPagina: 2 }, form: { imagem: arquivo("imagem.png"), miniatura: arquivo("miniatura.jpg") },
      regras: [["legenda e página novas, versão maior", "pm.expect(b.txLegenda).to.eql('[newman] parede (editada)'); pm.expect(b.nrPagina).to.eql(2);"]],
    }),
    download({ nome: "imagem da foto", op: "GET /apartamentoVistoria/termos-reprova/fotos/{idFoto}/imagem", url: "/apartamentoVistoria/termos-reprova/fotos/{{idFotoTermo}}/imagem" }),
    download({ nome: "miniatura da foto", op: "GET /apartamentoVistoria/termos-reprova/fotos/{idFoto}/miniatura", url: "/apartamentoVistoria/termos-reprova/fotos/{{idFotoTermo}}/miniatura" }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao · conclui com observação",
      op: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/situacao",
      corpo: { situacao: "CONCLUIDO", observacao: "[newman] concluído" },
      regras: [["situação e observação gravadas", "pm.expect(b.nmSituacao).to.eql('CONCLUIDO'); pm.expect(b.txObservacao).to.eql('[newman] concluído');"]],
    }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao · situação desconhecida → 400",
      op: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/situacao", status: 400,
      corpo: { situacao: "QUALQUER" },
    }),
    req({
      nome: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/arquivo · PDF de 1 página remove a foto da página 2",
      op: "PUT /apartamentoVistoria/termos-reprova/{idTermo}/arquivo", url: "/apartamentoVistoria/termos-reprova/{{idTermo}}/arquivo",
      query: { nrPaginas: 1 }, form: { arquivo: arquivo("documento-1-pagina.pdf") },
      regras: [
        ["avisa das fotos removidas", "pm.expect((b.avisos || []).join(' ')).to.match(/não existem no novo PDF/);"],
        ["fica só a foto da página 1", "pm.expect((b.fotos || []).map(function (f) { return f.idTermoFoto; })).to.eql([Number(nord.variavel('idFotoTermo2'))]);"],
      ],
    }),
    req({ nome: "GET /apartamentoVistoria/termos-reprova/resumo · painel do DAT", op: "GET /apartamentoVistoria/termos-reprova/resumo",
      regras: [["percentual entre 0 e 100", "pm.expect(b.percentualConcluido).to.be.within(0, 100); pm.expect(b.comTermo + b.semTermo).to.eql(b.totalApartamentosComReprova);"]] }),
    req({ nome: "GET /apartamentoVistoria/termos-reprova/resumo · usuário comum → 403", op: "GET /apartamentoVistoria/termos-reprova/resumo", auth: "usuario", status: 403, erro: "ACESSO_NEGADO" }),
    req({ nome: "DELETE /apartamentoVistoria/termos-reprova/fotos/{idFoto} · exclui a foto", op: "DELETE /apartamentoVistoria/termos-reprova/fotos/{idFoto}", url: "/apartamentoVistoria/termos-reprova/fotos/{{idFotoTermo2}}" }),
    req({ nome: "DELETE /apartamentoVistoria/termos-reprova/{idTermo} · exclui o termo 2", op: "DELETE /apartamentoVistoria/termos-reprova/{idTermo}", url: "/apartamentoVistoria/termos-reprova/{{idTermo2}}" }),
    req({ nome: "GET /apartamentoVistoria/termos-reprova/{idTermo} · excluído → 404", op: "GET /apartamentoVistoria/termos-reprova/{idTermo}", url: "/apartamentoVistoria/termos-reprova/{{idTermo2}}", status: 404 }),
    req({
      nome: "DELETE /apartamentoVistoria/{id} · sem histórico exclui (com termos e fotos)",
      op: "DELETE /apartamentoVistoria/{id}", url: "/apartamentoVistoria/{{idApto}}",
    }),
    req({ nome: "GET /apartamentoVistoria/{id} · excluído → 404", op: "GET /apartamentoVistoria/{id}", url: "/apartamentoVistoria/{{idApto}}", status: 404 }),
  ]),
]);
