import { n, pasta, req } from "../lib/dsl.mjs";

// O Financeiro é da casa inteira (não tem obra nem dono). Para não mexer nas contas reais:
// - os lançamentos de teste ficam em 2099 (fev, mar e abr) e são apagados no fim;
// - pessoa, categorias, recorrência e fundo de teste são fixos ([newman] …), reaproveitados e desativados no fim;
// - fechar e reabrir mês só rodam com a variável financeiroCompleto=1 (fecham 2099-03 e geram os fixos de 2099-04).
const PESSOA = "[newman] Pessoa";
const CAT_E = "[newman] Salário";
const CAT_S = "[newman] Cartão";
const RECORRENCIA = "[newman] Recorrência";
const TICKER = "NWQA11";
const completo = "nord.variavel('financeiroCompleto') === '1'";
const motivoCompleto = "fechar/reabrir mês só com financeiroCompleto=1";
const lanc = (extra = {}) => ({ cdRequisicao: "{{reqFin}}", dtLancamento: "2099-03-10", idCategoria: n("{{idCatSaida}}"), idPessoa: n("{{idPessoaFin}}"), dsLancamento: "[newman] fatura", vlLancamento: 89.9, inRealizado: false, ...extra });
const novoUuid = (v = "reqFin") => `pm.collectionVariables.set("${v}", nord.uuid());`;
const categoria = (nome, tipo, projecao, extra = {}) => ({ nmCategoria: nome, cdTipo: tipo, cdProjecao: projecao, inFixa: false, nrOrdem: 99, inAtivo: true, ...extra });
const acharCat = (nome, v) => `var c = nord.achar(b, function (x) { return x.nmCategoria === ${JSON.stringify(nome)}; }); nord.guardar("${v}", c ? c.idCategoria : "");`;

