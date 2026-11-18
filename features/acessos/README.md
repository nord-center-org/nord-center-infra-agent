# Acessos

| | |
|---|---|
| Slug | `acessos` |
| Status | ativa |
| Versão atual | [v2](v2.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Configurações > Acessos e Configurações > Equipe e cargos (administradores) |

## O que faz

Define o que cada pessoa pode ver e fazer no NordTool, por módulo e nível (Sem acesso, Ver, Editar, Admin). O nível vem do perfil, do cargo e das exceções da pessoa. O backend confere cada ação; o frontend esconde do menu, do Início e da rota o que a pessoa não pode abrir.

## Regras de negócio vigentes

- **RN-01** A permissão efetiva sai, da mais específica para a menos: pessoa+módulo, perfil/cargo+módulo, pessoa+`*`, perfil+`*`. Sem linha = Sem acesso. _(v1)_
- **RN-02** Subacessos (os do Cronograma) herdam o módulo, só valem a partir do nível mínimo dele e podem ser bloqueados. _(v1)_
- **RN-03** Precisa ficar ao menos um administrador ativo; ninguém tira o próprio acesso de administrador. Mudar perfil, cargo ou acessos vale no próximo login da pessoa. _(v1)_
- **RN-04** Toda tela do menu que mostra dados ou ferramentas depende de um módulo. Ficam abertas a qualquer pessoa logada só: Início, SAC (abrir os próprios chamados), Configurações e a própria conta. _(v2)_
- **RN-05** Bloco de notas, Cubicagem, Treinos e Repertório: Ver pede LEITURA; criar, alterar e excluir pedem ESCRITA. _(v2)_
- **RN-06** "Telas em construção" e "Manter conectado no app" são liga/desliga (Sem acesso ou Liberado). _(v2)_
- **RN-07** Sem "Manter conectado no app", o app Android não registra o aparelho. Se o acesso for tirado, na próxima renovação o aparelho é desconectado e o app pede a senha. _(v2)_
- **RN-08** Ao entrar um módulo novo, os perfis recebem o nível que já valia na prática, para nada mudar no dia; o administrador ajusta depois. _(v2)_

## Onde está no código

- **Backend:**
  - `security/Modulo`, `PermissaoCalculator`, `AutorizacaoService`;
  - `AcessoServiceImpl` (tela de Acessos);
  - cada `*ServiceImpl` chama `autorizacao.exigir(Modulo, Acao)`.
- **Frontend:**
  - `utils/sessao.ts` (`MODULO_POR_ROTA`, `podeAbrirRota`);
  - `utils/acessos.ts` (nomes, liga/desliga);
  - `components/administracao/AcessosModal.tsx` e `EquipeModal.tsx`.
- **SQL:** `perfil_permissao`, `cargo_permissao`, `usuario_permissao`; `DML/09.acessos_telas_sem_controle_dml.sql`.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | (retroativo) | Acessos por módulo e nível, perfil, cargo, exceções e subacessos do Cronograma | — | — |
| [v2](v2.md) | 2026-11-18 | Telas sem controle ganham acesso; "Manter conectado no app" | `feature-acessos-v2` | [sql#80](https://github.com/nord-center-org/nord-tool-scripts-sql/pull/80), [backend#131](https://github.com/nord-center-org/nord-tool-backend/pull/131), [frontend#210](https://github.com/nord-center-org/nord-tool-frontend/pull/210), [infra#81](https://github.com/nord-center-org/nord-center-infra-agent/pull/81) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Muda o acesso de [Bloco de notas](../bloco-notas/README.md), [Cubicagem](../cubicagem/README.md), [Repertório](../repertorio/README.md) (a "aba aberta para todos" da v16 passa a depender do acesso REPERTORIO, liberado no perfil padrão) e do [App Android](../app-android/README.md) (sessão que não cai).
