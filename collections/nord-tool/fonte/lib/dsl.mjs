// Blocos para escrever as requisições dos domínios (fonte/dominios/*.mjs).
//
// req({ nome, op, url, status, erro, corpo, form, arquivo, query, auth, pre, testes, guardar, regras, se, ... })
//   op       "MÉTODO /rota" como no OpenAPI, sem o prefixo /api/v1/nord-tool (ex.: "PUT /medicoes/{id}")
//   url      rota com variáveis {{x}}; sem ela, vale a rota do op com {param} -> {{param}}
//   status   status esperado; sem ele, o status de sucesso que o controller devolve (contrato/status.json)
//   erro     cdErro esperado quando o status é de erro (string ou lista)
//   corpo    objeto JSON; use n("{{x}}") para número/booleano vindo de variável e cru("...") para JSON pronto
//   form     multipart: { campo: arquivo("x.png") | "texto" }
//   arquivo  corpo binário (application/octet-stream): arquivo("parte.bin")
//   auth     "admin" (padrão, {{token}}), "usuario" ({{tokenUsuario}}) ou "nenhum"
//   guardar  { variavel: "caminho no JSON da resposta" } ex.: { idMedicao: "body.id" }
//   regras   [["descrição", "código JS com pm.expect"]]  (b = body da resposta, j = JSON inteiro)
//   pre      código JS antes da requisição (depois de carregar a biblioteca `nord`)
//   testes   código JS depois das verificações padrão
//   se       expressão JS; falsa = a requisição é pulada (motivo em `motivo`)
//   headers  cabeçalhos extras; semContexto: true tira X-Obra/X-Fase
//   schema / front: false desliga a validação do OpenAPI / dos campos do front
//   binario: true  resposta é arquivo; texto: true resposta não é JSON

export const n = (v) => `__cru__${v}__fim__`;
export const cru = (v) => `__cru__${v}__fim__`;
export const arquivo = (nome) => ({ __arquivo: nome });

export function req(o) {
  if (!o.nome || !o.op) throw new Error(`requisição sem nome ou op: ${JSON.stringify(o).slice(0, 120)}`);
  return { tipo: "req", ...o };
}

export function pasta(nome, descricao, itens) {
  return { tipo: "pasta", nome, descricao, itens: itens.flat() };
}

/**
 * Download de arquivo (PDF/imagem): 200 com o conteúdo, ETag por versão e Cache-Control do tipo; depois o mesmo
 * GET com If-None-Match responde 304 sem corpo. `cache`: "pdf" (5 min), "imagem" (imutável) ou "nenhum" (no-store).
 */
export function download({ nome, op, url, cache = "imagem", tipo = /image\//, ...resto }) {
  const politica = { pdf: "max-age=300", imagem: "immutable", nenhum: "no-store" }[cache];
  const chave = "etag" + Math.abs([...op + url].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7));
  const itens = [
    req({
      nome: `${op.split(" ")[0]} ${op.split(" ")[1]} · ${nome}`,
      op, url, binario: true, ...resto,
      regras: [
        [`Content-Type ${tipo}`, `pm.expect(String(pm.response.headers.get('Content-Type'))).to.match(${tipo});`],
        [`Cache-Control ${politica}`, `pm.expect(String(pm.response.headers.get('Cache-Control'))).to.include(${JSON.stringify(politica)});`],
        ...(cache === "nenhum" ? [] : [["ETag pela versão do arquivo", "pm.expect(pm.response.headers.get('ETag')).to.match(/^\"\\d+\"$/);"]]),
      ],
      testes: `nord.guardar(${JSON.stringify(chave)}, pm.response.headers.get("ETag") || "");`,
    }),
  ];
  if (cache !== "nenhum") {
    itens.push(req({
      nome: `${op.split(" ")[0]} ${op.split(" ")[1]} · mesma versão (If-None-Match) → 304`,
      op, url, status: 304, ...resto, headers: { ...(resto.headers || {}), "If-None-Match": `{{${chave}}}` },
    }));
  }
  return itens;
}

/** Código JS comum: marca uma variável do run com valor único (prefixo [newman] e o id do run). */
export const unico = (nome, base) => `nord.guardar(${JSON.stringify(nome)}, ${JSON.stringify(base)} + " " + nord.variavel("nordRun"));`;
