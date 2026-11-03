# Escadinha

| | |
|---|---|
| Slug | `escadinha` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Organizacional > Escadinha (`/organizacional/escadinha`) |

## O que faz

Acompanha a obra pavimento a pavimento no padrão da escadinha da Cury: cada célula pavimento × lado × atividade recebe um status, e o NordTool calcula atrasos, meta do período e gargalos. A torre é montada a partir dos projetos em PDF (1ª fiada, fôrma, corte): contorno, pavimentos, paredes reais, cômodos, portas, janelas, sacadas, escada e elevadores. O 3D da torre, do pavimento e do apartamento mostra o que já foi feito, com uma peça por atividade, e dá para navegar livremente como no SketchUp.

## Regras de negócio vigentes

- **RN-01** Cada célula (pavimento, lado A/B, atividade) tem um status: executado, em execução, não se aplica ou um status forçado à mão; o resto é calculado (dependência da anterior, atraso pelo plano, meta do período). _(v1)_
- **RN-02** O modelo padrão é a escadinha da Cury: 13 ciclos e 96 atividades; o admin pode editar o modelo da obra. _(v1)_
- **RN-03** A torre sai do pacote de projetos: só a revisão mais nova de cada prancha vale; o modelo é a 1ª fiada do pavimento tipo (ou a da torre gêmea); os pavimentos vêm do corte esquemático; a junta de dilatação divide os lados. _(v1)_
- **RN-04** Os rótulos de vão da 1ª fiada dizem o que é cada cômodo e vão: porta de 71 = banheiro, 81 = dormitório, 91 = entrada, porta larga (≈116) do hall = corta-fogo e, atrás dela, a escada; janela e porta-sacada ficam na fachada, na frente do rótulo; a nota "alvenarias de fechamento… após a instalação do equipamento" marca o poço do elevador. _(v2)_
- **RN-05** Cada atividade da escadinha acrescenta a sua peça ao 3D (71 peças diferentes no modelo Cury); atividade sem peça construída (testes, conferências, limpezas, proteções, regulagens) vira um ícone no chão do apartamento. Em execução, a peça aparece meio transparente (a alvenaria, a meia altura). _(v2, alterada: antes cada atividade acendia uma de 23 "camadas" genéricas)_
- **RN-06** A alvenaria sobe só as paredes de bloco, com as janelas recortadas (peitoril e verga) e as vergas das portas; a frente do poço do elevador e as muretas dos shafts ficam com "Muretas… / alvenaria vão do elevador"; o fechamento dos shafts fica com o drywall. _(v2)_
- **RN-07** A sacada fica na frente da porta-sacada, 0,80 m de profundidade e 0,50 m além da porta de cada lado (medidas da fôrma do projeto de referência). _(v2)_
- **RN-08** Toda planta 2D tem 3D: a torre, o pavimento e o apartamento. A navegação é livre: arrastar gira, botão direito ou Shift move, a roda aproxima onde o mouse aponta, duplo clique gira em volta do ponto clicado, W A S D andam e Q/E descem e sobem. _(v2)_

## Onde está no código

- **SQL:** `DDL/57.escadinha_ddl.sql`, `DDL/60.escadinha_grade_tipologia_ddl.sql` (torres com a configuração em JSON, grade, modelo e tipologias).
- **Backend:** `EscadinhaReadController` e `EscadinhaWriteController` (`/api/v1/nord-tool/escadinha`: torres, planta, células, modelo, tipologias), `EscadinhaServiceImpl` (limite de 400 KB por JSON).
- **Frontend:** `pages/Escadinha.tsx`; leitura dos projetos em `utils/projetoPacote.ts`, `utils/projetoPdfVetor.ts`, `utils/projetoVetorial.ts`, `utils/escadinhaComodos.ts` e `utils/escadinhaUsos.ts`; escadinha em `utils/escadinhaCury.ts`; elementos e peças do 3D em `utils/escadinhaElementos.ts` e `utils/escadinhaPecas.ts`; componentes em `components/escadinha/` (`Torre3D`, `Pavimento3D`, `CamadasPavimento`, `PecasPavimento`, `NavegacaoLivre`, `VistaApartamento`, `Planta2D`, `EditorPlanta`, `GradeEscadinha`, `PainelEscadinha`).

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-03 | Registro retroativo da escadinha, da leitura de projetos e do 3D por camadas | — | — |
| [v2](v2.md) | 2026-11-03 | Cômodos e vãos pelos rótulos do projeto, uma peça do 3D por atividade, navegação livre e 3D do apartamento | `feature-escadinha-v2` | a preencher |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa a obra atual do contexto (`contextoObra`) e as permissões de Acessos para editar. A medição de blocos usa a alvenaria executada na escadinha.
