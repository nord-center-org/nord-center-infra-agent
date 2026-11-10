# Cubicagem

| | |
|---|---|
| Slug | `cubicagem` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Mapeamentos > Cubicagem (`/mapeamentos/cubicagem`) |

## O que faz

Calcula o volume de concreto (m³) das peças de um projeto estrutural em PDF:
- a pessoa escreve o código da peça (V12, P5, L3) e a seção é achada no texto do desenho;
- o comprimento ou a área é medido no próprio desenho, pela escala da folha;
- saem o volume de cada peça, os totais por tipo, os descontos, a perda e a planilha.

## Regras de negócio vigentes

- **RN-01** Qualquer pessoa logada usa a cubicagem (não há permissão em Acessos); cada cubicagem é só de quem a criou. Até 300 cubicagens por pessoa e 2000 peças por cubicagem. _(v1)_
- **RN-02** O PDF do projeto não é enviado ao servidor: fica no aparelho. São salvas as peças, as medidas e a perda; ao reabrir, a pessoa abre o PDF de novo para buscar ou medir. _(v1)_
- **RN-03** Volume de uma peça:
  - retangular: b × h (cm) × comprimento (m);
  - circular: π × (Ø/2)² × comprimento;
  - laje: área (m²) × espessura (cm);
  - ou o volume informado.

  Depois, × quantidade e − descontos (m³), sem ficar negativo. Peça sem alguma medida não entra no total e aparece como "sem medida". _(v1)_
- **RN-04** Totais por tipo na ordem da obra (fundações, pilares, vigas, lajes, outras); a perda (0 a 50%) entra sobre o total líquido. _(v1)_
- **RN-05** A medida no desenho usa a escala lida da folha (ESC. 1:N), a escala digitada ou a calibração por uma cota conhecida; o ímã encaixa o toque nos cantos e pontas das linhas do desenho. _(v1)_
- **RN-06** Salva sozinha cerca de 1 s depois da última mudança, com versão: se mudou em outro aparelho, o salvamento é recusado e a pessoa recarrega. _(v1)_

## Onde está no código

- **SQL:** `DDL/69.cubicagem_ddl.sql` (`cubicagem`).
- **Backend:** `CubicagemReadController` e `CubicagemWriteController` (`/api/v1/nord-tool/cubicagens`), `CubicagemServiceImpl`, `CubicagemRepositoryImpl`, `query/cubicagem.properties`.
- **Frontend:** `pages/Cubicagem.tsx`, `components/cubicagem/` (`EditorCubicagem`, `VistaPdf`, `pdfCubicagem.ts`), `services/CubicagemService.ts`, `utils/cubicagem.ts`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-10 | Volume das peças a partir do PDF do projeto: busca pelo código, medida no desenho com ímã, totais, descontos e perda | `feature-cubicagem` | [sql#72](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/72), [backend#117](https://github.com/nord-center-org/nord-tool-backend/pull/117), [frontend#162](https://github.com/nord-center-org/nord-tool-frontend/pull/162), [infra#33](https://github.com/nord-center-org/nord-center-infra-agent/pull/33) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Usa `pdfjs-dist` (texto, desenho e vértices do PDF) e `xlsx` (planilha), que já estavam no frontend. Não mexe em outras telas.
