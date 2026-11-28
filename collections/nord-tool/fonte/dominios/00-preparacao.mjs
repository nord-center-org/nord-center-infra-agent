import { pasta, req } from "../lib/dsl.mjs";

// Prepara o ambiente do run: confere o usuário ADMIN de teste, garante a obra e a fase de teste (todo dado que
// pertence a uma obra é criado nelas, nunca nas obras reais) e o usuário comum de teste, com acesso limitado,
// usado nos testes de permissão (403) e de autenticação.
const OBRA = "NEWMAN-QA";
const FASE = "NWQA";

const acessosUsuario = `
var modulos = JSON.parse(nord.variavel("nordModulos") || "[]");
var acessos = {};
modulos.forEach(function (m) { acessos[m] = "NENHUM"; });
// O que o usuário comum de teste pode: o resto fica NENHUM (os 403 da collection dependem disto).
var liberado = { MEDICOES: "LEITURA", SAC: "LEITURA", CRONOGRAMA: "ESCRITA", CRONOGRAMA_EXCLUIR: "ESCRITA", RELATORIO_FOTOGRAFICO: "LEITURA",
  REPERTORIO: "ESCRITA", SESSAO_CONTINUA: "LEITURA", GAMES: "ESCRITA" };
Object.keys(liberado).forEach(function (m) { acessos[m] = liberado[m]; });
pm.variables.set("acessosUsuario", JSON.stringify(acessos));
`;