export default pasta("11 Financeiro", `Controle financeiro (FINANCEIRO): pessoas, categorias, lançamentos, projeção do mês, recorrências e fundos imobiliários.

Regras exercidas:
- cdRequisicao UUID obrigatório; repetir devolve o já criado (também as N parcelas); parcelas de 1 a 120, uma por mês;
- edição, "realizado" e exclusão exigem nrVersao (divergente → 409); mês fechado não aceita mudanças;
- filtros: competência yyyy-MM, tipo ENTRADA/SAIDA, situação TODOS/REALIZADO/PREVISTO, de <= até;
- categoria: nome único no tipo, RITMO_FATURA só para saída (gera leituras da fatura), tipo não muda com lançamentos, regra de data com dia;
- pessoa e categoria inativas não recebem lançamentos novos; com idPessoa a conta do mês não tem saldo anterior;
- fechar exige o mês anterior fechado ou saldo inicial; só o último mês fechado reabre; gerar recorrências não duplica;
- fundo: ticker AAAA00, um por pessoa (arquivado volta ao cadastrar de novo), venda sem cotas e excluir compra de uma venda → 400.`, [
  pasta("Pessoas e categorias de teste", "", [
    req({ nome: "GET /financeiro/pessoas · procura a pessoa de teste", op: "GET /financeiro/pessoas",
      testes: `var p = nord.achar(b, function (x) { return x.nmPessoa === ${JSON.stringify(PESSOA)}; }); nord.guardar("idPessoaFin", p ? p.idPessoa : "");` }),
    req({ nome: "POST /financeiro/pessoas · cria a pessoa de teste (primeira execução)", op: "POST /financeiro/pessoas", se: "!nord.variavel('idPessoaFin')", motivo: "a pessoa de teste já existe",
      corpo: { nmPessoa: PESSOA, inCompartilhado: false, nrOrdem: 99, inAtivo: true }, guardar: { idPessoaFin: "body.idPessoa" } }),
    req({ nome: "POST /financeiro/pessoas · nome repetido → 400", op: "POST /financeiro/pessoas", status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmPessoa: PESSOA } }),
    req({ nome: "PUT /financeiro/pessoas/{id} · reativa a pessoa de teste", op: "PUT /financeiro/pessoas/{id}", url: "/financeiro/pessoas/{{idPessoaFin}}",
      corpo: { inAtivo: true, nrOrdem: 99 }, regras: [["ativa, nome mantido (campos nulos não mudam)", `pm.expect(b.inAtivo).to.eql(true); pm.expect(b.nmPessoa).to.eql(${JSON.stringify(PESSOA)});`]] }),
    req({ nome: "GET /financeiro/categorias · procura as categorias de teste", op: "GET /financeiro/categorias", testes: acharCat(CAT_E, "idCatEntrada") + "\n" + acharCat(CAT_S, "idCatSaida") }),
    req({ nome: "POST /financeiro/categorias · cria a entrada de teste (primeira execução)", op: "POST /financeiro/categorias", se: "!nord.variavel('idCatEntrada')", motivo: "já existe",
      corpo: categoria(CAT_E, "ENTRADA", "MANUAL"), guardar: { idCatEntrada: "body.idCategoria" } }),
    req({ nome: "POST /financeiro/categorias · cria a saída de teste com ritmo de fatura (primeira execução)", op: "POST /financeiro/categorias", se: "!nord.variavel('idCatSaida')", motivo: "já existe",
      corpo: categoria(CAT_S, "SAIDA", "RITMO_FATURA"), guardar: { idCatSaida: "body.idCategoria" } }),
    req({ nome: "POST /financeiro/categorias · ritmo de fatura numa entrada → 400", op: "POST /financeiro/categorias", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: categoria("[newman] inválida {{nordRun}}", "ENTRADA", "RITMO_FATURA") }),
    req({ nome: "POST /financeiro/categorias · tipo inválido → 400", op: "POST /financeiro/categorias", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: categoria("[newman] inválida {{nordRun}}", "TRANSFERENCIA", "MANUAL") }),
    req({ nome: "POST /financeiro/categorias · regra de data sem dia → 400", op: "POST /financeiro/categorias", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: categoria("[newman] inválida {{nordRun}}", "SAIDA", "MANUAL", { cdRegraData: "DIA_MES" }) }),
    req({ nome: "POST /financeiro/categorias · nome repetido no mesmo tipo → 400", op: "POST /financeiro/categorias", status: 400, erro: "ENTRADA_INVALIDA", corpo: categoria(CAT_S, "SAIDA", "MANUAL") }),
    req({ nome: "PUT /financeiro/categorias/{id} · reativa a entrada", op: "PUT /financeiro/categorias/{id}", url: "/financeiro/categorias/{{idCatEntrada}}", corpo: { inAtivo: true } }),
    req({ nome: "PUT /financeiro/categorias/{id} · reativa a saída", op: "PUT /financeiro/categorias/{id}", url: "/financeiro/categorias/{{idCatSaida}}", corpo: { inAtivo: true, nrDia: 10, cdRegraData: "DIA_MES" },
      regras: [["regra de data gravada", "pm.expect(b.cdRegraData).to.eql('DIA_MES'); pm.expect(b.nrDia).to.eql(10); pm.expect(b.cdProjecao).to.eql('RITMO_FATURA');"]] }),
    req({ nome: "GET /financeiro/pessoas · usuário sem FINANCEIRO → 403", op: "GET /financeiro/pessoas", auth: "usuario", status: 403, erro: "ACESSO_NEGADO" }),
  ]),

  pasta("Configuração", "Lida e regravada com os mesmos valores (não muda a configuração real).", [
    req({ nome: "GET /financeiro/configuracao · lê", op: "GET /financeiro/configuracao",
      testes: "nord.guardar('cfgFin', JSON.stringify(b));",
      regras: [["meses da média de 1 a 12 e dias de 1 a 31", "pm.expect(b.nrMesesMedia).to.be.within(1, 12); pm.expect(b.nrDiaConferencia).to.be.within(1, 31); pm.expect(b.nrDiaFechamentoFatura).to.be.within(1, 31);"]] }),
    req({ nome: "PUT /financeiro/configuracao · regrava os mesmos valores", op: "PUT /financeiro/configuracao", corpo: "{{cfgFin}}",
      regras: [["nada mudou", "var antes = JSON.parse(nord.variavel('cfgFin')); pm.expect(b.nrMesesMedia).to.eql(antes.nrMesesMedia); pm.expect(Number(b.vlMetaSaldo)).to.eql(Number(antes.vlMetaSaldo));"]] }),
    req({ nome: "PUT /financeiro/configuracao · 13 meses de média → 400", op: "PUT /financeiro/configuracao", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { vlMetaSaldo: 0, nrMesesMedia: 13, nrDiaConferencia: 8, nrDiaFechamentoFatura: 8 } }),
  ]),

  pasta("Lançamentos", "", [
    req({ nome: "POST /financeiro/lancamentos · sem cdRequisicao → 400", op: "POST /financeiro/lancamentos", status: 400, erro: "ENTRADA_INVALIDA", corpo: lanc({ cdRequisicao: "" }) }),
    req({ nome: "POST /financeiro/lancamentos · cdRequisicao que não é UUID → 400", op: "POST /financeiro/lancamentos", status: 400, erro: "ENTRADA_INVALIDA", corpo: lanc({ cdRequisicao: "abc" }) }),
    req({ nome: "POST /financeiro/lancamentos · 121 parcelas → 400", op: "POST /financeiro/lancamentos", pre: novoUuid(), status: 400, erro: "ENTRADA_INVALIDA", corpo: lanc({ qtParcelas: 121 }) }),
    req({ nome: "POST /financeiro/lancamentos · categoria inexistente → 400", op: "POST /financeiro/lancamentos", pre: novoUuid(), status: 400, corpo: lanc({ idCategoria: 999999999 }) }),
    req({ nome: "POST /financeiro/lancamentos · usuário sem FINANCEIRO → 403", op: "POST /financeiro/lancamentos", auth: "usuario", pre: novoUuid(), status: 403, corpo: lanc() }),
    req({
      nome: "POST /financeiro/lancamentos · fatura em 2 parcelas (mar e abr de 2099)", op: "POST /financeiro/lancamentos", pre: novoUuid(), corpo: lanc({ qtParcelas: 2 }),
      guardar: { idLancFin: "body[0].idLancamento", nrVersaoLancFin: "body[0].nrVersao", idLancFin2: "body[1].idLancamento" },
      regras: [
        ["uma parcela por mês", "pm.expect(b).to.have.length(2); pm.expect(b.map(function (l) { return l.competencia; })).to.eql(['2099-03', '2099-04']);"],
        ["numeradas 1/2 e 2/2", "pm.expect(b[0].nrParcela).to.eql(1); pm.expect(b[1].nrParcela).to.eql(2); pm.expect(b[1].qtParcela).to.eql(2);"],
        ["o autor é o usuário logado", "pm.expect(b[0].idUsuarioCriacao).to.eql(Number(nord.variavel('idAdmin')));"],
      ],
    }),
    req({ nome: "POST /financeiro/lancamentos · mesmo cdRequisicao devolve as parcelas já criadas", op: "POST /financeiro/lancamentos", corpo: lanc({ qtParcelas: 2, vlLancamento: 1 }),
      regras: [["mesmos ids, sem duplicar", "pm.expect(b.map(function (l) { return l.idLancamento; })).to.eql([Number(nord.variavel('idLancFin')), Number(nord.variavel('idLancFin2'))]); pm.expect(b[0].vlLancamento).to.eql(89.9);"]] }),
    req({ nome: "POST /financeiro/lancamentos · salário realizado em mar/2099", op: "POST /financeiro/lancamentos", pre: novoUuid(),
      corpo: lanc({ idCategoria: n("{{idCatEntrada}}"), dsLancamento: "[newman] salário", vlLancamento: 5000, inRealizado: true }), guardar: { idLancEntrada: "body[0].idLancamento" } }),
    req({ nome: "POST /financeiro/lancamentos · um lançamento em fev/2099 (mês anterior)", op: "POST /financeiro/lancamentos", pre: novoUuid(),
      corpo: lanc({ dtLancamento: "2099-02-15", dsLancamento: "[newman] fevereiro", vlLancamento: 10 }) }),
    req({ nome: "GET /financeiro/lancamentos · extrato de mar/2099 da pessoa de teste", op: "GET /financeiro/lancamentos", query: { competencia: "2099-03", idPessoa: "{{idPessoaFin}}" },
      regras: [
        ["os dois lançamentos do mês", "var ids = b.lancamentos.map(function (l) { return l.idLancamento; }); pm.expect(ids).to.include(Number(nord.variavel('idLancFin'))); pm.expect(ids).to.include(Number(nord.variavel('idLancEntrada')));"],
        ["totais batem com o extrato", "pm.expect(b.resumo.entradas).to.eql(5000); pm.expect(b.resumo.saidas).to.eql(89.9); pm.expect(Math.round(b.resumo.saldo * 100)).to.eql(Math.round((5000 - 89.9) * 100));"],
        ["traz pessoas e categorias para os filtros", "pm.expect(b.pessoas).to.not.be.empty; pm.expect(b.categorias).to.not.be.empty;"],
      ] }),
    req({ nome: "GET /financeiro/lancamentos · só realizados de saída", op: "GET /financeiro/lancamentos", query: { competencia: "2099-03", idPessoa: "{{idPessoaFin}}", tipo: "SAIDA", situacao: "REALIZADO" },
      regras: [["a fatura prevista não aparece", "pm.expect(b.lancamentos.map(function (l) { return l.idLancamento; })).to.not.include(Number(nord.variavel('idLancFin')));"]] }),
    req({ nome: "GET /financeiro/lancamentos · busca por texto", op: "GET /financeiro/lancamentos", query: { de: "2099-03-01", ate: "2099-03-31", texto: "salário" },
      regras: [["acha pela descrição", "pm.expect(b.lancamentos.map(function (l) { return l.idLancamento; })).to.include(Number(nord.variavel('idLancEntrada')));"]] }),
    req({ nome: "GET /financeiro/lancamentos · competência inválida → 400", op: "GET /financeiro/lancamentos", query: { competencia: "2099-13" }, status: 400, erro: "ENTRADA_INVALIDA" }),
    req({ nome: "GET /financeiro/lancamentos · tipo inválido → 400", op: "GET /financeiro/lancamentos", query: { tipo: "TRANSFERENCIA" }, status: 400, erro: "ENTRADA_INVALIDA" }),
    req({ nome: "GET /financeiro/lancamentos · situação inválida → 400", op: "GET /financeiro/lancamentos", query: { situacao: "PAGO" }, status: 400, erro: "ENTRADA_INVALIDA" }),
    req({ nome: "GET /financeiro/resumo · totais com os filtros do extrato", op: "GET /financeiro/resumo", query: { competencia: "2099-03", idPessoa: "{{idPessoaFin}}" },
      regras: [["mesmos totais do extrato", "pm.expect(b.entradas).to.eql(5000); pm.expect(b.saidas).to.eql(89.9); pm.expect(b.qtLancamentos).to.eql(2); pm.expect(b.qtRealizados).to.eql(1); pm.expect(b.entradasRealizadas).to.eql(5000);"]] }),
    req({ nome: "GET /financeiro/resumo · de depois de até → 400", op: "GET /financeiro/resumo", query: { de: "2099-03-31", ate: "2099-03-01" }, status: 400, erro: "ENTRADA_INVALIDA" }),
    req({ nome: "PUT /financeiro/lancamentos/{id} · edita a 1ª parcela", op: "PUT /financeiro/lancamentos/{id}", url: "/financeiro/lancamentos/{{idLancFin}}",
      corpo: lanc({ vlLancamento: 120, nrVersao: n("{{nrVersaoLancFin}}") }), guardar: { nrVersaoLancFin: "body.nrVersao" },
      regras: [["valor novo, versão maior", "pm.expect(b.vlLancamento).to.eql(120);"]] }),
    req({ nome: "PUT /financeiro/lancamentos/{id} · versão antiga → 409", op: "PUT /financeiro/lancamentos/{id}", url: "/financeiro/lancamentos/{{idLancFin}}", status: 409, erro: "CONFLITO_VERSAO",
      pre: "pm.variables.set('velha', Number(nord.variavel('nrVersaoLancFin')) - 1);", corpo: lanc({ nrVersao: n("{{velha}}") }) }),
    req({ nome: "PUT /financeiro/lancamentos/{id}/realizado · marca como pago", op: "PUT /financeiro/lancamentos/{id}/realizado", url: "/financeiro/lancamentos/{{idLancFin}}/realizado",
      corpo: { inRealizado: true, nrVersao: n("{{nrVersaoLancFin}}") }, guardar: { nrVersaoLancFin: "body.nrVersao" },
      regras: [["realizado", "pm.expect(b.inRealizado).to.eql(true);"]] }),
    req({ nome: "PUT /financeiro/lancamentos/{id}/realizado · sem versão → 400", op: "PUT /financeiro/lancamentos/{id}/realizado", url: "/financeiro/lancamentos/{{idLancFin}}/realizado", status: 400, corpo: { inRealizado: false } }),
    req({ nome: "GET /financeiro/lancamentos/{id}/leituras · evolução da fatura (ritmo de fatura)", op: "GET /financeiro/lancamentos/{id}/leituras", url: "/financeiro/lancamentos/{{idLancFin}}/leituras",
      regras: [["leitura do dia com o último valor", "pm.expect(b).to.not.be.empty; pm.expect(b[b.length - 1].vlLeitura).to.eql(120);"]] }),
    req({ nome: "PUT /financeiro/categorias/{id} · tipo não muda com lançamentos → 400", op: "PUT /financeiro/categorias/{id}", url: "/financeiro/categorias/{{idCatSaida}}", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { cdTipo: "ENTRADA" }, regras: [["explica o motivo", "pm.expect(j.txMensagem).to.match(/já tem lançamentos/);"]] }),
  ]),

  pasta("Conta do mês", "", [
    req({ nome: "GET /financeiro/mes/{competencia} · conta de mar/2099", op: "GET /financeiro/mes/{competencia}", url: "/financeiro/mes/2099-03", tempoMaximoMs: 40000,
      regras: [["aberto, com saldo anterior", "pm.expect(b.competencia).to.eql('2099-03'); pm.expect(b.fechado).to.eql(false); pm.expect(b.comSaldoAnterior).to.eql(true);"],
        ["saldo final = anterior + entradas - saídas", "pm.expect(Math.round(b.saldoFinal * 100)).to.eql(Math.round((b.saldoAnterior + b.totalEntradas - b.totalSaidas) * 100));"],
        ["situação VERDE/VERMELHO", "pm.expect(['VERDE', 'VERMELHO']).to.include(b.situacao);"]] }),
    req({ nome: "GET /financeiro/mes/{competencia} · com idPessoa não há saldo anterior", op: "GET /financeiro/mes/{competencia}", url: "/financeiro/mes/2099-03", tempoMaximoMs: 40000, query: { idPessoa: "{{idPessoaFin}}" },
      regras: [["sem saldo anterior", "pm.expect(b.comSaldoAnterior).to.eql(false);"]] }),
    req({ nome: "GET /financeiro/mes/{competencia} · competência inválida → 400", op: "GET /financeiro/mes/{competencia}", url: "/financeiro/mes/03-2099", status: 400 }),
    req({ nome: "PUT /financeiro/mes/{competencia}/saldo-inicial · define 1000 em mar/2099", op: "PUT /financeiro/mes/{competencia}/saldo-inicial", url: "/financeiro/mes/2099-03/saldo-inicial", tempoMaximoMs: 40000,
      corpo: { vlSaldoInicial: 1000 }, regras: [["saldo anterior passa a ser o informado", "pm.expect(b.saldoAnterior).to.eql(1000);"]] }),
    req({ nome: "PUT /financeiro/mes/{competencia}/saldo-inicial · vazio volta ao saldo do mês anterior", op: "PUT /financeiro/mes/{competencia}/saldo-inicial", url: "/financeiro/mes/2099-03/saldo-inicial", tempoMaximoMs: 40000,
      corpo: { vlSaldoInicial: null }, regras: [["não é mais 1000 fixo", "pm.expect(b.saldoAnterior).to.be.a('number');"]] }),
    req({ nome: "POST /financeiro/mes/{competencia}/fechar · mês anterior aberto e sem saldo inicial → 400", op: "POST /financeiro/mes/{competencia}/fechar", url: "/financeiro/mes/2099-03/fechar", tempoMaximoMs: 40000, status: 400, erro: "ENTRADA_INVALIDA",
      regras: [["pede para fechar fevereiro antes", "pm.expect(j.txMensagem).to.match(/Feche antes o mês de fevereiro/);"]] }),
    req({ nome: "POST /financeiro/mes/{competencia}/reabrir · mês que não está fechado → 400", op: "POST /financeiro/mes/{competencia}/reabrir", url: "/financeiro/mes/2099-03/reabrir", tempoMaximoMs: 40000, status: 400, erro: "ENTRADA_INVALIDA" }),
  ]),

  pasta("Recorrências", "", [
    req({ nome: "GET /financeiro/recorrencias · procura a recorrência de teste", op: "GET /financeiro/recorrencias",
      testes: `var r = nord.achar(b, function (x) { return x.dsRecorrencia === ${JSON.stringify(RECORRENCIA)}; }); nord.guardar("idRecFin", r ? r.idRecorrencia : ""); nord.guardar("nrVersaoRecFin", r ? r.nrVersao : "");` }),
    req({ nome: "POST /financeiro/recorrencias · cria a recorrência de teste, só em mar/2099 (primeira execução)", op: "POST /financeiro/recorrencias", se: "!nord.variavel('idRecFin')", motivo: "já existe",
      corpo: { idCategoria: n("{{idCatSaida}}"), idPessoa: n("{{idPessoaFin}}"), dsRecorrencia: RECORRENCIA, vlRecorrencia: 50, nrDia: 5, dtInicio: "2099-03-01", dtFim: "2099-03-31", inAtivo: true },
      guardar: { idRecFin: "body.idRecorrencia", nrVersaoRecFin: "body.nrVersao" } }),
    req({ nome: "POST /financeiro/recorrencias · valor zero → 400", op: "POST /financeiro/recorrencias", status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { idCategoria: n("{{idCatSaida}}"), idPessoa: n("{{idPessoaFin}}"), vlRecorrencia: 0, dtInicio: "2099-03-01" } }),
    req({ nome: "PUT /financeiro/recorrencias/{id} · reativa e substitui os dados", op: "PUT /financeiro/recorrencias/{id}", url: "/financeiro/recorrencias/{{idRecFin}}",
      corpo: { idCategoria: n("{{idCatSaida}}"), idPessoa: n("{{idPessoaFin}}"), dsRecorrencia: RECORRENCIA, vlRecorrencia: 50, nrDia: 5, dtInicio: "2099-03-01", dtFim: "2099-03-31", inAtivo: true, nrVersao: n("{{nrVersaoRecFin}}") },
      guardar: { nrVersaoRecFin: "body.nrVersao" }, regras: [["ativa", "pm.expect(b.inAtivo).to.eql(true); pm.expect(b.cdTipo).to.eql('SAIDA');"]] }),
    req({ nome: "PUT /financeiro/recorrencias/{id} · versão antiga → 409", op: "PUT /financeiro/recorrencias/{id}", url: "/financeiro/recorrencias/{{idRecFin}}", status: 409,
      pre: "pm.variables.set('velha', Number(nord.variavel('nrVersaoRecFin')) - 1);",
      corpo: { idCategoria: n("{{idCatSaida}}"), idPessoa: n("{{idPessoaFin}}"), vlRecorrencia: 50, dtInicio: "2099-03-01", nrVersao: n("{{velha}}") } }),
    req({ nome: "POST /financeiro/recorrencias/gerar/{competencia} · gera mar/2099", op: "POST /financeiro/recorrencias/gerar/{competencia}", url: "/financeiro/recorrencias/gerar/2099-03",
      regras: [["competência e quantidade", "pm.expect(b.competencia).to.eql('2099-03'); pm.expect(b.criados).to.be.a('number');"]] }),
    req({ nome: "POST /financeiro/recorrencias/gerar/{competencia} · gerar de novo não duplica", op: "POST /financeiro/recorrencias/gerar/{competencia}", url: "/financeiro/recorrencias/gerar/2099-03",
      regras: [["nenhum criado", "pm.expect(b.criados).to.eql(0);"]] }),
    req({ nome: "GET /financeiro/lancamentos · o fixo de teste entrou em mar/2099", op: "GET /financeiro/lancamentos", query: { competencia: "2099-03", idPessoa: "{{idPessoaFin}}", texto: "Recorrência" },
      regras: [["um lançamento da recorrência no dia 5", `var l = b.lancamentos.filter(function (x) { return x.dsLancamento === ${JSON.stringify(RECORRENCIA)}; }); pm.expect(l).to.have.length(1); pm.expect(l[0].dtLancamento).to.eql('05/03/2099'); pm.expect(l[0].vlLancamento).to.eql(50);`]] }),
    req({ nome: "POST /financeiro/recorrencias/gerar/{competencia} · competência inválida → 400", op: "POST /financeiro/recorrencias/gerar/{competencia}", url: "/financeiro/recorrencias/gerar/2099-13", status: 400, erro: "ENTRADA_INVALIDA" }),
  ]),

  pasta("Fechar e reabrir o mês (financeiroCompleto=1)", "Fecha mar/2099 com saldo inicial, confere a trava e reabre. Também gera os fixos reais vigentes em abr/2099, apagados na limpeza.", [
    req({ nome: "PUT /financeiro/mes/{competencia}/saldo-inicial · saldo inicial para poder fechar", op: "PUT /financeiro/mes/{competencia}/saldo-inicial", url: "/financeiro/mes/2099-03/saldo-inicial", tempoMaximoMs: 40000,
      se: completo, motivo: motivoCompleto, corpo: { vlSaldoInicial: 1000 } }),
    req({ nome: "POST /financeiro/mes/{competencia}/fechar · fecha mar/2099", op: "POST /financeiro/mes/{competencia}/fechar", url: "/financeiro/mes/2099-03/fechar", tempoMaximoMs: 40000, se: completo, motivo: motivoCompleto,
      regras: [["fechado com o saldo real", "pm.expect(b.mes.fechado).to.eql(true); pm.expect(b.recorrenciasGeradas).to.be.a('number');"]] }),
    req({ nome: "POST /financeiro/mes/{competencia}/fechar · já fechado → 400", op: "POST /financeiro/mes/{competencia}/fechar", url: "/financeiro/mes/2099-03/fechar", tempoMaximoMs: 40000, se: completo, motivo: motivoCompleto, status: 400 }),
    req({ nome: "PUT /financeiro/lancamentos/{id}/realizado · mês fechado trava o lançamento → 400", op: "PUT /financeiro/lancamentos/{id}/realizado", url: "/financeiro/lancamentos/{{idLancFin}}/realizado",
      se: completo, motivo: motivoCompleto, status: 400, corpo: { inRealizado: false, nrVersao: n("{{nrVersaoLancFin}}") }, regras: [["pede para reabrir", "pm.expect(j.txMensagem).to.match(/está fechado/);"]] }),
    req({ nome: "POST /financeiro/recorrencias/gerar/{competencia} · mês fechado → 400", op: "POST /financeiro/recorrencias/gerar/{competencia}", url: "/financeiro/recorrencias/gerar/2099-03", se: completo, motivo: motivoCompleto, status: 400 }),
    req({ nome: "POST /financeiro/mes/{competencia}/reabrir · reabre mar/2099", op: "POST /financeiro/mes/{competencia}/reabrir", url: "/financeiro/mes/2099-03/reabrir", tempoMaximoMs: 40000, se: completo, motivo: motivoCompleto,
      regras: [["aberto de novo", "pm.expect(b.fechado).to.eql(false);"]] }),
    req({ nome: "PUT /financeiro/mes/{competencia}/saldo-inicial · tira o saldo inicial", op: "PUT /financeiro/mes/{competencia}/saldo-inicial", url: "/financeiro/mes/2099-03/saldo-inicial", tempoMaximoMs: 40000,
      se: completo, motivo: motivoCompleto, corpo: { vlSaldoInicial: null } }),
  ]),

  pasta("Fundos imobiliários", "", [
    req({ nome: "POST /financeiro/investimentos/ativos · ticker inválido → 400", op: "POST /financeiro/investimentos/ativos", status: 400, erro: "ENTRADA_INVALIDA", corpo: { cdTicker: "ABC", idPessoa: n("{{idPessoaFin}}") } }),
    req({ nome: "POST /financeiro/investimentos/ativos · sem pessoa → 400", op: "POST /financeiro/investimentos/ativos", status: 400, erro: "ENTRADA_INVALIDA", corpo: { cdTicker: TICKER } }),
    req({ nome: "POST /financeiro/investimentos/ativos · fundo de teste (cria ou reativa o arquivado)", op: "POST /financeiro/investimentos/ativos", status: [200, 201, 400],
      corpo: { cdTicker: TICKER.toLowerCase(), idPessoa: n("{{idPessoaFin}}"), nmAtivo: "[newman] Fundo de teste" },
      testes: "if (pm.response.code < 300) { nord.guardar('idAtivoFin', b.idAtivo); nord.guardar('nrVersaoAtivo', b.nrVersao); }",
      regras: [["ticker em maiúsculas (ou já ativo na carteira)", `if (pm.response.code < 300) pm.expect(b.cdTicker).to.eql("${TICKER}"); else pm.expect(j.txMensagem).to.match(/já está na carteira/);`]] }),
    req({ nome: "GET /financeiro/investimentos · carteira da pessoa de teste", op: "GET /financeiro/investimentos", query: { idPessoa: "{{idPessoaFin}}" },
      testes: `var a = nord.achar(b.ativos, function (x) { return x.cdTicker === "${TICKER}"; }); if (a) { nord.guardar('idAtivoFin', a.idAtivo); nord.guardar('nrVersaoAtivo', a.nrVersao); }`,
      regras: [["o fundo de teste aparece", `pm.expect(b.ativos.map(function (x) { return x.cdTicker; })).to.include("${TICKER}");`]] }),
    req({ nome: "POST /financeiro/investimentos/ativos · mesmo fundo na mesma pessoa → 400", op: "POST /financeiro/investimentos/ativos", status: 400, erro: "ENTRADA_INVALIDA", corpo: { cdTicker: TICKER, idPessoa: n("{{idPessoaFin}}") } }),
    req({ nome: "PUT /financeiro/investimentos/ativos/{id} · renomeia", op: "PUT /financeiro/investimentos/ativos/{id}", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}",
      corpo: { nmAtivo: "[newman] Fundo renomeado", nrVersao: n("{{nrVersaoAtivo}}") }, guardar: { nrVersaoAtivo: "body.nrVersao" },
      regras: [["nome novo", "pm.expect(b.nmAtivo).to.eql('[newman] Fundo renomeado');"]] }),
    req({ nome: "PUT /financeiro/investimentos/ativos/{id} · sem versão → 400", op: "PUT /financeiro/investimentos/ativos/{id}", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}", status: 400, corpo: { nmAtivo: "x" } }),
    req({ nome: "PUT /financeiro/investimentos/ativos/{id} · versão antiga → 409", op: "PUT /financeiro/investimentos/ativos/{id}", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}", status: 409,
      pre: "pm.variables.set('velha', Number(nord.variavel('nrVersaoAtivo')) - 1);", corpo: { nmAtivo: "x", nrVersao: n("{{velha}}") } }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/operacoes · compra 10 cotas", op: "POST /financeiro/investimentos/ativos/{id}/operacoes", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/operacoes",
      pre: novoUuid("reqCompra") + " pm.variables.set('hoje', nord.hoje());", corpo: { cdRequisicao: "{{reqCompra}}", dtOperacao: "{{hoje}}", cdTipo: "compra", qtCotas: 10, vlPreco: 10.5 },
      testes: "var op = (b.operacoes || []).filter(function (o) { return o.cdTipo === 'COMPRA' && o.qtCotas === 10; }).pop(); nord.guardar('idCompra', op ? op.idOperacao : '');",
      regras: [["10 cotas a 10,50", "pm.expect(b.qtCotas).to.eql(10); pm.expect(b.vlPrecoMedio).to.eql(10.5);"]] }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/operacoes · reenvio não duplica", op: "POST /financeiro/investimentos/ativos/{id}/operacoes", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/operacoes",
      pre: "pm.variables.set('hoje', nord.hoje());", corpo: { cdRequisicao: "{{reqCompra}}", dtOperacao: "{{hoje}}", cdTipo: "COMPRA", qtCotas: 10, vlPreco: 10.5 },
      regras: [["continua com 10 cotas", "pm.expect(b.qtCotas).to.eql(10);"]] }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/operacoes · venda maior que a posição → 400", op: "POST /financeiro/investimentos/ativos/{id}/operacoes", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/operacoes", status: 400,
      pre: novoUuid("reqVenda") + " pm.variables.set('hoje', nord.hoje());", corpo: { cdRequisicao: "{{reqVenda}}", dtOperacao: "{{hoje}}", cdTipo: "VENDA", qtCotas: 20, vlPreco: 11 },
      regras: [["sem cotas suficientes", "pm.expect(j.txMensagem).to.match(/cotas suficientes/);"]] }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/operacoes · vende 4 cotas", op: "POST /financeiro/investimentos/ativos/{id}/operacoes", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/operacoes",
      pre: novoUuid("reqVenda") + " pm.variables.set('hoje', nord.hoje());", corpo: { cdRequisicao: "{{reqVenda}}", dtOperacao: "{{hoje}}", cdTipo: "VENDA", qtCotas: 4, vlPreco: 11 },
      testes: "var op = (b.operacoes || []).filter(function (o) { return o.cdTipo === 'VENDA'; }).pop(); nord.guardar('idVenda', op ? op.idOperacao : '');",
      regras: [["ficam 6 cotas", "pm.expect(b.qtCotas).to.eql(6);"]] }),
    req({ nome: "DELETE /financeiro/investimentos/operacoes/{id} · excluir a compra deixaria a venda sem cotas → 400", op: "DELETE /financeiro/investimentos/operacoes/{id}", url: "/financeiro/investimentos/operacoes/{{idCompra}}", status: 400 }),
    req({ nome: "DELETE /financeiro/investimentos/operacoes/{id} · exclui a venda", op: "DELETE /financeiro/investimentos/operacoes/{id}", url: "/financeiro/investimentos/operacoes/{{idVenda}}",
      regras: [["volta a 10 cotas", "pm.expect(b.qtCotas).to.eql(10);"]] }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/proventos · pagamento antes da data-com → 400", op: "POST /financeiro/investimentos/ativos/{id}/proventos", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/proventos", status: 400,
      pre: "pm.variables.set('dtCom', nord.hoje(-5)); pm.variables.set('dtPag', nord.hoje(-10));", corpo: { dtCom: "{{dtCom}}", dtPagamento: "{{dtPag}}", vlPorCota: 0.1 } }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/proventos · registra provento", op: "POST /financeiro/investimentos/ativos/{id}/proventos", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/proventos",
      pre: "pm.variables.set('dtCom', nord.hoje(-10)); pm.variables.set('dtPag', nord.hoje(-5));", corpo: { dtCom: "{{dtCom}}", dtPagamento: "{{dtPag}}", vlPorCota: 0.1 },
      testes: "var p = (b.proventos || []).filter(function (x) { return x.cdOrigem !== 'PROVEDOR'; }).pop(); nord.guardar('idProvento', p ? p.idProvento : '');",
      regras: [["provento manual com total = cotas x valor", "var p = (b.proventos || []).filter(function (x) { return x.vlPorCota === 0.1; }).pop(); pm.expect(p, 'provento').to.be.an('object'); pm.expect(p.vlTotal).to.eql(Math.round(p.qtCotas * 0.1 * 100) / 100);"]] }),
    req({ nome: "POST /financeiro/investimentos/ativos/{id}/proventos/sincronizar · importa do provedor de cotações", op: "POST /financeiro/investimentos/ativos/{id}/proventos/sincronizar",
      url: "/financeiro/investimentos/ativos/{{idAtivoFin}}/proventos/sincronizar", status: [200, 502, 503],
      obs: "Depende do provedor externo (brapi); ticker de teste não existe lá, então importa zero ou o provedor recusa." }),
    req({ nome: "DELETE /financeiro/investimentos/proventos/{id} · exclui o provento", op: "DELETE /financeiro/investimentos/proventos/{id}", url: "/financeiro/investimentos/proventos/{{idProvento}}" }),
    req({ nome: "DELETE /financeiro/investimentos/operacoes/{id} · exclui a compra", op: "DELETE /financeiro/investimentos/operacoes/{id}", url: "/financeiro/investimentos/operacoes/{{idCompra}}",
      guardar: { nrVersaoAtivo: "body.nrVersao" }, regras: [["sem cotas", "pm.expect(b.qtCotas).to.eql(0);"]] }),
    req({ nome: "DELETE /financeiro/investimentos/operacoes/{id} · inexistente → 404", op: "DELETE /financeiro/investimentos/operacoes/{id}", url: "/financeiro/investimentos/operacoes/999999999", status: 404 }),
    req({ nome: "PUT /financeiro/investimentos/ativos/{id} · arquiva o fundo de teste", op: "PUT /financeiro/investimentos/ativos/{id}", url: "/financeiro/investimentos/ativos/{{idAtivoFin}}",
      corpo: { inAtivo: false, nrVersao: n("{{nrVersaoAtivo}}") } }),
    req({ nome: "GET /financeiro/investimentos · o fundo arquivado sai da carteira", op: "GET /financeiro/investimentos", query: { idPessoa: "{{idPessoaFin}}" },
      regras: [["não aparece mais", `pm.expect(b.ativos.map(function (x) { return x.cdTicker; })).to.not.include("${TICKER}");`]] }),
  ]),

  pasta("Limpeza do Financeiro", "Apaga os lançamentos de 2099 e desativa pessoa, categorias e recorrência de teste.", [
    req({ nome: "DELETE /financeiro/lancamentos/{id} · versão antiga → 409", op: "DELETE /financeiro/lancamentos/{id}", url: "/financeiro/lancamentos/{{idLancFin}}", query: { nrVersao: 0 }, status: 409 }),
    req({ nome: "DELETE /financeiro/lancamentos/{id} · exclui a 1ª parcela", op: "DELETE /financeiro/lancamentos/{id}", url: "/financeiro/lancamentos/{{idLancFin}}", query: { nrVersao: "{{nrVersaoLancFin}}" } }),
    req({ nome: "GET /financeiro/lancamentos · apaga o que sobrou em 2099", op: "GET /financeiro/lancamentos", query: { de: "2099-01-01", ate: "2099-12-31" },
      testes: `b.lancamentos.forEach(function (l) {
  pm.sendRequest({ url: nord.variavel("baseUrl") + "/api/v1/nord-tool/financeiro/lancamentos/" + l.idLancamento + "?nrVersao=" + l.nrVersao, method: "DELETE", header: { Authorization: "Bearer " + nord.variavel("token") } }, function (e, r) { if (e || r.code !== 204) console.warn("não apagou " + l.idLancamento); });
});` }),
    req({ nome: "PUT /financeiro/recorrencias/{id} · desativa a recorrência de teste", op: "PUT /financeiro/recorrencias/{id}", url: "/financeiro/recorrencias/{{idRecFin}}",
      corpo: { idCategoria: n("{{idCatSaida}}"), idPessoa: n("{{idPessoaFin}}"), dsRecorrencia: RECORRENCIA, vlRecorrencia: 50, nrDia: 5, dtInicio: "2099-03-01", dtFim: "2099-03-31", inAtivo: false, nrVersao: n("{{nrVersaoRecFin}}") } }),
    req({ nome: "PUT /financeiro/categorias/{id} · desativa a entrada de teste", op: "PUT /financeiro/categorias/{id}", url: "/financeiro/categorias/{{idCatEntrada}}", corpo: { inAtivo: false } }),
    req({ nome: "PUT /financeiro/categorias/{id} · desativa a saída de teste", op: "PUT /financeiro/categorias/{id}", url: "/financeiro/categorias/{{idCatSaida}}", corpo: { inAtivo: false } }),
    req({ nome: "POST /financeiro/lancamentos · categoria inativa → 400", op: "POST /financeiro/lancamentos", pre: novoUuid(), status: 400, erro: "ENTRADA_INVALIDA", corpo: lanc(),
      regras: [["avisa que está inativa", "pm.expect(j.txMensagem).to.match(/inativa/);"]] }),
    req({ nome: "PUT /financeiro/pessoas/{id} · desativa a pessoa de teste", op: "PUT /financeiro/pessoas/{id}", url: "/financeiro/pessoas/{{idPessoaFin}}", corpo: { inAtivo: false },
      regras: [["inativa", "pm.expect(b.inAtivo).to.eql(false);"]] }),
  ]),
]);
