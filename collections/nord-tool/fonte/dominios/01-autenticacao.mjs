import { pasta, req } from "../lib/dsl.mjs";

// Tudo com o usuário comum de teste: o admin da collection nunca troca senha nem e-mail aqui.
const semCtx = { semContexto: true };

export default pasta("01 Autenticação e conta", `Login, sessão, senha, e-mail e o app Android, sempre com o usuário comum de teste.

Regras exercidas:
- e-mail ou senha errados → 401 CREDENCIAIS_INVALIDAS, mesma mensagem para os dois casos;
- sem token ou token inválido → 401 NAO_AUTENTICADO;
- trocar a senha encerra as outras sessões (o token antigo deixa de valer);
- "Esqueci a senha" responde igual exista ou não o e-mail;
- o token do aparelho vale até sair; depois → 401 APARELHO_DESCONECTADO.`, [
  req({
    nome: "POST /auth/login · senha errada → 401 CREDENCIAIS_INVALIDAS",
    op: "POST /auth/login", auth: "nenhum", ...semCtx, status: 401, erro: "CREDENCIAIS_INVALIDAS",
    corpo: { email: "{{usuarioEmail}}", senha: "senha-errada-do-newman" },
    regras: [["mensagem não diz se o erro foi do e-mail ou da senha", "pm.expect(j.txMensagem).to.eql('E-mail ou senha inválidos');"]],
  }),
  req({
    nome: "POST /auth/login · e-mail que não existe → mesma recusa",
    op: "POST /auth/login", auth: "nenhum", ...semCtx, status: 401, erro: "CREDENCIAIS_INVALIDAS",
    corpo: { email: "ninguem.{{nordRun}}@nordtool.test", senha: "qualquer-senha-123" },
    regras: [["mesma mensagem da senha errada", "pm.expect(j.txMensagem).to.eql('E-mail ou senha inválidos');"]],
  }),
  req({
    nome: "POST /auth/login · sem senha → 400 ENTRADA_INVALIDA",
    op: "POST /auth/login", auth: "nenhum", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
    corpo: { email: "{{usuarioEmail}}" },
  }),
  req({
    nome: "POST /auth/login · entra com a senha do run",
    op: "POST /auth/login", auth: "nenhum", ...semCtx,
    corpo: { email: "{{usuarioEmail}}", senha: "{{usuarioSenha}}" },
    guardar: { tokenUsuario: "body.token" },
    regras: [
      ["JWT com três partes", "pm.expect(b.token.split('.')).to.have.length(3);"],
      ["sessão com expiração e inatividade", "pm.expect(new Date(b.expiraEm).getTime()).to.be.above(Date.now()); pm.expect(new Date(b.sessaoExpiraEm).getTime()).to.be.at.least(new Date(b.expiraEm).getTime()); pm.expect(b.inatividadeMinutos).to.be.above(0);"],
      ["usuário comum com perfil USER", "pm.expect(b.usuario.perfil).to.eql('USER');"],
    ],
  }),
  req({
    nome: "GET /auth/me · permissões efetivas do usuário comum",
    op: "GET /auth/me", auth: "usuario", ...semCtx,
    regras: [
      ["tem MEDICOES:LEITURA", "pm.expect(b.permissoes).to.deep.include({ cdModulo: 'MEDICOES', cdAcao: 'LEITURA' });"],
      ["não tem ADMINISTRACAO", "pm.expect(b.permissoes.map(function (p) { return p.cdModulo; })).to.not.include('ADMINISTRACAO');"],
    ],
  }),
  req({ nome: "GET /auth/me · sem token → 401 NAO_AUTENTICADO", op: "GET /auth/me", auth: "nenhum", ...semCtx, status: 401, erro: "NAO_AUTENTICADO" }),
  req({ nome: "GET /auth/me · token inválido → 401", op: "GET /auth/me", auth: "{{tokenInvalido}}", ...semCtx, status: 401,
    pre: "pm.variables.set('tokenInvalido', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.assinatura-invalida');" }),
  req({
    nome: "POST /auth/refresh · renova o token",
    op: "POST /auth/refresh", auth: "usuario", ...semCtx,
    guardar: { tokenUsuario: "body.token" },
    regras: [["devolve outro token válido", "pm.expect(b.token).to.be.a('string').and.not.eql(''); pm.expect(b.usuario.email.toLowerCase()).to.eql(nord.variavel('usuarioEmail').toLowerCase());"]],
  }),
  req({
    nome: "POST /auth/definir-senha · conta que não espera senha nova → 400",
    op: "POST /auth/definir-senha", auth: "nenhum", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
    corpo: { email: "{{usuarioEmail}}", senhaProvisoria: "{{usuarioSenha}}", novaSenha: "Outra!Senha123" },
  }),

  pasta("App Android (aparelho)", "Registrar o aparelho exige SESSAO_CONTINUA:LEITURA; o token do aparelho abre sessões sem senha até sair.", [
    req({
      nome: "POST /auth/aparelho · registra o aparelho (token só nesta resposta)",
      op: "POST /auth/aparelho", auth: "usuario", ...semCtx,
      corpo: { nmAparelho: "[newman] aparelho {{nordRun}}" },
      guardar: { tokenAparelho: "body.txToken" },
      regras: [["token longo e opaco", "pm.expect(b.txToken).to.be.a('string'); pm.expect(b.txToken.length).to.be.at.least(32);"]],
    }),
    req({
      nome: "POST /auth/aparelho/entrar · abre sessão sem senha",
      op: "POST /auth/aparelho/entrar", auth: "nenhum", ...semCtx,
      corpo: { txToken: "{{tokenAparelho}}" },
      regras: [["sessão do dono do aparelho", "pm.expect(b.usuario.email.toLowerCase()).to.eql(nord.variavel('usuarioEmail').toLowerCase()); pm.expect(b.token.split('.')).to.have.length(3);"]],
    }),
    req({ nome: "POST /auth/aparelho/sair · desconecta o aparelho", op: "POST /auth/aparelho/sair", auth: "nenhum", ...semCtx, corpo: { txToken: "{{tokenAparelho}}" } }),
    req({
      nome: "POST /auth/aparelho/entrar · depois de sair → 401 APARELHO_DESCONECTADO",
      op: "POST /auth/aparelho/entrar", auth: "nenhum", ...semCtx, status: 401, erro: "APARELHO_DESCONECTADO",
      corpo: { txToken: "{{tokenAparelho}}" },
    }),
  ]),

  pasta("Senha e e-mail", "Trocar a senha encerra as outras sessões; trocar o e-mail confirma com a senha atual.", [
    req({
      nome: "POST /auth/alterar-senha · senha atual errada → 400",
      op: "POST /auth/alterar-senha", auth: "usuario", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { senhaAtual: "nao-e-a-senha", novaSenha: "Nw!OutraSenha-12345" },
    }),
    req({
      nome: "POST /auth/alterar-senha · senha nova curta → 400 (mínimo 10)",
      op: "POST /auth/alterar-senha", auth: "usuario", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { senhaAtual: "{{usuarioSenha}}", novaSenha: "curta" },
    }),
    req({
      nome: "POST /auth/alterar-senha · troca a senha e devolve token novo",
      op: "POST /auth/alterar-senha", auth: "usuario", ...semCtx,
      pre: `pm.collectionVariables.set("tokenUsuarioAntigo", nord.variavel("tokenUsuario"));
pm.variables.set("senhaNova", "Nw!" + nord.uuid().replace(/-/g, "").slice(0, 22));`,
      corpo: { senhaAtual: "{{usuarioSenha}}", novaSenha: "{{senhaNova}}" },
      guardar: { tokenUsuario: "body.token" },
      testes: "if (pm.response.code === 200) pm.collectionVariables.set('usuarioSenha', pm.variables.get('senhaNova'));",
    }),
    req({
      nome: "GET /auth/me · token de antes da troca de senha → 401",
      op: "GET /auth/me", auth: "{{tokenUsuarioAntigo}}", ...semCtx, status: 401,
      regras: [["trocar a senha encerra as outras sessões", "pm.expect(pm.response.code).to.eql(401);"]],
    }),
    req({
      nome: "POST /auth/alterar-email · senha atual errada → 400",
      op: "POST /auth/alterar-email", auth: "usuario", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmEmail: "newman.outro.{{nordRun}}@nordtool.test", senhaAtual: "nao-e-a-senha" },
    }),
    req({
      nome: "POST /auth/alterar-email · e-mail de outra pessoa → 400",
      op: "POST /auth/alterar-email", auth: "usuario", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmEmail: "{{emailAdmin}}", senhaAtual: "{{usuarioSenha}}" },
      regras: [["avisa que o e-mail está em uso", "pm.expect(j.txMensagem).to.match(/em uso/);"]],
    }),
    req({
      nome: "POST /auth/alterar-email · troca para um e-mail temporário",
      op: "POST /auth/alterar-email", auth: "usuario", ...semCtx,
      corpo: { nmEmail: "newman.outro.{{nordRun}}@nordtool.test", senhaAtual: "{{usuarioSenha}}" },
      guardar: { tokenUsuario: "body.token" },
      regras: [["token novo já com o e-mail novo", "pm.expect(b.usuario.email).to.eql('newman.outro.' + nord.variavel('nordRun') + '@nordtool.test');"]],
    }),
    req({
      nome: "POST /auth/alterar-email · volta para o e-mail do usuário de teste",
      op: "POST /auth/alterar-email", auth: "usuario", ...semCtx,
      corpo: { nmEmail: "{{usuarioEmail}}", senhaAtual: "{{usuarioSenha}}" },
      guardar: { tokenUsuario: "body.token" },
    }),
  ]),

  pasta("Cadastro e recuperação de senha", "Sem login. As respostas não revelam se um e-mail existe.", [
    req({
      nome: "POST /auth/cadastro · senha curta → 400",
      op: "POST /auth/cadastro", auth: "nenhum", ...semCtx, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmNome: "[newman] cadastro inválido", nmEmail: "invalido.{{nordRun}}@nordtool.test", senha: "123" },
    }),
    req({
      nome: "POST /auth/esqueci-senha · e-mail existente",
      op: "POST /auth/esqueci-senha", auth: "nenhum", ...semCtx,
      corpo: { nmEmail: "{{usuarioEmail}}" },
      guardar: { msgEsqueci: "body.txMensagem" },
    }),
    req({
      nome: "POST /auth/esqueci-senha · e-mail inexistente → mesma resposta",
      op: "POST /auth/esqueci-senha", auth: "nenhum", ...semCtx,
      corpo: { nmEmail: "ninguem.{{nordRun}}@nordtool.test" },
      regras: [["não revela se o e-mail existe", "pm.expect(b.txMensagem).to.eql(nord.variavel('msgEsqueci'));"]],
    }),
    req({
      nome: "POST /auth/redefinir-senha · link inválido → 400 LINK_INVALIDO",
      op: "POST /auth/redefinir-senha", auth: "nenhum", ...semCtx, status: 400, erro: "LINK_INVALIDO",
      corpo: { token: "link-invalido-{{nordRun}}", novaSenha: "Nw!SenhaNova-12345" },
    }),
  ]),
]);
