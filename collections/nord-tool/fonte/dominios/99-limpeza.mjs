import { pasta, req } from "../lib/dsl.mjs";

export default pasta("99 Limpeza", "Desativa o usuário comum de teste até o próximo run (ele some das listas de pessoas e dos rankings). A preparação do próximo run reativa.", [
  req({
    nome: "PUT /administracao/acessos/{id} · desativa o usuário de teste",
    op: "PUT /administracao/acessos/{id}", url: "/administracao/acessos/{{idUsuario}}", semContexto: true,
    se: "nord.variavel('idUsuario')", motivo: "sem usuário de teste",
    corpo: { cdPerfil: "USER", inAtivo: false, acessos: {} },
    regras: [["inativo", "pm.expect(b.inAtivo).to.eql(false);"]],
  }),
  req({
    nome: "GET /auth/me · token do usuário desativado deixa de valer",
    op: "GET /auth/me", auth: "usuario", semContexto: true, status: 401,
  }),
]);
