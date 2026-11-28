import { pasta, req } from "../lib/dsl.mjs";

const s = { semContexto: true };

// CRUD simples de cadastro (CADASTROS:ESCRITA para gravar; listar só exige login).
function crud({ titulo, base, campo, idVar, extra = {} }) {
  return pasta(titulo, `Cria, lista, altera e exclui um registro temporário. Gravar exige CADASTROS:ESCRITA (usuário comum → 403).`, [
    req({
      nome: `POST ${base} · cria`,
      op: `POST ${base}`, ...s,
      corpo: { [campo]: `[newman] ${titulo} {{nordRun}}`, ...extra },
      guardar: { [idVar]: "body.id" },
      regras: [["devolve o id e o nome gravado", `pm.expect(b.id).to.be.a('number'); pm.expect(b.${campo}).to.eql('[newman] ${titulo} ' + nord.variavel('nordRun'));`]],
    }),
    req({ nome: `POST ${base} · sem nome → 400`, op: `POST ${base}`, ...s, status: 400, erro: "ENTRADA_INVALIDA", corpo: { ...extra } }),
    req({ nome: `POST ${base} · usuário comum → 403`, op: `POST ${base}`, auth: "usuario", ...s, status: 403, erro: "ACESSO_NEGADO", corpo: { [campo]: "[newman] proibido", ...extra } }),
    req({
      nome: `GET ${base} · lista com o registro novo`,
      op: `GET ${base}`, ...s,
      regras: [["o registro criado aparece", `pm.expect((b || []).map(function (x) { return x.id; })).to.include(Number(nord.variavel('${idVar}')));`]],
    }),
    req({
      nome: `PUT ${base}/{id} · altera`,
      op: `PUT ${base}/{id}`, url: `${base}/{{${idVar}}}`, ...s,
      corpo: { [campo]: `[newman] ${titulo} alterado {{nordRun}}`, ...extra },
      regras: [["nome alterado", `pm.expect(b.${campo}).to.match(/alterado/);`]],
    }),
    req({ nome: `DELETE ${base}/{id} · exclui`, op: `DELETE ${base}/{id}`, url: `${base}/{{${idVar}}}`, ...s }),
    req({
      nome: `GET ${base} · o excluído some da lista`,
      op: `GET ${base}`, ...s,
      regras: [["não aparece mais", `pm.expect((b || []).map(function (x) { return x.id; })).to.not.include(Number(nord.variavel('${idVar}')));`]],
    }),
  ]);
}

