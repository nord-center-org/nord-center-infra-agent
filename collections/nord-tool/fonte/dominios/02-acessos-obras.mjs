import { pasta, req } from "../lib/dsl.mjs";

const s = { semContexto: true };

export default pasta("02 Acessos, obras e fases", "Administração (ADMINISTRACAO:ADMIN). Só o usuário de teste, a obra de teste e um cargo temporário são alterados.", [
  pasta("Acessos", `Regras: o admin não se desativa nem tira o próprio ADMIN (422 ULTIMO_ADMIN); superior não pode gerar ciclo; cadastro já decidido não muda (422 CADASTRO_JA_DECIDIDO); o admin não reseta a própria senha por aqui.`, [
    req({
      nome: "GET /administracao/acessos · usuários, perfis, módulos e cargos",
      op: "GET /administracao/acessos", ...s,
      regras: [
        ["perfis ADMIN e USER existem", "var c = b.perfis.map(function (p) { return p.cdPerfil; }); pm.expect(c).to.include('ADMIN'); pm.expect(c).to.include('USER');"],
        ["lista os módulos controlados", "pm.expect(b.modulos).to.include('MEDICOES'); pm.expect(b.modulos).to.include('ADMINISTRACAO');"],
        ["usuário de teste com perfil USER", "var u = nord.achar(b.usuarios, function (x) { return x.id == nord.variavel('idUsuario'); }); pm.expect(u.cdPerfil).to.eql('USER');"],
      ],
    }),
    req({ nome: "GET /administracao/acessos · usuário comum → 403 ACESSO_NEGADO", op: "GET /administracao/acessos", auth: "usuario", ...s, status: 403, erro: "ACESSO_NEGADO" }),
    req({
      nome: "PUT /administracao/acessos/{id} · admin se desativar → 422 ULTIMO_ADMIN",
      op: "PUT /administracao/acessos/{id}", url: "/administracao/acessos/{{idAdmin}}", ...s, status: 422, erro: "ULTIMO_ADMIN",
      corpo: { cdPerfil: "{{perfilAdmin}}", inAtivo: false, acessos: {} },
    }),
    req({
      nome: "PUT /administracao/acessos/{id} · perfil inexistente → 400",
      op: "PUT /administracao/acessos/{id}", url: "/administracao/acessos/{{idUsuario}}", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { cdPerfil: "NAO_EXISTE", inAtivo: true, acessos: {} },
    }),
    req({
      nome: "PUT /administracao/acessos/{id} · usuário inexistente → 404",
      op: "PUT /administracao/acessos/{id}", url: "/administracao/acessos/999999999", ...s, status: 404, erro: "NAO_ENCONTRADO",
      corpo: { cdPerfil: "USER", inAtivo: true, acessos: {} },
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/cadastro · cadastro já decidido → 422",
      op: "PUT /administracao/acessos/{id}/cadastro", url: "/administracao/acessos/{{idUsuario}}/cadastro", ...s, status: 422, erro: "CADASTRO_JA_DECIDIDO",
      corpo: { aprovar: true, idsFases: [] },
    }),
    req({
      nome: "POST /administracao/acessos/{id}/resetar-senha · a própria senha → 422",
      op: "POST /administracao/acessos/{id}/resetar-senha", url: "/administracao/acessos/{{idAdmin}}/resetar-senha", ...s, status: 422,
      regras: [["indica Alterar senha nas Configurações", "pm.expect(j.txMensagem).to.match(/Alterar senha/);"]],
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/superior · admin vira superior do usuário de teste",
      op: "PUT /administracao/acessos/{id}/superior", url: "/administracao/acessos/{{idUsuario}}/superior", ...s,
      corpo: { idSuperior: "__cru__{{idAdmin}}__fim__" },
      regras: [["superior gravado", "pm.expect(b.idSuperior).to.eql(Number(nord.variavel('idAdmin')));"]],
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/superior · superior de si mesmo → 400",
      op: "PUT /administracao/acessos/{id}/superior", url: "/administracao/acessos/{{idUsuario}}/superior", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { idSuperior: "__cru__{{idUsuario}}__fim__" },
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/superior · ciclo (admin abaixo do próprio subordinado) → 400",
      op: "PUT /administracao/acessos/{id}/superior", url: "/administracao/acessos/{{idAdmin}}/superior", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { idSuperior: "__cru__{{idUsuario}}__fim__" },
      regras: [["recusa o ciclo", "pm.expect(j.txMensagem).to.match(/ciclo/);"]],
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/superior · tira o superior (nulo)",
      op: "PUT /administracao/acessos/{id}/superior", url: "/administracao/acessos/{{idUsuario}}/superior", ...s,
      corpo: { idSuperior: null },
      regras: [["sem superior", "pm.expect(b.idSuperior == null).to.eql(true);"]],
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/superior · volta o admin como superior (usado na hierarquia das equipes)",
      op: "PUT /administracao/acessos/{id}/superior", url: "/administracao/acessos/{{idUsuario}}/superior", ...s,
      corpo: { idSuperior: "__cru__{{idAdmin}}__fim__" },
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/dados · nome e celular do usuário de teste",
      op: "PUT /administracao/acessos/{id}/dados", url: "/administracao/acessos/{{idUsuario}}/dados", ...s,
      corpo: { nmNome: "[newman] Usuário de teste", nrCelular: "(11) 99999-0000", nmEmail: "{{usuarioEmail}}" },
      regras: [["dados gravados", "pm.expect(b.nmNome).to.eql('[newman] Usuário de teste'); pm.expect(b.nrCelular).to.eql('(11) 99999-0000');"]],
    }),
    req({
      nome: "PUT /administracao/acessos/{id}/dados · e-mail de outra pessoa → 400",
      op: "PUT /administracao/acessos/{id}/dados", url: "/administracao/acessos/{{idUsuario}}/dados", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmNome: "[newman] Usuário de teste", nmEmail: "{{emailAdmin}}" },
    }),
    req({ nome: "GET /administracao/acessos/colaboradores-legados · base antiga", op: "GET /administracao/acessos/colaboradores-legados", ...s }),
    req({
      nome: "PUT /administracao/acessos/colaboradores-legados/{idUser} · colaborador inexistente → 404",
      op: "PUT /administracao/acessos/colaboradores-legados/{idUser}", url: "/administracao/acessos/colaboradores-legados/999999999", ...s, status: 404,
      corpo: { idUsuario: null },
      obs: "Não vincula colaboradores reais: só confere a recusa.",
    }),
    pasta("Acessos mínimos de um cargo", "Cargo temporário criado e excluído no run.", [
      req({
        nome: "POST /cargos · cargo temporário",
        op: "POST /cargos", ...s,
        corpo: { nmCargo: "[newman] Cargo {{nordRun}}" },
        guardar: { idCargoAcesso: "body.id" },
      }),
      req({
        nome: "PUT /administracao/acessos/cargos/{idCargo} · cargo ganha SAC:LEITURA",
        op: "PUT /administracao/acessos/cargos/{idCargo}", url: "/administracao/acessos/cargos/{{idCargoAcesso}}", ...s,
        corpo: { acessos: { SAC: "LEITURA" } },
        regras: [["acesso do cargo gravado", "pm.expect(b.acessos.SAC).to.eql('LEITURA'); pm.expect(b.idCargo).to.eql(Number(nord.variavel('idCargoAcesso')));"]],
      }),
      req({
        nome: "PUT /administracao/acessos/cargos/{idCargo} · limpa os acessos do cargo",
        op: "PUT /administracao/acessos/cargos/{idCargo}", url: "/administracao/acessos/cargos/{{idCargoAcesso}}", ...s,
        corpo: { acessos: {} },
        regras: [["sem acessos", "pm.expect(Object.keys(b.acessos || {}).filter(function (k) { return b.acessos[k] !== 'NENHUM'; })).to.be.empty;"]],
      }),
      req({ nome: "DELETE /cargos/{id} · exclui o cargo temporário", op: "DELETE /cargos/{id}", url: "/cargos/{{idCargoAcesso}}", ...s }),
    ]),
  ]),

  pasta("Obras e fases", "Edição com nrVersao (divergente → 409 CONFLITO_VERSAO), código de acesso único (422 REGISTRO_DUPLICADO) e participantes da fase.", [
    req({
      nome: "PUT /administracao/obras/{id} · edita a obra de teste",
      op: "PUT /administracao/obras/{id}", url: "/administracao/obras/{{idObra}}", ...s,
      corpo: { nmObra: "[newman] Obra de teste", cdAcesso: "NEWMAN-QA", inAtivo: true, nrVersao: "__cru__{{nrVersaoObra}}__fim__" },
      guardar: { nrVersaoObra: "body.nrVersao" },
      regras: [["versão sobe a cada edição", "pm.expect(b.nrVersao).to.eql(Number(pm.variables.get('nrVersaoAntes')) + 1);"]],
      pre: "pm.variables.set('nrVersaoAntes', nord.variavel('nrVersaoObra'));",
    }),
    req({
      nome: "PUT /administracao/obras/{id} · versão antiga → 409 CONFLITO_VERSAO",
      op: "PUT /administracao/obras/{id}", url: "/administracao/obras/{{idObra}}", ...s, status: 409, erro: "CONFLITO_VERSAO",
      corpo: { nmObra: "[newman] Obra de teste", cdAcesso: "NEWMAN-QA", inAtivo: true, nrVersao: "__cru__{{nrVersaoAntes}}__fim__" },
      pre: "pm.variables.set('nrVersaoAntes', Number(nord.variavel('nrVersaoObra')) - 1);",
    }),
    req({
      nome: "PUT /administracao/obras/{id} · sem nrVersao → 400",
      op: "PUT /administracao/obras/{id}", url: "/administracao/obras/{{idObra}}", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmObra: "[newman] Obra de teste", cdAcesso: "NEWMAN-QA" },
    }),
    req({
      nome: "POST /administracao/obras · código de acesso repetido → 422 REGISTRO_DUPLICADO",
      op: "POST /administracao/obras", ...s, status: 422, erro: "REGISTRO_DUPLICADO",
      corpo: { nmObra: "[newman] Obra duplicada {{nordRun}}", cdAcesso: "newman-qa" },
    }),
    req({
      nome: "POST /administracao/obras · código de acesso inválido → 400",
      op: "POST /administracao/obras", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmObra: "[newman] Obra inválida", cdAcesso: "a b" },
    }),
    req({ nome: "POST /administracao/obras · usuário comum → 403", op: "POST /administracao/obras", auth: "usuario", ...s, status: 403, erro: "ACESSO_NEGADO",
      corpo: { nmObra: "[newman] Obra proibida", cdAcesso: "NEWMAN-NAO" } }),
    req({
      nome: "PUT /administracao/fases/{id} · edita a fase de teste",
      op: "PUT /administracao/fases/{id}", url: "/administracao/fases/{{idFase}}", ...s,
      corpo: { nmFase: "[newman] Fase de teste", cdFase: "NWQA", nrOrdem: 1, inAtivo: true, nrVersao: "__cru__{{nrVersaoFase}}__fim__" },
      guardar: { nrVersaoFase: "body.nrVersao" },
      regras: [["mantém os participantes", "pm.expect(b.idsUsuarios).to.include(Number(nord.variavel('idUsuario')));"]],
    }),
    req({
      nome: "PUT /administracao/fases/{id} · versão antiga → 409",
      op: "PUT /administracao/fases/{id}", url: "/administracao/fases/{{idFase}}", ...s, status: 409, erro: "CONFLITO_VERSAO",
      pre: "pm.variables.set('versaoVelha', Number(nord.variavel('nrVersaoFase')) - 1);",
      corpo: { nmFase: "[newman] Fase de teste", cdFase: "NWQA", nrVersao: "__cru__{{versaoVelha}}__fim__" },
    }),
    req({
      nome: "POST /administracao/obras/{id}/fases · obra inexistente → 404",
      op: "POST /administracao/obras/{id}/fases", url: "/administracao/obras/999999999/fases", ...s, status: 404, erro: "NAO_ENCONTRADO",
      corpo: { nmFase: "[newman] Fase órfã", cdFase: "ORFA" },
    }),
    req({
      nome: "PUT /administracao/fases/{id}/usuarios · usuário inexistente → 400",
      op: "PUT /administracao/fases/{id}/usuarios", url: "/administracao/fases/{{idFase}}/usuarios", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { idsUsuarios: ["__cru__{{idUsuario}}__fim__", 999999999] },
    }),
    req({
      nome: "POST /administracao/obras/vincular-apartamentos · liga apartamentos antigos pela sigla",
      op: "POST /administracao/obras/vincular-apartamentos", ...s,
      regras: [["devolve as contagens", "pm.expect(b.qtLigados).to.be.a('number'); pm.expect(b.qtSemFase).to.be.a('number');"]],
      obs: "Idempotente: só liga apartamentos sem fase cuja sigla do código bate com uma fase.",
    }),
    req({
      nome: "GET /contexto/obras · usuário comum só vê as obras em que participa, sem o código de acesso",
      op: "GET /contexto/obras", auth: "usuario", ...s,
      regras: [
        ["vê a obra de teste", "pm.expect(b.map(function (o) { return o.id; })).to.include(Number(nord.variavel('idObra')));"],
        ["não recebe o código de acesso", "b.forEach(function (o) { pm.expect(o.cdAcesso == null).to.eql(true); });"],
      ],
    }),
  ]),
]);
