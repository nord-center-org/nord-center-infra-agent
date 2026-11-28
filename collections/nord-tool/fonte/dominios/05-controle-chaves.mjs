import { pasta, req } from "../lib/dsl.mjs";

export default pasta("05 Controle de chaves", `Retirada e recebimento de chaves de apartamento (CONTROLE_CHAVES).

Regras exercidas:
- quem libera e quem recebe é sempre o usuário logado; quem retira precisa ser usuário ativo;
- o item tem que ser da fase do usuário; tipo do item APARTAMENTO ou FERRAMENTA;
- a retirada nasce ABERTO com código RET-…; só retirada aberta pode ser recebida;
- listas paginadas com limite no servidor.`, [
  req({ nome: "GET /controleChaves/pessoas · usuários ativos", op: "GET /controleChaves/pessoas",
    regras: [["inclui o usuário comum de teste", "pm.expect(b.map(function (p) { return p.id; })).to.include(Number(nord.variavel('idUsuario')));"]] }),
  req({ nome: "GET /controleChaves/obras · obras ativas", op: "GET /controleChaves/obras" }),
  req({ nome: "GET /controleChaves/apartamentos · busca o apartamento de teste", op: "GET /controleChaves/apartamentos",
    query: { busca: "NWQA-HIST", limite: 20, pagina: 0 },
    regras: [["acha o NWQA-HIST", "pm.expect(b.map(function (a) { return a.idApartamentoVistoria; })).to.include(Number(nord.variavel('idAptoHist')));"]] }),
  req({ nome: "GET /controleChaves/ferramentas · busca paginada", op: "GET /controleChaves/ferramentas", query: { busca: "", limite: 500, pagina: 0 },
    regras: [["limite máximo de 100 por página", "pm.expect(b.length).to.be.at.most(100);"]] }),
  req({
    nome: "POST /controleChaves/retiradas · tipo de item inválido → 400",
    op: "POST /controleChaves/retiradas", status: 400, erro: "ENTRADA_INVALIDA",
    corpo: { nmTipoItem: "CARRO", idApartamentoVistoria: "__cru__{{idAptoHist}}__fim__", idUserRetirada: "__cru__{{idUsuario}}__fim__" },
  }),
  req({
    nome: "POST /controleChaves/retiradas · sem quem retira → 400",
    op: "POST /controleChaves/retiradas", status: 400, erro: "ENTRADA_INVALIDA",
    corpo: { nmTipoItem: "APARTAMENTO", idApartamentoVistoria: "__cru__{{idAptoHist}}__fim__" },
  }),
  req({
    nome: "POST /controleChaves/retiradas · usuário comum → 403",
    op: "POST /controleChaves/retiradas", auth: "usuario", status: 403, erro: "ACESSO_NEGADO",
    corpo: { nmTipoItem: "APARTAMENTO", idApartamentoVistoria: "__cru__{{idAptoHist}}__fim__", idUserRetirada: "__cru__{{idUsuario}}__fim__" },
  }),
  req({
    nome: "POST /controleChaves/retiradas · registra a retirada da chave",
    op: "POST /controleChaves/retiradas",
    corpo: { nmTipoItem: "apartamento", idApartamentoVistoria: "__cru__{{idAptoHist}}__fim__", idUserRetirada: "__cru__{{idUsuario}}__fim__", idUserLiberacao: 999999 },
    guardar: { idRetirada: "body.idRequisicao" },
    regras: [
      ["nasce ABERTO com código RET-", "pm.expect(b.nmStatusRetiradaControle).to.eql('ABERTO'); pm.expect(b.cdCodigoRetirada).to.match(/^RET-/);"],
      ["quem libera é o usuário logado (ignora o enviado)", "pm.expect(b.liberadorControleChavesDto.idUserLiberacao).to.eql(Number(nord.variavel('idAdmin')));"],
      ["quem retira é o usuário de teste", "pm.expect(b.retiranteControleChavesDto.idUserRetirada).to.eql(Number(nord.variavel('idUsuario')));"],
    ],
  }),
  req({ nome: "GET /controleChaves/dashboard · indicadores e recentes", op: "GET /controleChaves/dashboard", query: { limiteRecentes: 50 },
    regras: [["chave em campo e retirada nas recentes", "pm.expect(b.qtChavesEmCampo).to.be.at.least(1); pm.expect(b.retiradasRecentes.map(function (r) { return r.idRequisicao; })).to.include(Number(nord.variavel('idRetirada')));"]] }),
  req({ nome: "GET /controleChaves/historico · abertas", op: "GET /controleChaves/historico", query: { busca: "NWQA-HIST", status: "ABERTO", limite: 20, pagina: 0 },
    regras: [["a retirada aparece como ABERTO", "var r = nord.achar(b, function (x) { return x.idRequisicao == nord.variavel('idRetirada'); }); pm.expect(r.nmStatusRetiradaControle).to.eql('ABERTO');"]] }),
  req({ nome: "GET /controleChaves/dashboard · usuário comum → 403", op: "GET /controleChaves/dashboard", auth: "usuario", status: 403, erro: "ACESSO_NEGADO" }),
  req({
    nome: "PATCH /controleChaves/retiradas/{id}/recebimento · recebe a chave",
    op: "PATCH /controleChaves/retiradas/{id}/recebimento", url: "/controleChaves/retiradas/{{idRetirada}}/recebimento",
    corpo: { idUserRecebimento: 999999 },
    regras: [
      ["fica RECEBIDO com data", "pm.expect(b.nmStatusRetiradaControle).to.eql('RECEBIDO'); pm.expect(b.dtRecebimento).to.be.a('string');"],
      ["quem recebe é o usuário logado", "pm.expect(b.recebedorControleChavesDto.idUserRecebimento).to.eql(Number(nord.variavel('idAdmin')));"],
    ],
  }),
  req({
    nome: "PATCH /controleChaves/retiradas/{id}/recebimento · receber de novo → 400",
    op: "PATCH /controleChaves/retiradas/{id}/recebimento", url: "/controleChaves/retiradas/{{idRetirada}}/recebimento", status: 400, erro: "ENTRADA_INVALIDA",
    corpo: {},
    regras: [["só retirada aberta é recebida", "pm.expect(j.txMensagem).to.match(/abertas/);"]],
  }),
]);
