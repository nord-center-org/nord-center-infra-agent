// Roda antes de TODA requisição (script da collection).
eval(pm.collectionVariables.get("nordLib"));

// Identificador do run: entra no nome dos registros criados, para achar e limpar o que é de teste.
if (!nord.variavel("nordRun")) pm.collectionVariables.set("nordRun", "nw" + Date.now().toString(36));

// O JWT de acesso vale 15 min e o run inteiro passa disso: a 3 min de vencer, troca pelo de /auth/refresh
// (a sessão continua a mesma, até o limite de horas do backend). Vale para o admin e para o usuário de teste.
function renovarToken(nome) {
  var token = nord.variavel(nome);
  var partes = (token || "").split(".");
  if (partes.length !== 3) return;
  var exp;
  try {
    var b64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
    while (b64.length % 4) b64 += "=";
    exp = JSON.parse(CryptoJS.enc.Base64.parse(b64).toString(CryptoJS.enc.Utf8)).exp;
  } catch (e) {
    return;
  }
  if (!exp || exp * 1000 - Date.now() > 180000) return;
  pm.sendRequest({
    url: nord.variavel("baseUrl") + "/api/v1/nord-tool/auth/refresh",
    method: "POST",
    header: { Authorization: "Bearer " + token },
  }, function (erro, res) {
    if (erro || res.code !== 200) return;
    var novo = res.json().body.token;
    if (pm.environment.has(nome)) pm.environment.set(nome, novo);
    pm.collectionVariables.set(nome, novo);
  });
}

if (!nord.variavel("nordAbortar")) {
  renovarToken("token");
  renovarToken("tokenUsuario");
}

if (nord.variavel("nordAbortar")) {
  nord.pular("a preparação falhou: " + nord.variavel("nordAbortar"));
} else if (!nord.variavel("token") && nord.variavel("loginEmail") && nord.variavel("loginSenha") && !nord.variavel("nordLoginFeito")) {
  // Sem token pronto: entra com o usuário ADMIN de teste (credenciais só do environment temporário do newman-run).
  pm.collectionVariables.set("nordLoginFeito", "1");
  pm.sendRequest({
    url: nord.variavel("baseUrl") + "/api/v1/nord-tool/auth/login",
    method: "POST",
    header: { "Content-Type": "application/json" },
    body: { mode: "raw", raw: JSON.stringify({ email: nord.variavel("loginEmail"), senha: nord.variavel("loginSenha") }) },
  }, function (erro, res) {
    if (erro || res.code !== 200) {
      pm.collectionVariables.set("nordAbortar", "login do usuário de teste falhou (" + (erro ? erro.message : "HTTP " + res.code) + ")");
      return;
    }
    pm.collectionVariables.set("token", res.json().body.token);
  });
}
