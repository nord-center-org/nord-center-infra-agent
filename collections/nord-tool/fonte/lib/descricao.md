Collection única da API do NordTool: todas as rotas do OpenAPI, divididas por domínio, com os contratos, as regras de negócio e o que o front espera de cada resposta.

**Gerada** por `collections/nord-tool/fonte/gerar.mjs` (não edite este JSON à mão). Leia `collections/nord-tool/README.md`.

## Como rodar

```powershell
$env:NORD_API_EMAIL = "<e-mail do usuário ADMIN de teste>"
$env:NORD_API_SENHA = "<senha dele>"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/api/newman-run.ps1 -Collection collections/nord-tool/nord-tool.postman_collection.json
```

Ou `NORD_API_TOKEN` com um JWT válido. Só rode em ambiente local ou de teste: a collection cria e apaga registros.

## O que cada requisição confere

- status esperado (o real do controller: 201 na criação, 204 na exclusão);
- envelope `ApiResponseBody` (`nrStatus` igual ao HTTP, `timestamp`, `txMensagem`);
- sucesso: resposta válida contra o schema do OpenAPI e com os campos que o front lê (tipos e valores de enum);
- erro: `cdErro` esperado, `idCorrelacao`, sem `body` e sem detalhe técnico (stack trace, SQL);
- tempo de resposta abaixo de `tempoMaximoMs` (10000 por padrão; os meses de 2099 do Financeiro têm 40000);
- as regras de negócio de cada caso (testes com o prefixo "regra:").

## Dados de teste

Tudo que é criado leva `[newman]` no nome. Dados de obra ficam na obra `NEWMAN-QA` / fase `NWQA`. O usuário comum de teste (`newman.usuario@nordtool.test`) tem acesso limitado e serve para os 403. Cadastros sem exclusão no sistema (responsável da caixinha, pessoa e categorias do financeiro, modelos de relatório) são fixos e reaproveitados.
