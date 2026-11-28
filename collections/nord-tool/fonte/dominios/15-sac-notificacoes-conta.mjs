import { arquivo, download, n, pasta, req } from "../lib/dsl.mjs";

const preferencias = { inDemandaNova: true, inDemandaAlterada: false, inHorario: true, nrAntecedenciaMin: 15, inPrazo: true, inSac: true, inMinhasAcoes: false, inAtividade: true };

export default pasta("15 SAC, notificações e conta", `Chamados para os administradores (SAC), notificações no celular (Web Push) e os dados da própria pessoa (Conta, avatar, favoritos do menu).

Regras exercidas:
- qualquer pessoa logada abre chamado (título e descrição obrigatórios, até 6 imagens JPEG/PNG); só o ADMIN do SAC vê todos e responde;
  quem abriu só exclui enquanto está ABERTO (422 depois); a imagem é de quem abriu ou do ADMIN; resposta vira novidade até marcar como visto;
- push: endpoint https; o aparelho cancelado some da lista; o aviso de teste conta os aparelhos;
- preferências: antecedência de 0 a 120 minutos;
- avatar: objeto JSON plano, chaves curtas; favoritos do menu: caminhos /tela, até 40;
- meus dados: celular no padrão, empresa existente.
O que é do admin (preferências, avatar, favoritos) é lido e regravado igual; as mudanças de verdade são no usuário de teste.`, [
  pasta("SAC", "", [
    req({ nome: "POST /sac/chamados · o usuário de teste abre chamado com print", op: "POST /sac/chamados", auth: "usuario",
      form: { nmTitulo: "[newman] Chamado {{nordRun}}", txDescricao: "[newman] descrição do chamado", txTela: "/organizacional/medicoes", imagens: arquivo("imagem.png") },
      guardar: { idChamado: "body.id", idImagemSac: "body.imagens[0]" },
      regras: [["ABERTO, do usuário, com a imagem", "pm.expect(b.cdStatus).to.eql('ABERTO'); pm.expect(b.idUsuario).to.eql(Number(nord.variavel('idUsuario'))); pm.expect(b.imagens).to.have.length(1);"]] }),
    req({ nome: "POST /sac/chamados · sem descrição → 400", op: "POST /sac/chamados", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", form: { nmTitulo: "[newman] sem descrição", txDescricao: " " } }),
    req({ nome: "POST /sac/chamados · imagem que não é imagem → 400", op: "POST /sac/chamados", auth: "usuario", status: 400, form: { nmTitulo: "[newman] inválido", txDescricao: "x", imagens: arquivo("texto.txt") } }),
    req({ nome: "GET /sac/chamados · meus chamados", op: "GET /sac/chamados", auth: "usuario",
      regras: [["só os meus", "b.forEach(function (c) { pm.expect(c.idUsuario).to.eql(Number(nord.variavel('idUsuario'))); }); pm.expect(b.map(function (c) { return c.id; })).to.include(Number(nord.variavel('idChamado')));"]] }),
    req({ nome: "GET /sac/chamados · todos=true sem ser ADMIN do SAC → 403", op: "GET /sac/chamados", auth: "usuario", query: { todos: true }, status: 403 }),
    req({ nome: "GET /sac/chamados · ADMIN vê todos", op: "GET /sac/chamados", query: { todos: true },
      regras: [["o chamado do usuário aparece", "pm.expect(b.map(function (c) { return c.id; })).to.include(Number(nord.variavel('idChamado')));"]] }),
    download({ nome: "print do chamado (de quem abriu)", op: "GET /sac/imagens/{id}", url: "/sac/imagens/{{idImagemSac}}", auth: "usuario", tipo: /image\/png/ }),
    req({ nome: "GET /sac/novidades · ADMIN recebe a contagem de abertos", op: "GET /sac/novidades", regras: [["abertos >= 1", "pm.expect(b.abertos).to.be.at.least(1);"]] }),
    req({ nome: "PUT /sac/chamados/{id}/resposta · usuário sem ADMIN do SAC → 403", op: "PUT /sac/chamados/{id}/resposta", url: "/sac/chamados/{{idChamado}}/resposta", auth: "usuario", status: 403, corpo: { cdStatus: "RESOLVIDO" } }),
    req({ nome: "PUT /sac/chamados/{id}/resposta · status inválido → 400", op: "PUT /sac/chamados/{id}/resposta", url: "/sac/chamados/{{idChamado}}/resposta", status: 400, erro: "ENTRADA_INVALIDA", corpo: { cdStatus: "FECHADO" } }),
    req({ nome: "PUT /sac/chamados/{id}/resposta · ADMIN responde (em andamento)", op: "PUT /sac/chamados/{id}/resposta", url: "/sac/chamados/{{idChamado}}/resposta",
      corpo: { cdStatus: "EM_ANDAMENTO", txResposta: "[newman] estamos vendo" },
      regras: [["resposta e quem respondeu", "pm.expect(b.cdStatus).to.eql('EM_ANDAMENTO'); pm.expect(b.txResposta).to.eql('[newman] estamos vendo'); pm.expect(b.idUsuarioResposta).to.eql(Number(nord.variavel('idAdmin')));"]] }),
    req({ nome: "PUT /sac/chamados/{id}/resposta · chamado inexistente → 404", op: "PUT /sac/chamados/{id}/resposta", url: "/sac/chamados/999999999/resposta", status: 404, corpo: { cdStatus: "RESOLVIDO" } }),
    req({ nome: "GET /sac/novidades · quem abriu vê a resposta como novidade", op: "GET /sac/novidades", auth: "usuario",
      regras: [["o chamado aparece com novidade", "var c = nord.achar(b.chamados, function (x) { return x.id == nord.variavel('idChamado'); }); pm.expect(c, 'chamado').to.be.an('object'); pm.expect(c.inNovidade).to.eql(true);"],
        ["sem contagem de abertos para quem não é ADMIN", "pm.expect(b.abertos == null).to.eql(true);"]] }),
    req({ nome: "PUT /sac/chamados/vistos · marca como visto", op: "PUT /sac/chamados/vistos", auth: "usuario", corpo: { ids: [n("{{idChamado}}")] } }),
    req({ nome: "GET /sac/novidades · a novidade some", op: "GET /sac/novidades", auth: "usuario",
      regras: [["sem o chamado", "pm.expect((b.chamados || []).map(function (c) { return c.id; })).to.not.include(Number(nord.variavel('idChamado')));"]] }),
    req({ nome: "DELETE /sac/chamados/{id} · quem abriu não exclui depois de atendido → 422", op: "DELETE /sac/chamados/{id}", url: "/sac/chamados/{{idChamado}}", auth: "usuario", status: 422, erro: "REGRA_NEGOCIO" }),
    req({ nome: "DELETE /sac/chamados/{id} · ADMIN exclui sempre", op: "DELETE /sac/chamados/{id}", url: "/sac/chamados/{{idChamado}}" }),
    req({ nome: "GET /sac/imagens/{id} · imagem do chamado excluído → 404", op: "GET /sac/imagens/{id}", url: "/sac/imagens/{{idImagemSac}}", status: 404 }),
  ]),

  pasta("Notificações", "", [
    req({ nome: "GET /notificacoes/config · chave pública VAPID", op: "GET /notificacoes/config", auth: "usuario",
      regras: [["habilitado com chave", "pm.expect(b.habilitado).to.eql(true); pm.expect(b.chavePublica).to.be.a('string').and.not.empty;"]] }),
    req({ nome: "POST /notificacoes/aparelhos · endpoint sem https → 400", op: "POST /notificacoes/aparelhos", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { endpoint: "http://push.nordtool.test/x", p256dh: "chave", auth: "segredo" } }),
    req({ nome: "POST /notificacoes/aparelhos · inscreve um aparelho de teste", op: "POST /notificacoes/aparelhos", auth: "usuario",
      corpo: { endpoint: "https://push.nordtool.test/newman/{{nordRun}}", p256dh: "BNewmanChavePublicaDeTeste", auth: "segredoDeTeste", aparelho: "[newman] navegador" } }),
    req({ nome: "GET /notificacoes/aparelhos · o aparelho aparece", op: "GET /notificacoes/aparelhos", auth: "usuario",
      regras: [["um aparelho de teste", "pm.expect(b.map(function (a) { return a.nmAparelho; })).to.include('[newman] navegador');"]] }),
    req({ nome: "POST /notificacoes/aparelhos/cancelar · desativa o aparelho", op: "POST /notificacoes/aparelhos/cancelar", auth: "usuario", corpo: { endpoint: "https://push.nordtool.test/newman/{{nordRun}}" } }),
    req({ nome: "GET /notificacoes/aparelhos · o aparelho some", op: "GET /notificacoes/aparelhos", auth: "usuario",
      regras: [["sem o aparelho de teste", "pm.expect(b.map(function (a) { return a.nmAparelho; })).to.not.include('[newman] navegador');"]] }),
    req({ nome: "POST /notificacoes/teste · aviso de teste (sem aparelhos = 0)", op: "POST /notificacoes/teste", auth: "usuario", regras: [["nenhum aparelho", "pm.expect(b).to.eql(0);"]] }),
    req({ nome: "GET /notificacoes/caixa · o aviso de teste está na caixa", op: "GET /notificacoes/caixa", auth: "usuario", query: { depois: 0 },
      regras: [["aviso do tipo teste e sequência crescente", "pm.expect(b.itens.some(function (i) { return i.cdTipo === 'teste'; })).to.eql(true); pm.expect(b.nrUltimo).to.be.at.least(1);"]] }),
    req({ nome: "GET /notificacoes/preferencias · do admin", op: "GET /notificacoes/preferencias", testes: "nord.guardar('prefAdmin', JSON.stringify(b));" }),
    req({ nome: "PUT /notificacoes/preferencias · regrava as do admin iguais", op: "PUT /notificacoes/preferencias", corpo: "{{prefAdmin}}",
      regras: [["nada mudou", "var a = JSON.parse(nord.variavel('prefAdmin')); pm.expect(b.inSac).to.eql(a.inSac); pm.expect(b.nrAntecedenciaMin).to.eql(a.nrAntecedenciaMin);"]] }),
    req({ nome: "PUT /notificacoes/preferencias · o usuário de teste salva as dele", op: "PUT /notificacoes/preferencias", auth: "usuario", corpo: preferencias,
      regras: [["gravadas", "pm.expect(b.nrAntecedenciaMin).to.eql(15); pm.expect(b.inDemandaAlterada).to.eql(false);"]] }),
    req({ nome: "PUT /notificacoes/preferencias · antecedência de 121 min → 400", op: "PUT /notificacoes/preferencias", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { ...preferencias, nrAntecedenciaMin: 121 } }),
  ]),

  pasta("Conta, avatar e favoritos do menu", "", [
    req({ nome: "GET /conta/dados · meus dados", op: "GET /conta/dados", auth: "usuario",
      regras: [["e-mail do usuário de teste", "pm.expect(b.nmEmail.toLowerCase()).to.eql(nord.variavel('usuarioEmail').toLowerCase());"]] }),
    req({ nome: "PUT /conta/dados · salva nome e celular", op: "PUT /conta/dados", auth: "usuario", corpo: { nmNome: "[newman] Usuário de teste", nrCelular: "(11) 98888-7777" },
      regras: [["gravado (o cargo não muda por aqui)", "pm.expect(b.nrCelular).to.eql('(11) 98888-7777');"]] }),
    req({ nome: "PUT /conta/dados · celular com letras → 400", op: "PUT /conta/dados", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmNome: "[newman] Usuário de teste", nrCelular: "abc" } }),
    req({ nome: "PUT /conta/dados · empresa inexistente → 400", op: "PUT /conta/dados", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmNome: "[newman] Usuário de teste", idEmpresa: 999999 } }),
    req({ nome: "GET /avatares/meu · avatar do admin", op: "GET /avatares/meu" }),
    req({ nome: "PUT /avatares/meu · o usuário de teste salva o avatar", op: "PUT /avatares/meu", auth: "usuario", corpo: { dsConfig: "{\"cabelo\":\"curto\",\"cor\":\"#336699\",\"oculos\":true}" },
      regras: [["JSON compacto e meu", "pm.expect(JSON.parse(b.dsConfig).oculos).to.eql(true); pm.expect(b.flProprio).to.eql(true);"]] }),
    req({ nome: "PUT /avatares/meu · configuração que não é objeto → 400", op: "PUT /avatares/meu", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { dsConfig: "[1,2]" } }),
    req({ nome: "PUT /avatares/meu · valor aninhado → 400", op: "PUT /avatares/meu", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { dsConfig: "{\"roupa\":{\"cor\":\"azul\"}}" } }),
    req({ nome: "GET /avatares/equipe · eu, superior e equipe", op: "GET /avatares/equipe", auth: "usuario",
      regras: [["inclui o próprio e o superior (admin)", "var ids = b.map(function (a) { return a.idUsuario; }); pm.expect(ids).to.include(Number(nord.variavel('idUsuario'))); pm.expect(ids).to.include(Number(nord.variavel('idAdmin')));"]] }),
    req({ nome: "GET /avatares/porta-voz · quem anuncia as novidades", op: "GET /avatares/porta-voz", schema: false }),
    req({ nome: "GET /menu-favoritos · do admin", op: "GET /menu-favoritos", testes: "nord.guardar('menuAdmin', JSON.stringify(b || []));" }),
    req({ nome: "PUT /menu-favoritos · regrava os do admin iguais", op: "PUT /menu-favoritos", corpo: { caminhos: n("{{menuAdmin}}") },
      regras: [["mesma lista", "pm.expect(b).to.eql(JSON.parse(nord.variavel('menuAdmin')));"]] }),
    req({ nome: "PUT /menu-favoritos · o usuário de teste salva (sem repetir)", op: "PUT /menu-favoritos", auth: "usuario", corpo: { caminhos: ["/organizacional/medicoes", "/sac", "/sac"] },
      regras: [["sem duplicados, na ordem", "pm.expect(b).to.eql(['/organizacional/medicoes', '/sac']);"]] }),
    req({ nome: "PUT /menu-favoritos · caminho inválido → 400", op: "PUT /menu-favoritos", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { caminhos: ["https://fora.com"] } }),
    req({ nome: "GET /menu-favoritos · o usuário de teste lê os dele", op: "GET /menu-favoritos", auth: "usuario", regras: [["os dois", "pm.expect(b).to.eql(['/organizacional/medicoes', '/sac']);"]] }),
  ]),
]);
