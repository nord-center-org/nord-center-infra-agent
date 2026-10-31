# Medições

| | |
|---|---|
| Slug | `medicoes` |
| Status | ativa |
| Versão atual | [v1](v1.md) (retroativa) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Medições (`/organizacional/medicoes`) |

## O que faz

Registra as medições dos contratos da obra, isto é, os boletins de medição lançados no Sienge, e acompanha o status de cada uma (Pendente, Feita ou outro que for cadastrado). A tela monta o título do boletim e o texto da observação no formato do Sienge, prontos para copiar. Ela também completa os dados de um contrato já usado e confere a conta escrita no memorial.

## Regras de negócio vigentes

Todas registradas a partir do código de 2026-10-30; o porquê das decisões antigas não foi registrado.

- **RN-01** Uma medição tem número (inteiro maior que zero), código do contrato (até 20 caracteres), razão social (até 150), número do contrato (até 40), data, valor (maior que zero, com até 12 dígitos inteiros e 2 decimais), memorial opcional (até 1000) e status. _(v1)_
- **RN-02** O número do contrato com o número da medição não se repete; um duplicado é recusado com "Já existe um registro com esses dados". _(v1)_
- **RN-03** Os status vêm da tabela `medicao_status` (`PENDENTE` e `FEITA` iniciais). Uma medição nova sem status nasce `PENDENTE`, e só um status ativo pode ser atribuído. Um status desativado continua nas medições que já o usam e só aparece como opção nelas. Para criar outro status, basta inserir uma linha na tabela, sem mudar código. _(v1)_
- **RN-04** Editar, trocar o status e excluir exigem a versão da medição (`nrVersao`). Se ela mudou, o servidor responde 409 "A medição mudou. Sincronize e tente novamente.", e a tela avisa e recarrega a lista. Uma linha com salvamento em andamento fica travada. _(v1)_
- **RN-05** Cada medição pertence a uma fase da obra. Quem participa de mais de uma fase escolhe a fase ao criar; quem participa de uma só usa essa. A lista mostra só as medições das fases visíveis, e as antigas sem fase aparecem só para o admin geral sem obra escolhida. _(v1)_
- **RN-06** O título do boletim é "Boletim medição {número} - {código do contrato} - {razão social} - {número do contrato}". A observação é "Obra: Medição de R$X.XXX,XX {memorial}", sem espaço depois de "R$" e com ponto final acrescentado se faltar. Os dois textos têm botão de copiar. _(v1)_
- **RN-07** Numa medição nova, digitar um número de contrato já usado completa o código, a razão social e o próximo número de medição, nos campos que ainda estiverem vazios. _(v1)_
- **RN-08** Se o memorial tem uma conta entre parênteses, como "(73*500=36.500)", a tela calcula a última delas e sinaliza quando o resultado difere do valor escrito depois do "=" ou do valor da medição. _(v1)_
- **RN-09** A lista mostra as mais recentes primeiro (por data e id). A busca procura no título do boletim, no memorial e na data, sem acento e exigindo todas as palavras, e há um filtro por status com a contagem de cada um. O cabeçalho mostra a quantidade e o valor das pendentes. _(v1)_
- **RN-10** Listar exige `MEDICOES` LEITURA; criar, editar, trocar o status e excluir exigem ESCRITA. A tela não esconde os botões, e o servidor recusa quem não tem permissão. _(v1)_

## Onde está no código

- **SQL:** `medicao_status` (DDL 39, status iniciais no DML 06), `medicao` (DDL 40) e a coluna `id_fase` (DDL 45).
- **Backend:** `/api/v1/nord-tool/medicoes` (`MedicaoRead/WriteController`, `MedicaoServiceImpl`), consultas em `query/medicao.properties` e a fase de criação em `ContextoFaseServiceImpl.faseParaCriar`.
- **Frontend:** `pages/Medicoes.tsx`, `components/medicoes/MedicaoModal.tsx` e `BotaoCopiar.tsx`, `services/MedicaoService.ts`, as regras puras em `utils/medicoes.ts` e o salvamento otimista em `hooks/useSincronizacao.ts`. Atenção: `utils/medicao.ts` é a medição de distância e área na planta da [escadinha](../escadinha/README.md), não esta feature.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-10-30 | Registro retroativo do que já existia no código | `docs-inventario-features` | PR_INFRA_LINK |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

- Depende das obras e das fases da administração (`fase`, `ContextoFaseService`), ainda sem pasta.
- Os textos de RN-06 seguem o formato digitado no Sienge; mudar o formato afeta quem copia para lá.
