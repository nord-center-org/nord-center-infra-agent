import { arquivo, download, n, pasta, req } from "../lib/dsl.mjs";

const musica = (extra = {}) => ({ nmTitulo: "[newman] Música {{nordRun}}", nmArtista: "Newman", nmArquivo: "audio.wav", nrDuracao: 0.1, nmTom: "C", nrBpm: 120, txDados: "{\"cifra\":\"C G Am F\"}", ...extra });
const JOGO = "newman-teste";
const partida = (extra = {}) => ({ cdJogo: JOGO, cdModo: "solo", nrPontos: 0, inVitoria: false, nrColocacao: 1, nrJogadores: 1, nrBots: 0, cdDificuldade: "facil", nrDuracaoS: 10, ...extra });

export default pasta("14 Repertório, games e Davi Job", `Repertório (REPERTORIO): músicas com áudio, criações do estúdio e cifras compartilhadas. Games (GAMES) e Davi Job: partidas, Copas, salas do multiplayer e placar.

Regras exercidas:
- chave do aparelho [A-Za-z0-9_-]{1,40}; dados em JSON de objeto; áudio MP3/WAV/OGG/FLAC/M4A até 15 MB; uso dentro da cota;
- cifra: ao menos uma pessoa ativa, texto não vazio; quem recebe abre (marca como lida) e exclui a própria cópia;
- partida: bots < jogadores e colocação <= jogadores; Copa de 3, 5 ou 7 rodadas; jogo [a-z0-9-]; até 21 favoritos;
- sala: código de 4 caracteres, quem abre hospeda, quem entra recebe o bilhete do WebSocket; código inexistente → 404;
- Davi Job: pontos de 0 a 10000.
Partidas, Copas e pontuações são registradas pelo usuário de teste num jogo fictício (${JOGO}), para não mexer no ranking real.`, [
  pasta("Músicas", "", [
    req({ nome: "PUT /repertorio/musicas/{chave} · guarda a música", op: "PUT /repertorio/musicas/{chave}", url: "/repertorio/musicas/nw-{{nordRun}}", corpo: musica(),
      regras: [["minha, sem áudio ainda", "pm.expect(b.cdChave).to.eql('nw-' + nord.variavel('nordRun')); pm.expect(b.inMinha).to.eql(true); pm.expect(b.idArquivo == null).to.eql(true);"]] }),
    req({ nome: "PUT /repertorio/musicas/{chave} · atualiza pela mesma chave", op: "PUT /repertorio/musicas/{chave}", url: "/repertorio/musicas/nw-{{nordRun}}", corpo: musica({ nmTom: "D", nrBpm: 90 }),
      regras: [["tom e bpm novos", "pm.expect(b.nmTom).to.eql('D'); pm.expect(b.nrBpm).to.eql(90);"]] }),
    req({ nome: "PUT /repertorio/musicas/{chave} · chave com espaço → 400", op: "PUT /repertorio/musicas/{chave}", url: "/repertorio/musicas/chave%20invalida", status: 400, erro: "ENTRADA_INVALIDA", corpo: musica() }),
    req({ nome: "PUT /repertorio/musicas/{chave} · dados que não são objeto → 400", op: "PUT /repertorio/musicas/{chave}", url: "/repertorio/musicas/nw-{{nordRun}}", status: 400, erro: "ENTRADA_INVALIDA", corpo: musica({ txDados: "[1,2]" }) }),
    req({ nome: "PUT /repertorio/musicas/{chave}/audio · envia o áudio WAV", op: "PUT /repertorio/musicas/{chave}/audio", url: "/repertorio/musicas/nw-{{nordRun}}/audio", form: { arquivo: arquivo("audio.wav") },
      regras: [["áudio na conta", "pm.expect(b.idArquivo).to.be.a('number'); pm.expect(b.nrTamanhoBytes).to.be.above(0);"]] }),
    req({ nome: "PUT /repertorio/musicas/{chave}/audio · texto → 400", op: "PUT /repertorio/musicas/{chave}/audio", url: "/repertorio/musicas/nw-{{nordRun}}/audio", status: 400, erro: "ENTRADA_INVALIDA", form: { arquivo: arquivo("texto.txt") } }),
    download({ nome: "áudio da música", op: "GET /repertorio/musicas/{chave}/audio", url: "/repertorio/musicas/nw-{{nordRun}}/audio", tipo: /audio\// }),
    req({ nome: "GET /repertorio/musicas · minhas músicas (sem os dados)", op: "GET /repertorio/musicas",
      regras: [["a música aparece sem txDados", "var m = nord.achar(b, function (x) { return x.cdChave === 'nw-' + nord.variavel('nordRun'); }); pm.expect(m).to.be.an('object'); pm.expect(m.txDados == null).to.eql(true);"]] }),
    req({ nome: "GET /repertorio/musicas/{chave} · música com os dados", op: "GET /repertorio/musicas/{chave}", url: "/repertorio/musicas/nw-{{nordRun}}",
      regras: [["dados gravados", "pm.expect(JSON.parse(b.txDados).cifra).to.eql('C G Am F');"]] }),
    req({ nome: "GET /repertorio/uso · espaço usado", op: "GET /repertorio/uso",
      regras: [["dentro da cota", "pm.expect(b.bytesUsados).to.be.at.most(b.bytesCota); pm.expect(b.musicas).to.be.at.most(b.musicasMax); pm.expect(b.bytesPorArquivo).to.eql(15 * 1024 * 1024);"]] }),
    req({ nome: "DELETE /repertorio/musicas/{chave} · exclui a música e o áudio", op: "DELETE /repertorio/musicas/{chave}", url: "/repertorio/musicas/nw-{{nordRun}}" }),
    req({ nome: "GET /repertorio/musicas/{chave}/audio · música excluída → 404", op: "GET /repertorio/musicas/{chave}/audio", url: "/repertorio/musicas/nw-{{nordRun}}/audio", status: 404 }),
  ]),
  pasta("Criações do estúdio", "", [
    req({ nome: "PUT /repertorio/projetos/{chave} · guarda a criação", op: "PUT /repertorio/projetos/{chave}", url: "/repertorio/projetos/nwp-{{nordRun}}", corpo: { nmTitulo: "[newman] Criação {{nordRun}}", txDados: "{\"faixas\":[]}" },
      regras: [["minha", "pm.expect(b.inMinha).to.eql(true);"]] }),
    req({ nome: "GET /repertorio/projetos · minhas criações", op: "GET /repertorio/projetos",
      regras: [["aparece sem os dados", "var p = nord.achar(b, function (x) { return x.cdChave === 'nwp-' + nord.variavel('nordRun'); }); pm.expect(p).to.be.an('object'); pm.expect(p.txDados == null).to.eql(true);"]] }),
    req({ nome: "GET /repertorio/projetos/{chave} · criação com os dados", op: "GET /repertorio/projetos/{chave}", url: "/repertorio/projetos/nwp-{{nordRun}}",
      regras: [["dados", "pm.expect(JSON.parse(b.txDados).faixas).to.eql([]);"]] }),
    req({ nome: "DELETE /repertorio/projetos/{chave} · exclui", op: "DELETE /repertorio/projetos/{chave}", url: "/repertorio/projetos/nwp-{{nordRun}}" }),
    req({ nome: "GET /repertorio/projetos/{chave} · excluída → 404", op: "GET /repertorio/projetos/{chave}", url: "/repertorio/projetos/nwp-{{nordRun}}", status: 404 }),
  ]),
  pasta("Cifras compartilhadas", "", [
    req({ nome: "GET /repertorio/pessoas · com quem compartilhar", op: "GET /repertorio/pessoas",
      regras: [["o usuário de teste aparece", "pm.expect(b.map(function (p) { return p.id; })).to.include(Number(nord.variavel('idUsuario')));"]] }),
    req({ nome: "POST /repertorio/cifras-enviadas · sem pessoas → 400", op: "POST /repertorio/cifras-enviadas", status: 400, erro: "ENTRADA_INVALIDA", corpo: { idsUsuarios: [], txCifra: "C G" } }),
    req({ nome: "POST /repertorio/cifras-enviadas · cifra vazia → 400", op: "POST /repertorio/cifras-enviadas", status: 400, erro: "ENTRADA_INVALIDA", corpo: { idsUsuarios: [n("{{idUsuario}}")], txCifra: "  " } }),
    req({ nome: "POST /repertorio/cifras-enviadas · compartilha com o usuário de teste", op: "POST /repertorio/cifras-enviadas",
      corpo: { idsUsuarios: [n("{{idUsuario}}")], nmTitulo: "[newman] Cifra {{nordRun}}", nmArtista: "Newman", nmTom: "G", txCifra: "G D Em C", txMensagem: "[newman] para testar" },
      regras: [["uma cópia enviada", "pm.expect(b.nrEnviadas).to.eql(1);"]] }),
    req({ nome: "GET /repertorio/cifras-recebidas · quem recebeu vê (sem o texto)", op: "GET /repertorio/cifras-recebidas", auth: "usuario",
      testes: "var c = nord.achar(b, function (x) { return x.nmTitulo === '[newman] Cifra ' + nord.variavel('nordRun'); }); nord.guardar('idCifra', c ? c.id : '');",
      regras: [["não lida e sem texto", "var c = nord.achar(b, function (x) { return x.nmTitulo === '[newman] Cifra ' + nord.variavel('nordRun'); }); pm.expect(c.dhLeitura == null).to.eql(true); pm.expect(c.txCifra == null).to.eql(true); pm.expect(c.idUsuarioOrigem).to.eql(Number(nord.variavel('idAdmin')));"]] }),
    req({ nome: "POST /repertorio/cifras-recebidas/{id}/abrir · abre e marca como lida", op: "POST /repertorio/cifras-recebidas/{id}/abrir", url: "/repertorio/cifras-recebidas/{{idCifra}}/abrir", auth: "usuario",
      regras: [["texto e leitura", "pm.expect(b.txCifra).to.eql('G D Em C'); pm.expect(b.dhLeitura).to.be.a('string');"]] }),
    req({ nome: "POST /repertorio/cifras-recebidas/{id}/abrir · cópia de outra pessoa → 404", op: "POST /repertorio/cifras-recebidas/{id}/abrir", url: "/repertorio/cifras-recebidas/{{idCifra}}/abrir", status: 404 }),
    req({ nome: "DELETE /repertorio/cifras-recebidas/{id} · exclui a cópia recebida", op: "DELETE /repertorio/cifras-recebidas/{id}", url: "/repertorio/cifras-recebidas/{{idCifra}}", auth: "usuario" }),
  ]),

  pasta("Games", "", [
    req({ nome: "GET /games/favoritos · meus favoritos", op: "GET /games/favoritos", testes: "nord.guardar('favoritosGames', JSON.stringify(b || []));" }),
    req({ nome: "PUT /games/favoritos · regrava a mesma lista", op: "PUT /games/favoritos", corpo: { jogos: n("{{favoritosGames}}") },
      regras: [["mesma lista", "pm.expect(b).to.eql(JSON.parse(nord.variavel('favoritosGames')));"]] }),
    req({ nome: "PUT /games/favoritos · nome de jogo inválido → 400", op: "PUT /games/favoritos", status: 400, erro: "ENTRADA_INVALIDA", corpo: { jogos: ["Jogo Inválido"] } }),
    req({ nome: "PUT /games/favoritos · 22 favoritos → 400", op: "PUT /games/favoritos", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { jogos: Array.from({ length: 22 }, (_, i) => `jogo-${i}`) } }),
    req({ nome: "POST /games/partidas · registra partida do jogo de teste", op: "POST /games/partidas", auth: "usuario", corpo: partida(),
      regras: [["recorde e conquistas novas", "pm.expect(b.nrRecorde).to.be.a('number'); pm.expect(b.novas).to.be.an('array');"]] }),
    req({ nome: "POST /games/partidas · bots demais → 400", op: "POST /games/partidas", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: partida({ nrJogadores: 2, nrBots: 2 }) }),
    req({ nome: "POST /games/partidas · colocação maior que jogadores → 400", op: "POST /games/partidas", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: partida({ nrJogadores: 2, nrBots: 1, nrColocacao: 3 }) }),
    req({ nome: "POST /games/partidas · dificuldade desconhecida → 400", op: "POST /games/partidas", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: partida({ cdDificuldade: "insano" }) }),
    req({ nome: "GET /games/resumo · números do jogo de teste", op: "GET /games/resumo", auth: "usuario", query: { jogo: JOGO },
      regras: [["conta a partida e mostra no histórico", "pm.expect(b.meus.nrPartidas).to.be.at.least(1); pm.expect(b.historico.length).to.be.at.most(10); pm.expect(b.ranking.length).to.be.at.most(10);"]] }),
    req({ nome: "GET /games/resumo · jogo inválido → 400", op: "GET /games/resumo", query: { jogo: "Jogo!" }, status: 400, erro: "ENTRADA_INVALIDA" }),
    req({ nome: "GET /games/conquistas · todas as conquistas", op: "GET /games/conquistas", auth: "usuario",
      regras: [["a primeira partida está ganha", "var p = nord.achar(b, function (c) { return c.cdConquista === 'PRIMEIRA_PARTIDA'; }); pm.expect(p, 'PRIMEIRA_PARTIDA').to.be.an('object'); pm.expect(p.dhCriacao).to.be.a('string');"]] }),
    req({ nome: "POST /games/copas · registra uma Copa de 3 rodadas", op: "POST /games/copas", auth: "usuario", corpo: { nrRodadas: 3, nrColocacao: 2, txResultado: "{\"rodadas\":[]}" },
      guardar: { idCopa: "body.id" }, regras: [["Copa gravada", "pm.expect(b.nrRodadas).to.eql(3); pm.expect(b.nrColocacao).to.eql(2);"]] }),
    req({ nome: "POST /games/copas · 4 rodadas → 400", op: "POST /games/copas", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nrRodadas: 4, nrColocacao: 1, txResultado: "{}" } }),
    req({ nome: "POST /games/copas · resultado que não é JSON → 400", op: "POST /games/copas", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nrRodadas: 3, nrColocacao: 1, txResultado: "texto" } }),
    req({ nome: "GET /games/copas · minhas Copas", op: "GET /games/copas", auth: "usuario",
      regras: [["a Copa aparece", "pm.expect(b.map(function (c) { return c.id; })).to.include(Number(nord.variavel('idCopa')));"]] }),
    req({ nome: "POST /games/salas · abre sala (quem abre hospeda)", op: "POST /games/salas", corpo: { jogo: JOGO }, guardar: { codigoSala: "body.codigo" },
      regras: [["código de 4, anfitrião com bilhete", "pm.expect(b.codigo).to.match(/^[A-Z0-9]{4}$/); pm.expect(b.anfitriao).to.eql(true); pm.expect(b.bilhete).to.be.a('string').and.not.empty;"]] }),
    req({ nome: "POST /games/salas · jogo inválido → 400", op: "POST /games/salas", status: 400, erro: "ENTRADA_INVALIDA", corpo: { jogo: "Jogo Inválido" } }),
    req({ nome: "POST /games/salas/{codigo}/entrar · o usuário de teste entra pelo código", op: "POST /games/salas/{codigo}/entrar", url: "/games/salas/{{codigoSala}}/entrar", auth: "usuario",
      regras: [["vaga de convidado com bilhete", "pm.expect(b.anfitriao).to.eql(false); pm.expect(b.vaga).to.be.a('number'); pm.expect(b.bilhete).to.be.a('string').and.not.empty;"]] }),
    req({ nome: "POST /games/salas/{codigo}/entrar · código inexistente → 404", op: "POST /games/salas/{codigo}/entrar", url: "/games/salas/ZZ99/entrar", status: 404 }),
    req({ nome: "POST /games/salas/{codigo}/entrar · código inválido → 400", op: "POST /games/salas/{codigo}/entrar", url: "/games/salas/ab/entrar", status: 400, erro: "ENTRADA_INVALIDA" }),
  ]),

  pasta("Davi Job", "", [
    req({ nome: "GET /davi-job/placar · top 10 e meu recorde", op: "GET /davi-job/placar", regras: [["no máximo 10 no ranking", "pm.expect(b.ranking.length).to.be.at.most(10);"]] }),
    req({ nome: "POST /davi-job/pontuacoes · registra 0 pontos", op: "POST /davi-job/pontuacoes", auth: "usuario", corpo: { nrPontos: 0 },
      regras: [["placar devolvido com o meu recorde", "pm.expect(b.meuRecorde).to.be.an('object'); pm.expect(b.meuRecorde.flProprio).to.eql(true);"]] }),
    req({ nome: "POST /davi-job/pontuacoes · 10001 pontos → 400", op: "POST /davi-job/pontuacoes", auth: "usuario", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nrPontos: 10001 } }),
  ]),
]);