export default pasta("00 Preparação", `Prepara o run. Se algo aqui falhar, o resto da collection é pulado.

- Usuário logado ({{token}} ou login com loginEmail/loginSenha) precisa ser ADMIN.
- Obra de teste \`${OBRA}\` e fase \`${FASE}\`: criadas na primeira execução e reaproveitadas depois (obras não têm exclusão).
- Usuário comum de teste (\`usuarioEmail\`, padrão newman.usuario@nordtool.test): cadastrado na primeira execução; a cada run o admin reseta a senha e a collection cria uma nova, que só existe durante o run.`, [
  req({
    nome: "[prep] GET /nord-tool/health · aplicação no ar",
    op: "GET /nord-tool/health",
    auth: "nenhum",
    semContexto: true,
    regras: [["mensagem de saúde", "pm.expect(j.message).to.be.a('string').and.not.empty;"]],
    testes: "if (pm.response.code !== 200) pm.collectionVariables.set('nordAbortar', 'backend fora do ar em ' + nord.variavel('baseUrl'));",
  }),
  req({
    nome: "[prep] GET /auth/me · usuário da collection é ADMIN",
    op: "GET /auth/me",
    semContexto: true,
    guardar: { idAdmin: "body.id", emailAdmin: "body.email", perfilAdmin: "body.perfil" },
    regras: [["o usuário da collection é administrador", "pm.expect(b.perfil === 'ADMIN' || (b.permissoes || []).some(function (p) { return (p.cdModulo === 'ADMINISTRACAO' || p.cdModulo === '*') && p.cdAcao === 'ADMIN'; })).to.eql(true);"]],
    testes: `if (pm.response.code !== 200) pm.collectionVariables.set("nordAbortar", "sem login válido: defina NORD_API_TOKEN ou NORD_API_EMAIL/NORD_API_SENHA (HTTP " + pm.response.code + ")");
else if (!(b.perfil === "ADMIN" || (b.permissoes || []).some(function (p) { return (p.cdModulo === "ADMINISTRACAO" || p.cdModulo === "*") && p.cdAcao === "ADMIN"; }))) pm.collectionVariables.set("nordAbortar", "o usuário " + b.email + " não é ADMIN");`,
  }),
  req({
    nome: "[prep] GET /administracao/obras · procura a obra e a fase de teste",
    op: "GET /administracao/obras",
    semContexto: true,
    testes: `var obra = nord.achar(b, function (o) { return o.cdAcesso === "${OBRA}"; });
nord.guardar("idObra", obra ? obra.id : "");
nord.guardar("nrVersaoObra", obra ? obra.nrVersao : "");
var fase = obra && nord.achar(obra.fases, function (f) { return f.cdFase === "${FASE}"; });
nord.guardar("idFase", fase ? fase.id : "");
nord.guardar("nrVersaoFase", fase ? fase.nrVersao : "");`,
  }),
  req({
    nome: "[prep] POST /administracao/obras · cria a obra de teste (só na primeira execução)",
    op: "POST /administracao/obras",
    semContexto: true,
    se: "!nord.variavel('idObra')",
    motivo: "a obra de teste já existe",
    corpo: { nmObra: "[newman] Obra de teste", cdAcesso: OBRA, inAtivo: true },
    guardar: { idObra: "body.id", nrVersaoObra: "body.nrVersao" },
    regras: [
      ["código de acesso gravado em maiúsculas", `pm.expect(b.cdAcesso).to.eql("${OBRA}");`],
      ["obra nova nasce ativa e sem fases", "pm.expect(b.inAtivo).to.eql(true); pm.expect(b.fases || []).to.be.empty;"],
    ],
  }),
  req({
    nome: "[prep] POST /administracao/obras/{id}/fases · cria a fase de teste (só na primeira execução)",
    op: "POST /administracao/obras/{id}/fases",
    url: "/administracao/obras/{{idObra}}/fases",
    semContexto: true,
    se: "nord.variavel('idObra') && !nord.variavel('idFase')",
    motivo: "a fase de teste já existe",
    corpo: { nmFase: "[newman] Fase de teste", cdFase: FASE.toLowerCase(), nrOrdem: 1 },
    guardar: { idFase: "body.id", nrVersaoFase: "body.nrVersao" },
    regras: [["sigla da fase gravada em maiúsculas", `pm.expect(b.cdFase).to.eql("${FASE}");`]],
  }),
  req({
    nome: "[prep] GET /contexto/obras · admin enxerga a obra de teste",
    op: "GET /contexto/obras",
    semContexto: true,
    regras: [["a obra de teste aparece com a fase", `var o = nord.achar(b, function (x) { return x.id == nord.variavel("idObra"); });
pm.expect(o, "obra de teste").to.be.an("object");
pm.expect((o.fases || []).map(function (f) { return f.id; })).to.include(Number(nord.variavel("idFase")));`]],
    testes: "if (!nord.variavel('idObra') || !nord.variavel('idFase')) pm.collectionVariables.set('nordAbortar', 'sem obra/fase de teste');",
  }),

  pasta("Usuário comum de teste", "Cadastro (na primeira vez), aprovação, acessos limitados, reset de senha e a senha nova do run.", [
    req({
      nome: "[prep] POST /auth/cadastro · cadastra o usuário de teste (resposta igual se já existir)",
      op: "POST /auth/cadastro",
      auth: "nenhum",
      semContexto: true,
      pre: `if (!nord.variavel("usuarioEmail")) pm.collectionVariables.set("usuarioEmail", "newman.usuario@nordtool.test");
pm.collectionVariables.set("usuarioSenha", "Nw!" + nord.uuid().replace(/-/g, "").slice(0, 22));`,
      corpo: { nmNome: "[newman] Usuário de teste", nmEmail: "{{usuarioEmail}}", senha: "{{usuarioSenha}}", nrCelular: "", cdObra: OBRA },
      regras: [["não revela se o e-mail já existe (mensagem padrão)", "pm.expect(b.txMensagem).to.match(/Cadastro enviado/);"]],
    }),
    req({
      nome: "[prep] GET /administracao/acessos · acha o usuário de teste e os módulos",
      op: "GET /administracao/acessos",
      semContexto: true,
      testes: `var u = nord.achar(b.usuarios, function (x) { return (x.nmEmail || "").toLowerCase() === nord.variavel("usuarioEmail").toLowerCase(); });
nord.guardar("idUsuario", u ? u.id : "");
nord.guardar("situacaoUsuario", u ? (u.cdSituacaoCadastro || "") : "");
nord.guardar("nordModulos", JSON.stringify(b.modulos || []));
pm.test("regra: usuário de teste existe depois do cadastro", function () { pm.expect(u, nord.variavel("usuarioEmail")).to.be.an("object"); });`,
    }),
    req({
      nome: "[prep] PUT /administracao/acessos/{id}/cadastro · aprova o cadastro pendente na fase de teste",
      op: "PUT /administracao/acessos/{id}/cadastro",
      url: "/administracao/acessos/{{idUsuario}}/cadastro",
      semContexto: true,
      se: "nord.variavel('situacaoUsuario') === 'PENDENTE'",
      motivo: "o cadastro do usuário de teste já foi aprovado em outro run",
      corpo: { aprovar: true, idsFases: ["__cru__{{idFase}}__fim__"] },
      regras: [["fica APROVADO", "pm.expect(b.cdSituacaoCadastro).to.eql('APROVADO');"]],
    }),
    req({
      nome: "[prep] PUT /administracao/acessos/{id} · acessos limitados do usuário de teste",
      op: "PUT /administracao/acessos/{id}",
      url: "/administracao/acessos/{{idUsuario}}",
      semContexto: true,
      pre: acessosUsuario,
      corpo: { cdPerfil: "USER", inAtivo: true, acessos: "__cru__{{acessosUsuario}}__fim__" },
      regras: [
        ["perfil USER e ativo", "pm.expect(b.cdPerfil).to.eql('USER'); pm.expect(b.inAtivo).to.eql(true);"],
        ["acessos efetivos são os pedidos", "pm.expect(b.acessos.MEDICOES).to.eql('LEITURA'); pm.expect(b.acessos.CRONOGRAMA).to.eql('ESCRITA'); pm.expect(b.acessos.ADMINISTRACAO || 'NENHUM').to.eql('NENHUM'); pm.expect(b.acessos.FINANCEIRO || 'NENHUM').to.eql('NENHUM');"],
      ],
    }),
    req({
      nome: "[prep] PUT /administracao/fases/{id}/usuarios · usuário de teste participa da fase de teste",
      op: "PUT /administracao/fases/{id}/usuarios",
      url: "/administracao/fases/{{idFase}}/usuarios",
      semContexto: true,
      corpo: { idsUsuarios: ["__cru__{{idUsuario}}__fim__"] },
      regras: [["a lista enviada substitui os participantes", "pm.expect(b.idsUsuarios).to.eql([Number(nord.variavel('idUsuario'))]);"]],
    }),
    req({
      nome: "[prep] POST /administracao/acessos/{id}/resetar-senha · senha provisória",
      op: "POST /administracao/acessos/{id}/resetar-senha",
      url: "/administracao/acessos/{{idUsuario}}/resetar-senha",
      semContexto: true,
      guardar: { senhaProvisoria: "body.senhaProvisoria" },
      regras: [["provisória vale cerca de 72 h", "var h = (new Date(b.dhValidaAte) - Date.now()) / 3600000; pm.expect(h).to.be.within(70, 73);"]],
    }),
    req({
      nome: "[prep] POST /auth/login · com a provisória pede senha nova (422 TROCAR_SENHA)",
      op: "POST /auth/login",
      auth: "nenhum",
      semContexto: true,
      status: 422,
      erro: "TROCAR_SENHA",
      corpo: { email: "{{usuarioEmail}}", senha: "{{senhaProvisoria}}" },
    }),
    req({
      nome: "[prep] POST /auth/definir-senha · cria a senha do run e já entra",
      op: "POST /auth/definir-senha",
      auth: "nenhum",
      semContexto: true,
      corpo: { email: "{{usuarioEmail}}", senhaProvisoria: "{{senhaProvisoria}}", novaSenha: "{{usuarioSenha}}" },
      guardar: { tokenUsuario: "body.token" },
      regras: [["devolve o JWT do próprio usuário", "pm.expect(b.token.split('.')).to.have.length(3); pm.expect(b.usuario.email.toLowerCase()).to.eql(nord.variavel('usuarioEmail').toLowerCase());"]],
    }),
  ]),
]);
