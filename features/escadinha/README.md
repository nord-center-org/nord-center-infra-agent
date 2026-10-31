# Escadinha

| | |
|---|---|
| Slug | `escadinha` |
| Status | ativa |
| Versão atual | [v1](v1.md) (retroativa) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Escadinha (`/organizacional/escadinha`) |

## O que faz

Acompanha o avanço da obra por torre, pavimento, lado (A ou B) e atividade, no padrão de escadinha usado pela Cury. A partir do pacote de projetos (ZIP do Construcode ou PDFs), a tela monta a torre em 3D, com pavimentos, apartamentos, cômodos e lados. A equipe marca o que foi executado em cada célula, e a tela calcula atrasos e metas a partir do início da obra e dos ciclos. Há duas vistas: o prédio em 3D, com a planta 2D de cada pavimento e de cada apartamento, e a grade "A Escadinha" de cada ciclo.

## Regras de negócio vigentes

Todas registradas a partir do código de 2026-10-30; o porquê das decisões antigas não foi registrado.

- **RN-01** A escadinha é da obra inteira, não de uma fase. Toda operação usa a obra escolhida no topo da tela (`X-Obra`); sem obra escolhida, o servidor responde "Escolha a obra no topo da tela", e quem não participa de nenhuma fase da obra é recusado (exceto o admin geral). _(v1)_
- **RN-02** Cada obra tem no máximo 30 torres. A torre guarda o nome (até 80 caracteres), a ordem, a configuração (croqui, pavimentos, apartamentos e lados), os ciclos e, se houver, a imagem da prancha. A configuração e os ciclos são JSON de até 400.000 caracteres; a prancha é uma imagem JPEG, PNG ou WEBP em data URL de até 2.500.000 caracteres. _(v1)_
- **RN-03** Salvar uma torre exige a versão dela (`nrVersao`). Se outra pessoa salvou antes, o servidor responde 409, e a tela avisa que as últimas mudanças não foram salvas e pede para recarregar. A tela salva sozinha menos de um segundo depois da última edição e mostra "Salvo para todos". _(v1)_
- **RN-04** Sem nenhuma torre na obra, a tela mostra uma torre de exemplo, que só é criada no servidor na primeira edição. _(v1)_
- **RN-05** Cada célula (pavimento × lado × atividade) pode ser marcada à mão: `E` executado, `X` em execução, `N` não se aplica ou um dos status da legenda (`A`, `O`, `P`, `D`, `V`); a marcação vazia limpa a célula e devolve o status ao cálculo automático. A marcação guarda a data da execução (hoje, se não for informada; nunca no futuro nem antes de 2000), quem marcou e quando. _(v1)_
- **RN-06** As células são gravadas à parte da torre, sem controle de versão, até 500 por envio; a tela envia em lotes de 400. _(v1)_
- **RN-07** Sem marcação manual, o status da célula é calculado pelas datas: atrasado, atrasada em execução, atraso com a anterior pendente, dentro do período do ciclo, meta do ciclo ou vazio. O cálculo depende do início da obra (definido no painel do 3D), da ordem das atividades e dos dias e da meta de pavimentos de cada ciclo; sem início da obra, não há atraso nem meta. _(v1)_
- **RN-08** O modelo de ciclos e atividades vale para a obra inteira e só o ADMIN do módulo o altera. Cada ciclo tem nome, cor, dias e meta de pavimentos; cada atividade tem nome, marcação de instalações, a camada que acende no 3D e a ordem. Os ids das atividades são mantidos, então o que já foi marcado continua valendo. _(v1)_
- **RN-09** Cada torre tem até 40 tipologias de apartamento, com nome único na torre (até 60 caracteres) e uma imagem opcional da planta, que a tela reduz para no máximo 1800 px em JPEG. _(v1)_
- **RN-10** A importação de projetos roda no navegador. Ela usa só a revisão mais nova de cada prancha, desenha só as plantas de fôrma, 1ª fiada e graute e monta paredes, cômodos, apartamentos, pavimentos e lados conforme o skill [`escadinha-projetos`](../../skills/nord-tool-frontend/escadinha-projetos/SKILL.md). _(v1)_
- **RN-11** O lado A é sempre o que tem a junta de dilatação. Sem junta na prancha, a divisão sai do formato da torre, e a pessoa pode inverter os lados ou desenhar a divisão à mão. _(v1)_
- **RN-12** Excluir uma torre pede confirmação e apaga junto as células e as tipologias dela. _(v1)_
- **RN-13** Ver exige `ESCADINHA` LEITURA. Criar, editar, excluir e importar torres, marcar células e manter tipologias exigem ESCRITA; editar ciclos e atividades exige ADMIN. Sem ESCRITA, a tela esconde importar, renomear e excluir e não envia nenhuma alteração. _(v1)_

## Onde está no código

- **SQL:** `escadinha_torre` e `escadinha_modelo` (DDL 57); a coluna `tx_grade` e a tabela `escadinha_tipologia` (DDL 60).
- **Backend:** `/api/v1/nord-tool/escadinha` (`EscadinhaRead/WriteController`, `EscadinhaServiceImpl`), consultas em `query/escadinha.properties`, módulo `ESCADINHA` em `security/Modulo.java` e obra validada por `ContextoFaseServiceImpl.obraEscolhida()`.
- **Frontend:** `pages/Escadinha.tsx` (carregada à parte, com `lazy`), `components/escadinha/*`, `services/EscadinhaService.ts`, regras puras em `utils/escadinha*.ts`, medição na planta em `utils/medicao.ts` (não confundir com a feature [medicoes](../medicoes/README.md)), e leitura de projeto em `utils/projetoPacote.ts`, `utils/projetoVetorial.ts`, `utils/projetoPdfVetor.ts` e `utils/zip.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-10-30 | Registro retroativo do que já existia no código | `docs-inventario-features` | [infra#19](https://github.com/nord-center-org/nord-center-infra-agent/pull/19) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

- Depende das obras e das fases da administração (`obra`, `ContextoFaseService`), ainda sem pasta.
- O skill [`skills/nord-tool-frontend/escadinha-projetos`](../../skills/nord-tool-frontend/escadinha-projetos/SKILL.md) descreve o método de leitura de projetos e deve ser atualizado junto com qualquer versão que mude a importação.
