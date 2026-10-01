# SQL: arquitetura

Este repositório contém scripts PostgreSQL que definem e atualizam o schema e os dados consumidos pelo `nord-tool-backend`.

## Legenda dos padrões

- **Padrão vigente:** regra que deve ser seguida em novas alterações.
- **Legado a preservar:** estrutura ou comportamento existente que permanece por compatibilidade, mesmo que não siga o padrão vigente. Não renomeie em uma alteração sem relação com isso.
- **Evolução recomendada:** melhoria futura que ainda não é uma regra obrigatória.

## Responsabilidade de DDL e DML

### DDL — Data Definition Language

**Padrão vigente**

- DDL define ou altera a estrutura do banco, como schemas, tabelas, colunas e índices.
- Se a tabela já existe no schema do projeto, mantenha no DDL de origem dela as alterações estruturais incrementais, inclusive a adição de colunas. Não crie um novo arquivo SQL apenas para executar `ALTER TABLE` nem crie outra tabela para acomodar uma alteração.
- Crie um novo arquivo DDL numerado somente quando a funcionalidade introduzir uma tabela realmente nova. Nomeie o arquivo com base na tabela/funcionalidade e inclua a criação protegida da tabela. A numeração deve seguir a sequência crescente existente.
- Proteja operações de criação e alteração para os dois estados possíveis do objeto: ainda não existe ou já existe. Use cláusulas compatíveis, como `IF NOT EXISTS` e `IF EXISTS`; quando o comando não oferecer essas cláusulas, faça uma verificação explícita do estado. A verificação deve tornar a operação segura para reexecução.
- Mantenha a definição do `CREATE TABLE` alinhada ao schema desejado. Quando o nome, tipo, tamanho ou nulabilidade de uma coluna mudar, atualize a definição de origem e acrescente a operação incremental necessária para atualizar bancos existentes.
- Numere novos arquivos de script e novas tabelas em ordem crescente, seguindo a sequência existente no projeto. Preserve a numeração e a ordem dos objetos existentes; não os renumere em alterações sem relação com isso.

Por exemplo, ao adicionar uma coluna, uma instalação nova recebe a coluna pelo `CREATE TABLE`, enquanto uma base existente recebe a coluna pelo `ALTER TABLE` protegido no mesmo arquivo de origem. Uma renomeação ou conversão de tipo também precisa considerar o estado da base existente; nem toda forma de `ALTER TABLE` oferece uma cláusula `IF EXISTS`.

### DML — Data Manipulation Language

**Padrão vigente**

- DML insere e altera registros. Mantenha a manipulação de dados nos scripts e convenções DML existentes no repositório.
- Torne inserções repetíveis seguras com `ON CONFLICT` e a chave ou constraint `UNIQUE` apropriada quando a operação puder encontrar o mesmo registro novamente.
- `ON CONFLICT` protege operações sobre dados; use verificações adequadas ao estado do schema nas operações DDL.

## Organização e execução dos scripts

**Padrão vigente**

- Separe DDL e DML conforme as convenções existentes nos diretórios `DDL/` e `DML/`.
- `filelist.txt` é a entrada ordenada de uma execução. Liste somente os caminhos SQL que precisam rodar para aquela alteração, um caminho por linha; não inclua todos os arquivos DDL e DML por padrão.
- Liste os scripts na ordem de suas dependências. O `executa-sql.sh` executa todos os caminhos de `filelist.txt`; o runner não controla quais scripts já foram aplicados. Ele interrompe a execução no primeiro erro SQL.
- Garanta que os scripts selecionados sejam seguros para os estados de banco em que podem rodar. O runner cria o schema `nord_tool` se ele ainda não existir e, em seguida, executa os scripts listados na ordem.
- Antes da execução, confira o runner, a lista de arquivos, as dependências entre objetos e o banco alvo.

O runner atual lê o `filelist.txt` linha a linha e chama o `psql` com `ON_ERROR_STOP`. Portanto, incluir um caminho significa que aquele arquivo será executado nessa rodada; a lista não é um inventário completo de todos os scripts do repositório.

## Integridade do banco e regras da aplicação

**Padrão vigente**

- Toda tabela deve ter uma `PRIMARY KEY`.
- Use `FOREIGN KEY` para integridade referencial.
- Use constraints `UNIQUE` quando a unicidade precisar ser garantida pelo banco, com nome descritivo conforme a convenção numérica do projeto, por exemplo `UK01_apartamento_vistoria`.
- Não use constraints `CHECK`. Valide estados e regras de negócio no backend, inclusive com enums e mecanismos de validação apropriados.
- Prefira `NOT NULL`; permita `NULL` quando a ausência do valor tiver significado.

