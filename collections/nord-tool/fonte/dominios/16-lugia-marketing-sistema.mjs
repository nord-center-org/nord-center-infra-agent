import { arquivo, pasta, req } from "../lib/dsl.mjs";

const s = { semContexto: true };

export default pasta("16 Lugia, marketing, drumcam e sistema", `Integrações com serviços de fora: só o que não chama IA paga nem publica em rede social.

- Lugia (LUGIA): modelos, conversas e a validação do chat (modelo indisponível → 400, sem chamar provedor);
- Marketing (MARKETING): redes, painel, publicações, upload do vídeo em partes (em ordem, tamanho exato) e as recusas de conectar e publicar;
- Drumcam: bilhete de uso único para câmera ou controle;
- Cache (ADMINISTRACAO:ADMIN): limpar um cache e todos; cache inexistente → 404.`, [
  pasta("Lugia", "", [
    req({ nome: "GET /lugia/modelos · modelos e nível do usuário", op: "GET /lugia/modelos", ...s,
      regras: [["lista de modelos e se o agente está liberado", "pm.expect(b.modelos).to.be.an('array'); pm.expect(b.agenteDisponivel).to.be.a('boolean');"]] }),
    req({ nome: "GET /lugia/conversas · conversas do usuário", op: "GET /lugia/conversas", ...s }),
    req({ nome: "POST /lugia/chat · modelo inexistente → 400 (não chama a IA)", op: "POST /lugia/chat", ...s, status: 400, erro: "ENTRADA_INVALIDA",
      corpo: { modelo: "nao-existe/newman", texto: "[newman] não deve chegar a nenhuma IA" } }),
    req({ nome: "POST /lugia/chat · usuário sem LUGIA → 403", op: "POST /lugia/chat", auth: "usuario", ...s, status: 403, corpo: { modelo: "nao-existe", texto: "x" } }),
    req({ nome: "GET /lugia/conversas/{id} · conversa inexistente → 404", op: "GET /lugia/conversas/{id}", url: "/lugia/conversas/999999999", ...s, status: 404 }),
    req({ nome: "PATCH /lugia/conversas/{id} · renomear inexistente → 404", op: "PATCH /lugia/conversas/{id}", url: "/lugia/conversas/999999999", ...s, status: 404, corpo: { titulo: "[newman]" } }),
    req({ nome: "PATCH /lugia/conversas/{id} · sem título → 400", op: "PATCH /lugia/conversas/{id}", url: "/lugia/conversas/999999999", ...s, status: 400, erro: "ENTRADA_INVALIDA", corpo: {} }),
    req({ nome: "DELETE /lugia/conversas/{id} · inexistente → 404", op: "DELETE /lugia/conversas/{id}", url: "/lugia/conversas/999999999", ...s, status: 404 }),
  ]),

  pasta("Marketing", "", [
    req({ nome: "GET /marketing/redes · redes e contas conectadas", op: "GET /marketing/redes", ...s,
      testes: "var r = (b || [])[0]; nord.guardar('redeMarketing', r ? r.cdRede : 'youtube');",
      regras: [["cada rede diz se está configurada", "b.forEach(function (r) { pm.expect(r.inConfigurada).to.be.a('boolean'); pm.expect(r.contas).to.be.an('array'); });"]] }),
    req({ nome: "GET /marketing/painel · painel sem atualizar na rede", op: "GET /marketing/painel", ...s, query: { atualizar: false } }),
    req({ nome: "GET /marketing/publicacoes · publicações feitas", op: "GET /marketing/publicacoes", ...s }),
    req({ nome: "GET /marketing/conexao · endereço do login da rede (ou rede não configurada)", op: "GET /marketing/conexao", ...s, status: [200, 400, 422],
      query: { rede: "{{redeMarketing}}", origem: "http://localhost:5173" },
      regras: [["URL https quando configurada", "if (pm.response.code === 200) pm.expect(b.txUrl).to.match(/^https:\\/\\//);"]] }),
    req({ nome: "POST /marketing/contas · código de login inválido → recusa", op: "POST /marketing/contas", ...s, status: [400, 422],
      corpo: { cdRede: "{{redeMarketing}}", txCodigo: "codigo-invalido", txEstado: "estado-invalido" } }),
    req({ nome: "DELETE /marketing/contas/{id} · conta inexistente → 404", op: "DELETE /marketing/contas/{id}", url: "/marketing/contas/999999999", ...s, status: 404 }),
    req({ nome: "POST /marketing/midias · tipo que não é vídeo → 400", op: "POST /marketing/midias", ...s, status: 400, erro: "ENTRADA_INVALIDA", corpo: { txNome: "x.gif", nrTamanho: 10, txTipo: "image/gif" } }),
    req({ nome: "POST /marketing/midias · começa a receber um vídeo de 4 KB", op: "POST /marketing/midias", ...s, status: [201, 422],
      corpo: { txNome: "[newman].mp4", nrTamanho: 4096, txTipo: "video/mp4" }, guardar: { idMidia: "(b && b.id) || ''" },
      regras: [["uma parte de até 8 MB (ou 3 vídeos pendentes → 422)", "if (pm.response.code === 201) { pm.expect(b.nrPartes).to.eql(1); pm.expect(b.nrTamanhoParte).to.eql(8 * 1024 * 1024); } else pm.expect(j.txMensagem).to.match(/Espere/);"]] }),
    req({ nome: "PUT /marketing/midias/{id}/partes/{indice} · parte fora de ordem → 400", op: "PUT /marketing/midias/{id}/partes/{indice}", url: "/marketing/midias/{{idMidia}}/partes/1", ...s, status: [400, 404],
      se: "nord.variavel('idMidia')", motivo: "sem vídeo iniciado", arquivo: arquivo("video-parte.bin") }),
    req({ nome: "PUT /marketing/midias/{id}/partes/{indice} · envia a parte 0", op: "PUT /marketing/midias/{id}/partes/{indice}", url: "/marketing/midias/{{idMidia}}/partes/0", ...s,
      se: "nord.variavel('idMidia')", motivo: "sem vídeo iniciado", arquivo: arquivo("video-parte.bin") }),
    req({ nome: "PUT /marketing/midias/{id}/partes/{indice} · vídeo de outra pessoa ou inexistente → 404", op: "PUT /marketing/midias/{id}/partes/{indice}", url: "/marketing/midias/nao-existe/partes/0", ...s, status: 404, arquivo: arquivo("video-parte.bin") }),
    req({ nome: "POST /marketing/publicacoes · sem título → 400", op: "POST /marketing/publicacoes", ...s, status: 400, erro: "ENTRADA_INVALIDA", corpo: { idMidia: "{{idMidia}}", txTitulo: "", idsContas: [] } }),
    req({ nome: "POST /marketing/publicacoes · vídeo inexistente → 404", op: "POST /marketing/publicacoes", ...s, status: 404, corpo: { idMidia: "nao-existe", txTitulo: "[newman]", idsContas: [999999999] } }),
    req({ nome: "GET /publico/marketing/midia/{codigo} · link público inválido → 404", op: "GET /publico/marketing/midia/{codigo}", url: "/publico/marketing/midia/nao-existe", auth: "nenhum", ...s, status: 404, texto: true, envelope: false }),
    req({ nome: "GET /marketing/redes · usuário sem MARKETING → 403", op: "GET /marketing/redes", auth: "usuario", ...s, status: 403, erro: "ACESSO_NEGADO" }),
  ]),

  pasta("Drumcam", "", [
    req({ nome: "POST /drumcam/bilhete · bilhete para câmera", op: "POST /drumcam/bilhete", ...s, corpo: { papel: "camera", nome: "[newman] câmera" },
      regras: [["bilhete de uso único", "pm.expect(b.papel).to.eql('camera'); pm.expect(b.bilhete).to.be.a('string').and.not.empty;"]] }),
    req({ nome: "POST /drumcam/bilhete · bilhete para controle", op: "POST /drumcam/bilhete", ...s, corpo: { papel: "controle" } }),
    req({ nome: "POST /drumcam/bilhete · papel inválido → 400", op: "POST /drumcam/bilhete", ...s, status: 400, erro: "ENTRADA_INVALIDA", corpo: { papel: "microfone" } }),
  ]),

  pasta("Cache", "", [
    req({ nome: "PUT /cache/{cacheName} · cache inexistente → 404", op: "PUT /cache/{cacheName}", url: "/cache/nao-existe-newman", ...s, status: 404 }),
    req({ nome: "PUT /cache/{cacheName} · usuário comum → 403", op: "PUT /cache/{cacheName}", url: "/cache/nao-existe-newman", auth: "usuario", ...s, status: 403 }),
    req({ nome: "PUT /cache/limparTodos · limpa todos", op: "PUT /cache/limparTodos", ...s }),
    req({ nome: "PUT /cache/limparTodos · usuário comum → 403", op: "PUT /cache/limparTodos", auth: "usuario", ...s, status: 403 }),
  ]),
]);
