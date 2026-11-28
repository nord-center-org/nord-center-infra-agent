# Collection da API do NordTool

Uma collection só, com **todas as rotas do backend** divididas por domínio, para rodar com o Newman (ou importar no Postman/Insomnia). Cada requisição confere o contrato do OpenAPI, as regras de negócio e o que o front espera da resposta.

| Arquivo | O que é |
|---|---|
| [`nord-tool.postman_collection.json`](nord-tool.postman_collection.json) | A collection (Postman v2.1). **Gerada: não edite à mão.** |
| [`cobertura.md`](cobertura.md) | Rota × requisições × status × uso no front × regras. Gerado. |
| `contrato/openapi.json` | O que o backend declara (`/v3/api-docs` do backend local). |
| `contrato/status.json` | O status de sucesso que cada controller devolve de verdade (201, 204…). |
| `contrato/front.json` | Para cada chamada dos `services` do front: método, rota, operação do backend e campos lidos. |
| `fonte/dominios/*.mjs` | As requisições e regras de cada domínio (é aqui que se escreve). |
| `fonte/lib/` | A biblioteca que roda dentro do Newman (`nord.js`), o script da collection e a DSL. |
| `arquivos/` | Arquivos pequenos usados nos uploads (PNG, JPEG, PDF, WAV, xlsx, texto). |

## Rodar

Só em ambiente local ou de teste: a collection cria, altera e apaga registros.

1. Backend no ar (local: `http://localhost:8081`).
2. Um usuário **ADMIN de teste** nas variáveis de ambiente (as de usuário do Windows servem, sem reabrir o terminal):

   ```powershell
   [Environment]::SetEnvironmentVariable("NORD_API_EMAIL", "<e-mail do admin local>", "User")
   [Environment]::SetEnvironmentVariable("NORD_API_SENHA", (Read-Host "Senha"), "User")
   ```

   Ou `NORD_API_TOKEN` com um JWT válido (expira pela inatividade).
3. Na raiz da infra:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 -Collection collections/nord-tool/nord-tool.postman_collection.json
   ```

   - Uma pasta só: `-Folder "11 Financeiro"`.
   - Relatórios JUnit e JSON (senhas, tokens e chaves mascarados): `-ReportDir target/newman`.
   - Fechar e reabrir mês do Financeiro: `-Var financeiroCompleto=1`.
   - Outro ambiente de teste: `-BaseUrl https://<backend-develop>`.

Entre duas execuções completas, espere 1 minuto: o login e o cadastro têm limite de tentativas por minuto.

O run completo leva uns 16 minutos e o JWT de acesso vale 15. A 3 minutos de vencer, o script da collection troca o token (do admin e do usuário de teste) pelo de `/auth/refresh`, dentro da mesma sessão (até `NORD_SESSION_MAX_HOURS`).

## O que cada requisição confere

Toda requisição chama `nord.verificar(...)`, que testa:

- o **status** esperado (por padrão, o que o controller devolve de verdade, de `contrato/status.json`);
- o **envelope** `ApiResponseBody`: `nrStatus` igual ao HTTP, `timestamp` e `txMensagem`;
- no sucesso, a resposta **contra o schema do OpenAPI** e os **campos que o front lê** (tipo e valores de enum), mais os campos que o front lê e o OpenAPI nem declara;
- no erro, o `cdErro` esperado, o `idCorrelacao`, sem `body` e **sem detalhe técnico** (stack trace, classe, SQL);
- downloads: `Content-Type`, `Cache-Control`, `ETag` e o `304` com `If-None-Match`;
- o tempo de resposta (`tempoMaximoMs`, padrão 10000; os meses de 2099 do Financeiro têm 40000, porque a projeção encadeia os meses até lá).

As regras de negócio de cada caso aparecem como testes `regra: …` (versão com `nrVersao` e 409, idempotência por `cdRequisicao`, limites, permissões, escopo de obra/fase, compartilhamento só para ver…). A lista de cada pasta está na descrição dela.

## Dados de teste

- Tudo que é criado leva `[newman]` no nome e é apagado no fim da pasta.
- Dados de obra ficam na obra **`NEWMAN-QA`** e na fase **`NWQA`**, criadas na primeira execução (obra não tem exclusão).
- **Usuário comum de teste** (`newman.usuario@nordtool.test`): cadastrado na primeira vez; a cada run o admin reseta a senha e a collection cria uma nova, que só existe durante o run. Tem acesso limitado (os 403 dependem disso) e fica desativado no fim.
- Cadastros sem exclusão no sistema são fixos e reaproveitados: responsável da caixinha, pessoa, categorias, recorrência e fundo do Financeiro, modelo de relatório fotográfico.
- Financeiro: lançamentos em 2099, apagados no fim; configuração lida e regravada igual.
- Configurações do admin (preferências de notificação, favoritos, casamento) são lidas e regravadas iguais; as mudanças de verdade são no usuário de teste.
- Não roda: chamadas que gastam IA (chat da Lugia, interpretar do cronograma) e publicação em rede social. Delas só a validação é testada.

## Mudou um endpoint?

```powershell
node collections/nord-tool/fonte/contratos.mjs   # backend local no ar; front lido de origin/develop
node collections/nord-tool/fonte/gerar.mjs
```

- O `contratos.mjs` baixa o OpenAPI, lê os status dos controllers (`--backend-src ../nord-tool-backend`) e analisa os `services` do front com o TypeScript dele (`--front ../nord-tool-frontend --ref origin/develop`).
- O `gerar.mjs` **falha** se alguma rota do OpenAPI ficar sem requisição, se uma requisição citar rota que não existe ou se faltar arquivo de teste. `--verificar` só confere se a collection gravada está atualizada.
- Para cobrir uma rota nova, acrescente um `req({...})` no domínio dela em `fonte/dominios/` (a DSL está documentada em `fonte/lib/dsl.mjs`).