## Nomenclatura de novos objetos do schema

**Padrão vigente para novas tabelas e colunas**

- Use nomes em minúsculas, no formato `snake_case`, específicos ao conceito de negócio e à tabela relacionada. Por exemplo, prefira `in_cronograma_fixo` a um nome genérico como `fl_fixo`.
- Em nomes de novas tabelas compostos por várias palavras, separe os termos com `_` e não inclua preposições como `de`, `do` ou `da`. Por exemplo, use `requisicao_controle`, não `requisicao_de_controle`.
- Use estes prefixos em novas colunas:

| Prefixo | Significado | Exemplo |
| --- | --- | --- |
| `cd` | Código ou identificador de negócio | `cd_status_apartamento` |
| `nm` | Nome | `nm_apartamento` |
| `vl` | Valor | `vl_premio` |
| `dt` | Data | `dt_apartamento_vigente` |
| `qt` | Quantidade | `qt_usuarios` |
| `in` | Indicador booleano | `in_cronograma_fixo` |
| `nr` | Número | `nr_apolice` |
| `ds` | Descrição | `ds_apartamento` |
| `tx` | Texto livre | `tx_observacao_revistoria` |
| `id` | Identificador de linha ou relacionamento | `id_apartamento` |
| `pc` | Porcentagem | `pc_faixa` |

**Legado a preservar:** tabelas e colunas existentes que não seguem essas regras permanecem como estão por enquanto. A convenção de nomenclatura se aplica a novos objetos do schema; renomear objetos legados está fora deste escopo.

## Desenho do schema e índices

**Padrão vigente**

- Use `DECIMAL(15,2)` para valores financeiros; não use `FLOAT` para valores monetários.
- Crie índices para apoiar filtros definidos pela funcionalidade em implementação. Indexe os identificadores usados nesses filtros; use índice composto quando a consulta combinar filtros ou ordenação por múltiplas colunas.
- Defina as colunas e sua ordem no índice composto com base nos predicados e na ordenação da consulta real. Nomeie índices conforme a convenção numérica do projeto, por exemplo `IDX01_apartamento_vistoria`.

## Compatibilidade com consumidores

**Padrão vigente**

- Trate a definição de origem do DDL como o schema esperado em uma base nova, e as instruções incrementais no mesmo arquivo como caminho de atualização para uma base existente.
- Quando uma mudança de schema alterar nome, tipo, tamanho ou nulabilidade de uma coluna, atualize tanto a definição do `CREATE TABLE` quanto o DDL incremental. Considere conversão ou preenchimento de dados antes de aplicar um tipo mais restritivo ou `NOT NULL`.
- Atualize os consumidores das colunas alteradas, incluindo queries e mapeamentos de persistência do backend, em coordenação com a mudança do schema.
- Inclua no `filelist.txt` os caminhos relevantes à execução que aplica a mudança, na ordem das dependências.

## Fluxo de alteração

Para uma mudança de schema ou de dados:

1. Identifique tabelas, registros, dependências e consumidores da aplicação afetados.
2. Coloque alterações estruturais no DDL de origem da tabela afetada; coloque alterações de registros no DML apropriado.
3. Mantenha o `CREATE TABLE` alinhado quando mudar nome, tipo, tamanho ou nulabilidade de uma coluna e acrescente a operação incremental protegida para bases existentes.
4. Revise as constraints primárias, estrangeiras e únicas; regras de negócio pertencem ao backend, não a constraints `CHECK`.
5. Inclua no `filelist.txt` somente os caminhos necessários para essa execução, na ordem de dependência.
6. Atualize os consumidores do backend quando o contrato dos dados mudar.
7. Revise reexecução segura, dados existentes, índices e compatibilidade antes de rodar os scripts.

## Exemplos no repositório

- `DDL/05.cronograma_semanal_ddl.sql` exemplifica um DDL de origem específico para uma tabela.
- `filelist.txt` mostra a lista ordenada de caminhos SQL para uma execução.
- `executa-sql.sh` cria o schema `nord_tool` se necessário e executa cada caminho listado na ordem.

Esses exemplos descrevem a organização atual do repositório. Confira os arquivos e o runner antes de cada alteração, pois a implementação pode evoluir.