export default pasta("03 Cadastros e domínios", "Empresas, cargos, permissões (legado), colaboradores, ferramentas e as listas fixas usadas nos combos.", [
  crud({ titulo: "Empresa", base: "/empresas", campo: "nmEmpresa", idVar: "idEmpresa" }),
  crud({ titulo: "Cargo", base: "/cargos", campo: "nmCargo", idVar: "idCargo" }),
  crud({ titulo: "Permissão", base: "/permissoes", campo: "nmPermissao", idVar: "idPermissao" }),

  pasta("Colaboradores (legado)", "Usa empresa, cargo e permissão temporários; celular com 10 ou 11 dígitos.", [
    req({ nome: "POST /empresas · empresa do colaborador", op: "POST /empresas", ...s, corpo: { nmEmpresa: "[newman] Empresa colab {{nordRun}}" }, guardar: { idEmpresaColab: "body.id" } }),
    req({ nome: "POST /cargos · cargo do colaborador", op: "POST /cargos", ...s, corpo: { nmCargo: "[newman] Cargo colab {{nordRun}}" }, guardar: { idCargoColab: "body.id" } }),
    req({ nome: "POST /permissoes · permissão do colaborador", op: "POST /permissoes", ...s, corpo: { nmPermissao: "[newman] Permissão colab {{nordRun}}" }, guardar: { idPermissaoColab: "body.id" } }),
    req({
      nome: "POST /colaboradores · cria",
      op: "POST /colaboradores", ...s,
      corpo: { nmColaborador: "[newman] Colaborador {{nordRun}}", nrCelular: "11999990000", idEmpresa: "__cru__{{idEmpresaColab}}__fim__", idCargo: "__cru__{{idCargoColab}}__fim__", idPermissao: "__cru__{{idPermissaoColab}}__fim__" },
      guardar: { idColaborador: "body.id" },
      regras: [["traz os nomes de empresa e cargo", "pm.expect(b.nmEmpresa).to.match(/newman/); pm.expect(b.nmCargo).to.match(/newman/);"]],
    }),
    req({
      nome: "POST /colaboradores · celular com letras → 400",
      op: "POST /colaboradores", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { nmColaborador: "[newman] Colaborador inválido", nrCelular: "abc", idEmpresa: "__cru__{{idEmpresaColab}}__fim__", idCargo: "__cru__{{idCargoColab}}__fim__", idPermissao: "__cru__{{idPermissaoColab}}__fim__" },
    }),
    req({ nome: "GET /colaboradores · lista", op: "GET /colaboradores", ...s,
      regras: [["o colaborador criado aparece", "pm.expect(b.map(function (x) { return x.id; })).to.include(Number(nord.variavel('idColaborador')));"]] }),
    req({ nome: "GET /colaboradores/{id} · busca", op: "GET /colaboradores/{id}", url: "/colaboradores/{{idColaborador}}", ...s,
      regras: [["é o colaborador criado", "pm.expect(b.id).to.eql(Number(nord.variavel('idColaborador')));"]] }),
    req({
      nome: "PUT /colaboradores/{id} · altera",
      op: "PUT /colaboradores/{id}", url: "/colaboradores/{{idColaborador}}", ...s,
      corpo: { nmColaborador: "[newman] Colaborador alterado {{nordRun}}", nrCelular: "1133334444", idEmpresa: "__cru__{{idEmpresaColab}}__fim__", idCargo: "__cru__{{idCargoColab}}__fim__", idPermissao: "__cru__{{idPermissaoColab}}__fim__" },
      regras: [["dados alterados", "pm.expect(b.nmColaborador).to.match(/alterado/); pm.expect(b.nrCelular).to.eql('1133334444');"]],
    }),
    req({ nome: "DELETE /cargos/{id} · cargo em uso por colaborador → 422 REGISTRO_EM_USO", op: "DELETE /cargos/{id}", url: "/cargos/{{idCargoColab}}", ...s, status: 422, erro: "REGISTRO_EM_USO" }),
    req({ nome: "DELETE /colaboradores/{id} · exclui", op: "DELETE /colaboradores/{id}", url: "/colaboradores/{{idColaborador}}", ...s }),
    req({ nome: "GET /colaboradores/{id} · excluído → 404", op: "GET /colaboradores/{id}", url: "/colaboradores/{{idColaborador}}", ...s, status: 404 }),
    req({ nome: "DELETE /empresas/{id} · limpa a empresa do colaborador", op: "DELETE /empresas/{id}", url: "/empresas/{{idEmpresaColab}}", ...s }),
    req({ nome: "DELETE /cargos/{id} · limpa o cargo do colaborador", op: "DELETE /cargos/{id}", url: "/cargos/{{idCargoColab}}", ...s }),
    req({ nome: "DELETE /permissoes/{id} · limpa a permissão do colaborador", op: "DELETE /permissoes/{id}", url: "/permissoes/{{idPermissaoColab}}", ...s }),
  ]),

  pasta("Ferramentas", "Cadastro de ferramentas (também usadas no controle de chaves).", [
    req({
      nome: "POST /ferramentas · cria",
      op: "POST /ferramentas", ...s,
      corpo: { nmFerramenta: "[newman] Furadeira {{nordRun}}", nmCategoria: "Elétrica", cdPatrimonio: "NW-{{nordRun}}", flAtivo: true },
      guardar: { idFerramenta: "body.id" },
      regras: [["ativa e com patrimônio", "pm.expect(b.flAtivo).to.eql(true); pm.expect(b.cdPatrimonio).to.eql('NW-' + nord.variavel('nordRun'));"]],
    }),
    req({ nome: "POST /ferramentas · sem nome → 400", op: "POST /ferramentas", ...s, status: 400, erro: "ENTRADA_INVALIDA", corpo: { nmCategoria: "Elétrica" } }),
    req({ nome: "POST /ferramentas · usuário comum → 403", op: "POST /ferramentas", auth: "usuario", ...s, status: 403, corpo: { nmFerramenta: "[newman] proibida" } }),
    req({ nome: "GET /ferramentas · lista", op: "GET /ferramentas", ...s }),
    req({ nome: "GET /ferramentas/{id} · busca", op: "GET /ferramentas/{id}", url: "/ferramentas/{{idFerramenta}}", ...s,
      regras: [["é a ferramenta criada", "pm.expect(b.nmFerramenta).to.match(/Furadeira/);"]] }),
    req({
      nome: "PUT /ferramentas/{id} · desativa",
      op: "PUT /ferramentas/{id}", url: "/ferramentas/{{idFerramenta}}", ...s,
      corpo: { nmFerramenta: "[newman] Furadeira {{nordRun}}", nmCategoria: "Elétrica", cdPatrimonio: "NW-{{nordRun}}", flAtivo: false },
      regras: [["fica inativa", "pm.expect(b.flAtivo).to.eql(false);"]],
    }),
    req({ nome: "DELETE /ferramentas/{id} · exclui", op: "DELETE /ferramentas/{id}", url: "/ferramentas/{{idFerramenta}}", ...s }),
    req({ nome: "GET /ferramentas/{id} · excluída → 404", op: "GET /ferramentas/{id}", url: "/ferramentas/{{idFerramenta}}", ...s, status: 404 }),
    req({ nome: "GET /ferramentas/{id} · inexistente → 404", op: "GET /ferramentas/{id}", url: "/ferramentas/999999999", ...s, status: 404 }),
  ]),

  pasta("Listas fixas", "Valores de domínio que alimentam os combos das telas.", [
    req({ nome: "GET /diaSemana · dias da semana", op: "GET /diaSemana", ...s,
      guardar: { idDiaSemana: "body[0].idDiaSemana" },
      regras: [["ao menos os 7 dias", "pm.expect(b.length).to.be.at.least(7); b.forEach(function (d) { pm.expect(d.nmDiaSemana).to.be.a('string'); });"]] }),
    req({ nome: "GET /statusVistoria · status de vistoria", op: "GET /statusVistoria", ...s,
      guardar: { idStatusVistoria: "body[0].idStatusVistoria" },
      regras: [["lista não vazia", "pm.expect(b).to.not.be.empty;"]] }),
    req({ nome: "GET /statusCronogramaSemanal · status do cronograma", op: "GET /statusCronogramaSemanal", ...s,
      regras: [["lista não vazia", "pm.expect(b).to.not.be.empty;"]] }),
    req({ nome: "GET /categoria · categorias", op: "GET /categoria", ...s }),
    req({ nome: "GET /diaSemana · sem token → 401", op: "GET /diaSemana", auth: "nenhum", ...s, status: 401 }),
  ]),
]);
