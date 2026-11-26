# SPEC-14 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** os itens 1 e 2 da base comum entram no MVP (item 10). A documentação das funcionalidades foi para a SPEC-24, que entra no MVP (item 3). OpenAPI e payloads por módulo vêm na evolução, começando pelos módulos vendidos.

**Origem:** L-2 (doc técnica de todas as funcionalidades e endpoints), L-4 (collections por funcionalidade no backend), L-16 (devolver só os dados que o front usa), L-26 (padrão de erros, sem estourar 500 na tela; logs e tracking estão na SPEC-06) e L-65 (reformular os READMEs). Antes eram duas specs, a 14 e a 16. Foram unidas porque uma dependia da outra: o inventário de endpoints é a base da revisão dos payloads. Depois, a documentação das funcionalidades (fichas, contexto por repositório, collections, READMEs e mapa) saiu daqui e foi para a SPEC-24, na infra, que entra antes no MVP. Esta spec ficou só com os contratos e usa as fichas da SPEC-24 como ponto de partida.

**O que é:** uma passada por funcionalidade que deixa cada módulo documentado, enxuto e com erros previsíveis. Para cada módulo, a mesma sequência:

1. documentar os endpoints;
2. revisar o que eles devolvem;
3. padronizar os erros;
4. atualizar a collection na pasta da funcionalidade (SPEC-24);
5. atualizar a ficha e o contexto do backend da funcionalidade (SPEC-24).

Antes disso entra a base comum (formato de erro e publicação do OpenAPI); no fim, os READMEs e o mapa do sistema. Tudo serve também de contexto para os agentes de IA.

**Situação atual:**

- **Erros:** o `GlobalExceptionHandler` define o contrato, o Spring não expõe stack trace, e o erro traz `cdErro` e o `idCorrelacao` do log. No front, o `apiClient` gera `ApiError` (`status`, `cdErro`), e o 500 mostra o código de correlação. O formato é próprio e não há catálogo dos `cdErro`.
- **Payloads:** não há medição de quais campos o front usa. Com 98 DTOs, 67 controllers e entidades em `domain`, falta conferir se alguma rota devolve entidade direto (o requisito diz DTO obrigatório) e se as listagens têm paginação.
- **Swagger:** o springdoc existe só no profile local, sem descrição por endpoint. Não há collections versionadas.
- **READMEs:** o do backend é detalhado, mas mistura variáveis, deploy, regras do Financeiro, permissões e Lugia. O do front é curto. Nenhum explica os padrões de nomenclatura de forma organizada.
- **Fichas:** o registro `features/<slug>/` existe na infra, mas está vazio, e cerca de 30 telas aparecem como "ainda sem registro".

**O que fazer — base comum (uma vez):**

1. **Formato único de erro (RFC 9457, Problem Details)**, nativo no Spring 6+. Campos padrão (`type`, `title`, `status`, `detail`) mais `cdErro`, `idCorrelacao` e a lista de `campos` com erro de validação. Todo erro previsível (validação, conflito de versão, permissão, não encontrado, limite) tem seu 4xx; o 500 fica só para o inesperado, com métrica e alerta (SPEC-06).
2. **No front:**
   - um *error boundary* do React com tela padrão de erro;
   - mensagem amigável por `cdErro`, mais "tentar de novo" e o código de correlação;
   - nenhuma mensagem técnica crua na tela.
3. **OpenAPI publicado:** o CI exporta `openapi.json` a cada merge e publica uma página (Redoc ou Scalar) no ambiente `develop`, protegida por login. O openapi-diff compara com o de `develop` e falha o PR em quebra de contrato, que só passa com `/api/v2` ou aviso explícito.
4. **Convenções de lista:** paginação com `page` e `size` (máximo fixo no servidor), ordenação só por enum (SPEC-04 achado 13) e gzip ligado (`server.compression`).

**O que fazer — por funcionalidade** (repetir para cada módulo, um PR por módulo dentro do limite da SPEC-01):

- [ ] Anotar os controllers: resumo, o que faz e para que serve, permissão exigida (`módulo:nível`), exemplos e erros possíveis, agrupados por `@Tag`.
- [ ] Comparar os campos devolvidos com os usados no front (busca nos `services` e componentes).
- [ ] Criar DTO de resumo para listagem e de detalhe para edição, e remover campos internos (hashes, flags técnicas, versões não usadas, dados de outros módulos). Nenhuma entidade de `domain` sai num controller.
- [ ] Paginar as listagens do módulo.
- [ ] Trocar as exceções do módulo para o formato único e registrar os `cdErro` no catálogo.
- [ ] Atualizar a ficha, o contexto do backend e a collection da funcionalidade na pasta dela, na infra (SPEC-24), partindo do que a SPEC-24 já documentou.

Ordem sugerida dos módulos: primeiro os mais usados ou com mais dados (Financeiro, Vistoria e entrega, Cronograma), depois os demais.

**O que fazer — fechamento:**

1. **Manutenção:** o checklist de PR (SPEC-01) passa a exigir o OpenAPI atualizado quando um endpoint muda. Ficha, contexto e collection são cobrados pela SPEC-24.

**Critérios de aceite:**

- [ ] Todo endpoint tem descrição, permissão, exemplo e erros no OpenAPI publicado; quebra de contrato falha o PR.
- [ ] Nenhuma rota devolve entidade de domínio, e toda listagem é paginada com limite. O tamanho médio das respostas das listagens principais caiu, medido antes e depois.
- [ ] Forçando um erro inesperado, a tela mostra a mensagem padrão com o código de correlação, e o mesmo código está no log.
- [ ] O catálogo de `cdErro` está publicado, e cada módulo revisado teve a pasta da SPEC-24 atualizada.

**Depende de:** SPEC-03 (`ProblemDetail` nativo no Spring novo). Parte das fichas e do contexto da SPEC-24 para cada módulo.

**Prazo estimado:** 9 a 13 dias úteis (72 a 104 horas), sem a documentação, que foi para a SPEC-24. A base comum (itens 1 e 2), de 3 a 4 dias, já entra no MVP.
