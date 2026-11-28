# Cobertura da collection NordTool API

> Gerado por `fonte/gerar.mjs` a partir de `contrato/` e `fonte/dominios/`. Não edite à mão.

- Operações no OpenAPI: **339**, todas com ao menos uma requisição (733 requisições).
- Usadas pelo front (origin/develop c078c41): **315**; sem uso no front: 24.
- Campos que o front lê e o OpenAPI não declara: **0** em 0 operações.
- Chamadas do front sem rota no backend: **1**.
- Operações cujo status real difere do OpenAPI (que declara 200 em tudo): **101**.

## O front chama e o backend não tem

| Método | Rota | Service | Função |
|---|---|---|---|
| POST | `/apartamentoVistoria/atualizar-agenda-massa` | ApartamentoVistoriaService.ts | `apartamentoVistoriaService.atualizarAgendaEmMassa` |

## Por domínio

### Acessos

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/administracao/acessos` | 200 | [prep] GET /administracao/acessos · acha o usuário de teste e os módulos (200)<br>GET /administracao/acessos · usuários, perfis, módulos e cargos (200)<br>GET /administracao/acessos · usuário comum → 403 ACESSO_NEGADO (403, usuario) | sim | 3 |
| PUT | `/administracao/acessos/{id}` | 200 | [prep] PUT /administracao/acessos/{id} · acessos limitados do usuário de teste (200)<br>PUT /administracao/acessos/{id} · admin se desativar → 422 ULTIMO_ADMIN (422)<br>PUT /administracao/acessos/{id} · perfil inexistente → 400 (400)<br>PUT /administracao/acessos/{id} · usuário inexistente → 404 (404)<br>PUT /administracao/acessos/{id} · desativa o usuário de teste (200) | sim | 3 |
| PUT | `/administracao/acessos/{id}/cadastro` | 200 | [prep] PUT /administracao/acessos/{id}/cadastro · aprova o cadastro pendente na fase de teste (200)<br>PUT /administracao/acessos/{id}/cadastro · cadastro já decidido → 422 (422) | sim | 1 |
| PUT | `/administracao/acessos/{id}/dados` | 200 | PUT /administracao/acessos/{id}/dados · nome e celular do usuário de teste (200)<br>PUT /administracao/acessos/{id}/dados · e-mail de outra pessoa → 400 (400) | sim | 1 |
| POST | `/administracao/acessos/{id}/resetar-senha` | 200 | [prep] POST /administracao/acessos/{id}/resetar-senha · senha provisória (200)<br>POST /administracao/acessos/{id}/resetar-senha · a própria senha → 422 (422) | sim | 2 |
| PUT | `/administracao/acessos/{id}/superior` | 200 | PUT /administracao/acessos/{id}/superior · admin vira superior do usuário de teste (200)<br>PUT /administracao/acessos/{id}/superior · superior de si mesmo → 400 (400)<br>PUT /administracao/acessos/{id}/superior · ciclo (admin abaixo do próprio subordinado) → 400 (400)<br>PUT /administracao/acessos/{id}/superior · tira o superior (nulo) (200)<br>PUT /administracao/acessos/{id}/superior · volta o admin como superior (usado na hierarquia das equipes) (200) | sim | 3 |
| PUT | `/administracao/acessos/cargos/{idCargo}` | 200 | PUT /administracao/acessos/cargos/{idCargo} · cargo ganha SAC:LEITURA (200)<br>PUT /administracao/acessos/cargos/{idCargo} · limpa os acessos do cargo (200) | sim | 2 |
| GET | `/administracao/acessos/colaboradores-legados` | 200 | GET /administracao/acessos/colaboradores-legados · base antiga (200) | sim | — |
| PUT | `/administracao/acessos/colaboradores-legados/{idUser}` | 200 | PUT /administracao/acessos/colaboradores-legados/{idUser} · colaborador inexistente → 404 (404) | sim | — |

### Apartamento Vistoria

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/apartamentoVistoria` | 200 | GET /apartamentoVistoria · lista da fase de teste (200) | sim | 2 |
| POST | `/apartamentoVistoria` | 201 | POST /apartamentoVistoria · cria o apartamento fixo de histórico (primeira execução) (201)<br>POST /apartamentoVistoria · nome com mais de 10 caracteres → 400 (400)<br>POST /apartamentoVistoria · cria apartamento temporário (201)<br>POST /apartamentoVistoria · usuário comum → 403 (403, usuario) | sim | 2 |
| PUT | `/apartamentoVistoria` | 200 | PUT /apartamentoVistoria · edita o apartamento fixo (gera histórico) (200) | sim | 1 |
| DELETE | `/apartamentoVistoria/{id}` | 204 | DELETE /apartamentoVistoria/{id} · com histórico → 422 REGISTRO_EM_USO (422)<br>DELETE /apartamentoVistoria/{id} · sem histórico exclui (com termos e fotos) (204) | sim | — |
| GET | `/apartamentoVistoria/{id}` | 200 | GET /apartamentoVistoria/{id} · busca (200)<br>GET /apartamentoVistoria/{id} · excluído → 404 (404) | sim | 1 |
| POST | `/apartamentoVistoria/importar` | 200 | POST /apartamentoVistoria/importar · arquivo que não é planilha → 400 (400) | sim | — |
| GET | `/apartamentoVistoria/InfoGeralApartamentoVistoria` | 200 | GET /apartamentoVistoria/InfoGeralApartamentoVistoria · totais por status (200) | — | 1 |
| GET | `/apartamentoVistoria/lista-filtrada` | 200 | GET /apartamentoVistoria/lista-filtrada · procura o apartamento fixo de histórico (200)<br>GET /apartamentoVistoria/lista-filtrada · filtra pelo nome (200)<br>GET /apartamentoVistoria/lista-filtrada · 101 por página → 400 (400) | — | 1 |

### Apartamento Vistoria Historico

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/apartamentoVistoria/historico/{idApartamentoVistoria}` | 200 | GET /apartamentoVistoria/historico/{id} · a edição aparece no histórico (200) | — | 1 |

### Autenticação

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/auth/alterar-email` | 200 | POST /auth/alterar-email · senha atual errada → 400 (400, usuario)<br>POST /auth/alterar-email · e-mail de outra pessoa → 400 (400, usuario)<br>POST /auth/alterar-email · troca para um e-mail temporário (200, usuario)<br>POST /auth/alterar-email · volta para o e-mail do usuário de teste (200, usuario) | sim | 2 |
| POST | `/auth/alterar-senha` | 200 | POST /auth/alterar-senha · senha atual errada → 400 (400, usuario)<br>POST /auth/alterar-senha · senha nova curta → 400 (mínimo 10) (400, usuario)<br>POST /auth/alterar-senha · troca a senha e devolve token novo (200, usuario) | sim | — |
| POST | `/auth/aparelho` | 201 | POST /auth/aparelho · registra o aparelho (token só nesta resposta) (201, usuario) | sim | 1 |
| POST | `/auth/aparelho/entrar` | 200 | POST /auth/aparelho/entrar · abre sessão sem senha (200, nenhum)<br>POST /auth/aparelho/entrar · depois de sair → 401 APARELHO_DESCONECTADO (401, nenhum) | — | 1 |
| POST | `/auth/aparelho/sair` | 200 | POST /auth/aparelho/sair · desconecta o aparelho (200, nenhum) | — | — |
| POST | `/auth/cadastro` | 201 | [prep] POST /auth/cadastro · cadastra o usuário de teste (resposta igual se já existir) (201, nenhum)<br>POST /auth/cadastro · senha curta → 400 (400, nenhum) | sim | 1 |
| POST | `/auth/definir-senha` | 200 | [prep] POST /auth/definir-senha · cria a senha do run e já entra (200, nenhum)<br>POST /auth/definir-senha · conta que não espera senha nova → 400 (400, nenhum) | sim | 1 |
| POST | `/auth/esqueci-senha` | 200 | POST /auth/esqueci-senha · e-mail existente (200, nenhum)<br>POST /auth/esqueci-senha · e-mail inexistente → mesma resposta (200, nenhum) | sim | 1 |
| POST | `/auth/login` | 200 | [prep] POST /auth/login · com a provisória pede senha nova (422 TROCAR_SENHA) (422, nenhum)<br>POST /auth/login · senha errada → 401 CREDENCIAIS_INVALIDAS (401, nenhum)<br>POST /auth/login · e-mail que não existe → mesma recusa (401, nenhum)<br>POST /auth/login · sem senha → 400 ENTRADA_INVALIDA (400, nenhum)<br>POST /auth/login · entra com a senha do run (200, nenhum) | sim | 5 |
| GET | `/auth/me` | 200 | [prep] GET /auth/me · usuário da collection é ADMIN (200)<br>GET /auth/me · permissões efetivas do usuário comum (200, usuario)<br>GET /auth/me · sem token → 401 NAO_AUTENTICADO (401, nenhum)<br>GET /auth/me · token inválido → 401 (401, {{tokenInvalido}})<br>GET /auth/me · token de antes da troca de senha → 401 (401, {{tokenUsuarioAntigo}})<br>GET /auth/me · token do usuário desativado deixa de valer (401, usuario) | sim | 4 |
| POST | `/auth/redefinir-senha` | 200 | POST /auth/redefinir-senha · link inválido → 400 LINK_INVALIDO (400, nenhum) | sim | — |
| POST | `/auth/refresh` | 200 | POST /auth/refresh · renova o token (200, usuario) | sim | 1 |

### Avatares

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/avatares/equipe` | 200 | GET /avatares/equipe · eu, superior e equipe (200, usuario) | sim | 1 |
| GET | `/avatares/meu` | 200 | GET /avatares/meu · avatar do admin (200) | sim | — |
| PUT | `/avatares/meu` | 200 | PUT /avatares/meu · o usuário de teste salva o avatar (200, usuario)<br>PUT /avatares/meu · configuração que não é objeto → 400 (400, usuario)<br>PUT /avatares/meu · valor aninhado → 400 (400, usuario) | sim | 1 |
| GET | `/avatares/porta-voz` | 200 | GET /avatares/porta-voz · quem anuncia as novidades (200) | sim | — |

### Bloco de notas

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/blocos-notas` | 200 | GET /blocos-notas · meus cadernos (200) | sim | 1 |
| POST | `/blocos-notas` | 201 | POST /blocos-notas · cria caderno (com a primeira página) (201)<br>POST /blocos-notas · cor fora do padrão #RRGGBB → 400 (400)<br>POST /blocos-notas · usuário sem BLOCO_NOTAS → 403 (403, usuario) | sim | 1 |
| DELETE | `/blocos-notas/{id}` | 204 | DELETE /blocos-notas/{id} · exclui o caderno com tudo (204) | sim | — |
| GET | `/blocos-notas/{id}` | 200 | GET /blocos-notas/{id} · caderno com as páginas (200)<br>GET /blocos-notas/{id} · caderno de outra pessoa → 404 (403/404, usuario)<br>GET /blocos-notas/{id} · excluído → 404 (404) | sim | — |
| PUT | `/blocos-notas/{id}` | 200 | PUT /blocos-notas/{id} · renomeia (200)<br>PUT /blocos-notas/{id} · versão antiga → 409 (409) | sim | 1 |
| GET | `/blocos-notas/{id}/documento` | 200 | GET /blocos-notas/{id}/documento · documento de texto do caderno (200) | sim | — |
| PUT | `/blocos-notas/{id}/documento` | 200 | PUT /blocos-notas/{id}/documento · salva o documento (200)<br>PUT /blocos-notas/{id}/documento · <script> → 400 (400)<br>PUT /blocos-notas/{id}/documento · versão antiga → 409 (409) | sim | 1 |
| POST | `/blocos-notas/{id}/imagens` | 201 | POST /blocos-notas/{id}/imagens · imagem para colar (201)<br>POST /blocos-notas/{id}/imagens · texto → 400 (400) | sim | — |
| POST | `/blocos-notas/{id}/paginas` | 201 | POST /blocos-notas/{id}/paginas · página quadriculada (201)<br>POST /blocos-notas/{id}/paginas · fundo inválido → 400 (400)<br>POST /blocos-notas/{id}/paginas · largura 50 → 400 (400)<br>POST /blocos-notas/{id}/paginas · cópia da página 1 (201) | sim | 2 |
| PUT | `/blocos-notas/{id}/paginas/ordem` | 200 | PUT /blocos-notas/{id}/paginas/ordem · lista incompleta → 400 (400)<br>PUT /blocos-notas/{id}/paginas/ordem · reordena (200) | sim | 1 |
| POST | `/blocos-notas/{id}/paginas/pdf` | 201 | POST /blocos-notas/{id}/paginas/pdf · página de PDF importado (201)<br>POST /blocos-notas/{id}/paginas/pdf · PDF sem o número da página → 400 (400) | sim | 1 |
| POST | `/blocos-notas/{id}/pdfs` | 201 | POST /blocos-notas/{id}/pdfs · guarda o PDF original (201)<br>POST /blocos-notas/{id}/pdfs · imagem no lugar do PDF → 400 (400) | sim | — |
| GET | `/blocos-notas/arquivos` | 200 | GET /blocos-notas/arquivos · lista (sem o conteúdo) (200) | sim | 1 |
| POST | `/blocos-notas/arquivos` | 201 | POST /blocos-notas/arquivos · cria planilha (201)<br>POST /blocos-notas/arquivos · tipo inválido → 400 (400)<br>POST /blocos-notas/arquivos · planilha que não é JSON → 400 (400)<br>POST /blocos-notas/arquivos · documento com <script> → 400 (400) | sim | 1 |
| DELETE | `/blocos-notas/arquivos/{id}` | 204 | DELETE /blocos-notas/arquivos/{id} · exclui (204) | sim | — |
| GET | `/blocos-notas/arquivos/{id}` | 200 | GET /blocos-notas/arquivos/{id} · abre com o conteúdo (200)<br>GET /blocos-notas/arquivos/{id} · excluído → 404 (404) | sim | 1 |
| PUT | `/blocos-notas/arquivos/{id}` | 200 | PUT /blocos-notas/arquivos/{id} · salva conteúdo novo (200)<br>PUT /blocos-notas/arquivos/{id} · versão antiga → 409 (409) | sim | — |
| GET | `/blocos-notas/imagens/{id}` | 200 | GET /blocos-notas/imagens/{id} · imagem colada (200)<br>GET /blocos-notas/imagens/{id} · mesma versão (If-None-Match) → 304 (304) | sim | 3 |
| DELETE | `/blocos-notas/paginas/{id}` | 200 | DELETE /blocos-notas/paginas/{id} · exclui uma página (200)<br>DELETE /blocos-notas/paginas/{id} · exclui mais duas (200)<br>DELETE /blocos-notas/paginas/{id} · e a de PDF (200)<br>DELETE /blocos-notas/paginas/{id} · a última página não sai → 422 (422) | sim | 1 |
| GET | `/blocos-notas/paginas/{id}` | 200 | GET /blocos-notas/paginas/{id} · página com o desenho (200)<br>GET /blocos-notas/paginas/{id} · o desenho foi gravado (200)<br>GET /blocos-notas/paginas/{id} · a cópia levou o desenho (200) | sim | 3 |
| PUT | `/blocos-notas/paginas/{id}` | 200 | PUT /blocos-notas/paginas/{id} · salva o desenho e gira (200)<br>PUT /blocos-notas/paginas/{id} · versão de outro aparelho → 409 (409)<br>PUT /blocos-notas/paginas/{id} · conteúdo sem itens → 400 (400)<br>PUT /blocos-notas/paginas/{id} · giro de 45° → 400 (400) | sim | 1 |
| GET | `/blocos-notas/paginas/{id}/fundo` | 200 | GET /blocos-notas/paginas/{id}/fundo · fundo da página de PDF (200)<br>GET /blocos-notas/paginas/{id}/fundo · mesma versão (If-None-Match) → 304 (304)<br>GET /blocos-notas/paginas/{id}/fundo · página sem fundo → 404 (404) | sim | 3 |
| GET | `/blocos-notas/pdfs/{id}` | 200 | GET /blocos-notas/pdfs/{id} · PDF original (200)<br>GET /blocos-notas/pdfs/{id} · mesma versão (If-None-Match) → 304 (304) | sim | 3 |

### Cache Manager

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| PUT | `/cache/{cacheName}` | 204 | PUT /cache/{cacheName} · cache inexistente → 404 (404)<br>PUT /cache/{cacheName} · usuário comum → 403 (403, usuario) | — | — |
| PUT | `/cache/limparTodos` | 204 | PUT /cache/limparTodos · limpa todos (204)<br>PUT /cache/limparTodos · usuário comum → 403 (403, usuario) | — | — |

### Caixinha

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| DELETE | `/caixinha/comprovantes/{idComprovante}` | 204 | DELETE /caixinha/comprovantes/{idComprovante} · exclui (204) | sim | — |
| GET | `/caixinha/comprovantes/{idComprovante}/arquivo` | 200 | GET /caixinha/comprovantes/{idComprovante}/arquivo · PDF do comprovante (200)<br>GET /caixinha/comprovantes/{idComprovante}/arquivo · excluído → 404 (404) | sim | 2 |
| GET | `/caixinha/lancamentos` | 200 | GET /caixinha/lancamentos · filtro de hoje, a pagar (200)<br>GET /caixinha/lancamentos · situação inválida → 400 (400)<br>GET /caixinha/lancamentos · de depois de até → 400 (400)<br>GET /caixinha/lancamentos · usuário sem CAIXINHA → 403 (403, usuario) | sim | 1 |
| POST | `/caixinha/lancamentos` | 201 | POST /caixinha/lancamentos · sem cdRequisicao → 400 (400)<br>POST /caixinha/lancamentos · usuário sem CAIXINHA → 403 (403, usuario)<br>POST /caixinha/lancamentos · cria (201)<br>POST /caixinha/lancamentos · mesmo cdRequisicao devolve o já criado (201)<br>POST /caixinha/lancamentos · responsável inexistente → 400 (400)<br>POST /caixinha/lancamentos · responsável inativo → 400 (400) | sim | 3 |
| DELETE | `/caixinha/lancamentos/{id}` | 204 | DELETE /caixinha/lancamentos/{id} · versão antiga → 409 (409)<br>DELETE /caixinha/lancamentos/{id} · exclui (204) | sim | — |
| PUT | `/caixinha/lancamentos/{id}` | 200 | PUT /caixinha/lancamentos/{id} · edita (200)<br>PUT /caixinha/lancamentos/{id} · versão antiga → 409 (409) | sim | 1 |
| GET | `/caixinha/lancamentos/{id}/comprovantes` | 200 | GET /caixinha/lancamentos/{id}/comprovantes · um comprovante (200) | sim | 1 |
| POST | `/caixinha/lancamentos/{id}/comprovantes` | 201 | POST /caixinha/lancamentos/{id}/comprovantes · anexa PDF (201)<br>POST /caixinha/lancamentos/{id}/comprovantes · reenvio com o mesmo cdRequisicao não duplica (201)<br>POST /caixinha/lancamentos/{id}/comprovantes · imagem não é aceita → 400 (400) | sim | 2 |
| PUT | `/caixinha/lancamentos/{id}/marcacao` | 200 | PUT /caixinha/lancamentos/{id}/marcacao · lançado e pago (200)<br>PUT /caixinha/lancamentos/{id}/marcacao · sem versão → 400 (400) | sim | 1 |
| GET | `/caixinha/responsaveis` | 200 | GET /caixinha/responsaveis · procura o responsável de teste (200) | sim | — |
| POST | `/caixinha/responsaveis` | 201 | POST /caixinha/responsaveis · cria o responsável de teste (primeira execução) (201)<br>POST /caixinha/responsaveis · nome repetido → 400 (400) | sim | 1 |
| PUT | `/caixinha/responsaveis/{id}` | 200 | PUT /caixinha/responsaveis/{id} · garante ativo (200)<br>PUT /caixinha/responsaveis/{id} · desativa o responsável (200) | sim | 2 |
| GET | `/caixinha/resumo` | 200 | GET /caixinha/resumo · totais do dia (200) | sim | 1 |

### cargo-read-controller

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/cargos` | 200 | GET /cargos · lista com o registro novo (200)<br>GET /cargos · o excluído some da lista (200) | sim | 2 |

### cargo-write-controller

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/cargos` | 201 | POST /cargos · cargo temporário (201)<br>POST /cargos · cria (201)<br>POST /cargos · sem nome → 400 (400)<br>POST /cargos · usuário comum → 403 (403, usuario)<br>POST /cargos · cargo do colaborador (201) | sim | 1 |
| DELETE | `/cargos/{id}` | 204 | DELETE /cargos/{id} · exclui o cargo temporário (204)<br>DELETE /cargos/{id} · exclui (204)<br>DELETE /cargos/{id} · cargo em uso por colaborador → 422 REGISTRO_EM_USO (422)<br>DELETE /cargos/{id} · limpa o cargo do colaborador (204) | sim | — |
| PUT | `/cargos/{id}` | 200 | PUT /cargos/{id} · altera (200) | sim | 1 |

### Casamento

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/casamento/configuracao` | 200 | GET /casamento/configuracao · casal e data (200) | sim | — |
| PUT | `/casamento/configuracao` | 200 | PUT /casamento/configuracao · regrava os mesmos valores (200)<br>PUT /casamento/configuracao · data inexistente → 400 (400) | sim | 1 |
| GET | `/casamento/convidados` | 200 | GET /casamento/convidados · lista (200)<br>GET /casamento/convidados · apaga os importados [newman] (200) | sim | 1 |
| POST | `/casamento/convidados` | 201 | POST /casamento/convidados · convidado principal (201)<br>POST /casamento/convidados · acompanhante ligado ao principal (201)<br>POST /casamento/convidados · 51 acompanhantes → 400 (400) | sim | 2 |
| DELETE | `/casamento/convidados/{id}` | 204 | DELETE /casamento/convidados/{id} · exclui o acompanhante (204)<br>DELETE /casamento/convidados/{id} · exclui o principal (204) | sim | — |
| GET | `/casamento/convidados/{id}` | 200 | GET /casamento/convidados/{id} · busca (200)<br>GET /casamento/convidados/{id} · excluído → 404 (404) | — | — |
| PUT | `/casamento/convidados/{id}` | 200 | PUT /casamento/convidados/{id} · acompanhar a si mesmo → 400 (400)<br>PUT /casamento/convidados/{id} · ligação circular → 400 (400)<br>PUT /casamento/convidados/{id} · confirma presença (200) | sim | 2 |
| POST | `/casamento/convidados/importar` | 200 | POST /casamento/convidados/importar · planilha com linha boa e linhas inválidas (200)<br>POST /casamento/convidados/importar · arquivo que não é .xlsx → 400 (400) | sim | 1 |
| GET | `/casamento/dashboard` | 200 | GET /casamento/dashboard · totais (200)<br>GET /casamento/dashboard · usuário sem CASAMENTO → 403 (403, usuario) | sim | 1 |
| GET | `/casamento/fornecedores` | 200 | GET /casamento/fornecedores · lista (200) | sim | 1 |
| POST | `/casamento/fornecedores` | 201 | POST /casamento/fornecedores · cria (201)<br>POST /casamento/fornecedores · status desconhecido → 400 (400)<br>POST /casamento/fornecedores · sem categoria → 400 (400) | sim | 1 |
| DELETE | `/casamento/fornecedores/{id}` | 204 | DELETE /casamento/fornecedores/{id} · exclui com os anexos (204) | sim | — |
| GET | `/casamento/fornecedores/{id}` | 200 | GET /casamento/fornecedores/{id} · busca (200)<br>GET /casamento/fornecedores/{id} · conta o anexo que sobrou (200)<br>GET /casamento/fornecedores/{id} · excluído → 404 (404) | — | 1 |
| PUT | `/casamento/fornecedores/{id}` | 200 | PUT /casamento/fornecedores/{id} · contratado (200) | sim | 1 |
| GET | `/casamento/fornecedores/{id}/anexos` | 200 | GET /casamento/fornecedores/{id}/anexos · dois anexos (200) | sim | 1 |
| POST | `/casamento/fornecedores/{id}/anexos` | 201 | POST /casamento/fornecedores/{id}/anexos · contrato em PDF (201)<br>POST /casamento/fornecedores/{id}/anexos · comprovante em imagem (201)<br>POST /casamento/fornecedores/{id}/anexos · texto → 400 (400) | sim | 2 |
| DELETE | `/casamento/fornecedores/anexos/{idAnexo}` | 204 | DELETE /casamento/fornecedores/anexos/{idAnexo} · exclui um anexo (204) | sim | — |
| GET | `/casamento/fornecedores/anexos/{idAnexo}/arquivo` | 200 | GET /casamento/fornecedores/anexos/{idAnexo}/arquivo · arquivo do anexo (sem cache) (200) | sim | 2 |
| GET | `/casamento/marcos` | 200 | GET /casamento/marcos · por prazo (200) | sim | 1 |
| POST | `/casamento/marcos` | 201 | POST /casamento/marcos · cria (201) | sim | 1 |
| DELETE | `/casamento/marcos/{id}` | 204 | DELETE /casamento/marcos/{id} · exclui (204) | sim | — |
| GET | `/casamento/marcos/{id}` | 200 | GET /casamento/marcos/{id} · busca (200)<br>GET /casamento/marcos/{id} · excluído → 404 (404) | — | — |
| PUT | `/casamento/marcos/{id}` | 200 | PUT /casamento/marcos/{id} · edita (200) | sim | 1 |
| PUT | `/casamento/marcos/{id}/concluido` | 200 | PUT /casamento/marcos/{id}/concluido · conclui (200)<br>PUT /casamento/marcos/{id}/concluido · sem o campo → 400 (400) | sim | 1 |
| POST | `/casamento/marcos/padrao` | 201 | POST /casamento/marcos/padrao · lista vazia cria os 10 marcos padrão (201)<br>POST /casamento/marcos/padrao · com marcos cadastrados → 400 (400) | sim | 1 |

### Categoria

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/categoria` | 200 | GET /categoria · categorias (200) | — | — |

### Colaboradores

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/colaboradores` | 200 | GET /colaboradores · lista (200) | sim | 1 |
| POST | `/colaboradores` | 201 | POST /colaboradores · cria (201)<br>POST /colaboradores · celular com letras → 400 (400) | — | 1 |
| DELETE | `/colaboradores/{id}` | 204 | DELETE /colaboradores/{id} · exclui (204) | — | — |
| GET | `/colaboradores/{id}` | 200 | GET /colaboradores/{id} · busca (200)<br>GET /colaboradores/{id} · excluído → 404 (404) | sim | 1 |
| PUT | `/colaboradores/{id}` | 200 | PUT /colaboradores/{id} · altera (200) | — | 1 |

### Conta

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/conta/dados` | 200 | GET /conta/dados · meus dados (200, usuario) | sim | 1 |
| PUT | `/conta/dados` | 200 | PUT /conta/dados · salva nome e celular (200, usuario)<br>PUT /conta/dados · celular com letras → 400 (400, usuario)<br>PUT /conta/dados · empresa inexistente → 400 (400, usuario) | sim | 1 |

### Contexto

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/contexto/obras` | 200 | [prep] GET /contexto/obras · admin enxerga a obra de teste (200)<br>GET /contexto/obras · usuário comum só vê as obras em que participa, sem o código de acesso (200, usuario) | sim | 3 |

### Controle de Chaves

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/controleChaves/apartamentos` | 200 | GET /controleChaves/apartamentos · busca o apartamento de teste (200) | sim | 1 |
| GET | `/controleChaves/dashboard` | 200 | GET /controleChaves/dashboard · indicadores e recentes (200)<br>GET /controleChaves/dashboard · usuário comum → 403 (403, usuario) | sim | 1 |
| GET | `/controleChaves/ferramentas` | 200 | GET /controleChaves/ferramentas · busca paginada (200) | sim | 1 |
| GET | `/controleChaves/historico` | 200 | GET /controleChaves/historico · abertas (200) | sim | 1 |
| GET | `/controleChaves/obras` | 200 | GET /controleChaves/obras · obras ativas (200) | sim | — |
| GET | `/controleChaves/pessoas` | 200 | GET /controleChaves/pessoas · usuários ativos (200) | sim | 1 |
| POST | `/controleChaves/retiradas` | 201 | POST /controleChaves/retiradas · tipo de item inválido → 400 (400)<br>POST /controleChaves/retiradas · sem quem retira → 400 (400)<br>POST /controleChaves/retiradas · usuário comum → 403 (403, usuario)<br>POST /controleChaves/retiradas · registra a retirada da chave (201) | sim | 3 |
| PATCH | `/controleChaves/retiradas/{id}/recebimento` | 200 | PATCH /controleChaves/retiradas/{id}/recebimento · recebe a chave (200)<br>PATCH /controleChaves/retiradas/{id}/recebimento · receber de novo → 400 (400) | sim | 3 |

### Cronograma semanal

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/cronogramaSemanal` | 200 | GET /cronogramaSemanal · lista (200) | sim | 1 |
| POST | `/cronogramaSemanal` | 201 | POST /cronogramaSemanal · cria demanda (201)<br>POST /cronogramaSemanal · fim antes do início → 400 (400)<br>POST /cronogramaSemanal · fixa sem dia da semana → 400 (400)<br>POST /cronogramaSemanal · atividade fixa (rotina) na segunda (201)<br>POST /cronogramaSemanal · usuário comum cria a própria demanda (201, usuario) | sim | 3 |
| PUT | `/cronogramaSemanal` | 200 | PUT /cronogramaSemanal · edita a demanda (200) | sim | 1 |
| DELETE | `/cronogramaSemanal/{id}` | 204 | DELETE /cronogramaSemanal/{id} · quem recebeu o compartilhamento não exclui → 403 (403, usuario)<br>DELETE /cronogramaSemanal/{id} · exclui a demanda (204)<br>DELETE /cronogramaSemanal/{id} · exclui a rotina (204)<br>DELETE /cronogramaSemanal/{id} · o usuário exclui a própria demanda (CRONOGRAMA_EXCLUIR) (204, usuario) | sim | 1 |
| GET | `/cronogramaSemanal/{id}` | 200 | GET /cronogramaSemanal/{id} · busca (200)<br>GET /cronogramaSemanal/{id} · o usuário de teste vê o item compartilhado (200, usuario)<br>GET /cronogramaSemanal/{id} · excluída → 404 (404) | sim | 2 |
| PUT | `/cronogramaSemanal/{id}/compartilhamento` | 200 | PUT /cronogramaSemanal/{id}/compartilhamento · compartilha com o usuário de teste (200)<br>PUT /cronogramaSemanal/{id}/compartilhamento · pessoa inexistente → 400 (400)<br>PUT /cronogramaSemanal/{id}/compartilhamento · quem recebeu não recompartilha → 403 (403, usuario) | sim | 1 |
| DELETE | `/cronogramaSemanal/{id}/excecoes/{data}` | 204 | DELETE /cronogramaSemanal/{id}/excecoes/{data} · reativa o dia (204) | sim | — |
| PUT | `/cronogramaSemanal/{id}/excecoes/{data}` | 204 | PUT /cronogramaSemanal/{id}/excecoes/{data} · desmarca a rotina na próxima segunda (204)<br>PUT /cronogramaSemanal/{id}/excecoes/{data} · demanda não fixa → 400 (400) | sim | — |
| PUT | `/cronogramaSemanal/{id}/status` | 200 | PUT /cronogramaSemanal/{id}/status · move para executar (200)<br>PUT /cronogramaSemanal/{id}/status · status inválido → 400 (400)<br>PUT /cronogramaSemanal/{id}/status · demanda inexistente → 404 (404) | sim | 1 |
| GET | `/cronogramaSemanal/equipes` | 200 | GET /cronogramaSemanal/equipes · equipes que eu enxergo (200)<br>GET /cronogramaSemanal/equipes · o membro enxerga a equipe (200, usuario) | sim | 2 |
| POST | `/cronogramaSemanal/equipes` | 201 | POST /cronogramaSemanal/equipes · cria equipe na obra de teste (201)<br>POST /cronogramaSemanal/equipes · nome repetido na obra → 409 (409)<br>POST /cronogramaSemanal/equipes · sem membros → 400 (400)<br>POST /cronogramaSemanal/equipes · sem obra escolhida → 400 (400)<br>POST /cronogramaSemanal/equipes · usuário sem CRONOGRAMA:ADMIN → 403 (403, usuario) | sim | 1 |
| DELETE | `/cronogramaSemanal/equipes/{id}` | 204 | DELETE /cronogramaSemanal/equipes/{id} · exclui (204)<br>DELETE /cronogramaSemanal/equipes/{id} · já excluída → 404 (404) | sim | — |
| PUT | `/cronogramaSemanal/equipes/{id}` | 200 | PUT /cronogramaSemanal/equipes/{id} · renomeia (200) | sim | 1 |
| GET | `/cronogramaSemanal/equipes/hierarquia/{idLider}` | 200 | GET /cronogramaSemanal/equipes/hierarquia/{idLider} · sugestão pela hierarquia (200) | sim | 1 |
| GET | `/cronogramaSemanal/equipes/obra` | 200 | GET /cronogramaSemanal/equipes/obra · equipes da obra escolhida (200) | sim | 1 |
| GET | `/cronogramaSemanal/excecoes` | 200 | GET /cronogramaSemanal/excecoes · a exceção aparece (200) | sim | 1 |
| POST | `/cronogramaSemanal/interpretar` | 200 | POST /cronogramaSemanal/interpretar · texto vazio → 400 (sem chamar a IA) (400)<br>POST /cronogramaSemanal/interpretar · token inválido → 401 (401, {{tokenInvalido}}) | — | — |
| GET | `/cronogramaSemanal/pessoas` | 200 | GET /cronogramaSemanal/pessoas · com quem compartilhar (200) | sim | 1 |

### Cubicagem

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/cubicagens` | 200 | GET /cubicagens · minhas cubicagens (sem as peças) (200) | sim | 1 |
| POST | `/cubicagens` | 201 | POST /cubicagens · cria com duas peças (201)<br>POST /cubicagens · peças que não são lista → 400 (400)<br>POST /cubicagens · perda acima de 50% → 400 (400) | sim | 1 |
| DELETE | `/cubicagens/{id}` | 204 | DELETE /cubicagens/{id} · exclui (204) | sim | — |
| GET | `/cubicagens/{id}` | 200 | GET /cubicagens/{id} · abre com as peças (200)<br>GET /cubicagens/{id} · de outra pessoa → 404 (403/404, usuario)<br>GET /cubicagens/{id} · excluída → 404 (404) | sim | 1 |
| PUT | `/cubicagens/{id}` | 200 | PUT /cubicagens/{id} · salva com a versão da tela (200)<br>PUT /cubicagens/{id} · versão antiga (outro aparelho) → 409 (409)<br>PUT /cubicagens/{id} · sem versão → 400 (400) | sim | 1 |

### Davi Job

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/davi-job/placar` | 200 | GET /davi-job/placar · top 10 e meu recorde (200) | sim | 1 |
| POST | `/davi-job/pontuacoes` | 201 | POST /davi-job/pontuacoes · registra 0 pontos (201, usuario)<br>POST /davi-job/pontuacoes · 10001 pontos → 400 (400, usuario) | sim | 1 |

### Dia Semana

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/diaSemana` | 200 | GET /diaSemana · dias da semana (200)<br>GET /diaSemana · sem token → 401 (401, nenhum) | sim | 1 |

### Drumcam

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/drumcam/bilhete` | 200 | POST /drumcam/bilhete · bilhete para câmera (200)<br>POST /drumcam/bilhete · bilhete para controle (200)<br>POST /drumcam/bilhete · papel inválido → 400 (400) | sim | 1 |

### empresa-read-controller

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/empresas` | 200 | GET /empresas · lista com o registro novo (200)<br>GET /empresas · o excluído some da lista (200) | sim | 2 |

### empresa-write-controller

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/empresas` | 201 | POST /empresas · cria (201)<br>POST /empresas · sem nome → 400 (400)<br>POST /empresas · usuário comum → 403 (403, usuario)<br>POST /empresas · empresa do colaborador (201) | sim | 1 |
| DELETE | `/empresas/{id}` | 204 | DELETE /empresas/{id} · exclui (204)<br>DELETE /empresas/{id} · limpa a empresa do colaborador (204) | sim | — |
| PUT | `/empresas/{id}` | 200 | PUT /empresas/{id} · altera (200) | sim | 1 |

### Escadinha

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/escadinha` | 200 | GET /escadinha · sem obra escolhida → 400 (400)<br>GET /escadinha · torres e modelo da obra de teste (200) | sim | 1 |
| PUT | `/escadinha/modelo` | 200 | PUT /escadinha/modelo · salva o modelo de ciclos da obra de teste (200)<br>PUT /escadinha/modelo · usuário sem ESCADINHA:ADMIN → 403 (403, usuario) | sim | 1 |
| DELETE | `/escadinha/tipologias/{id}` | 204 | DELETE /escadinha/tipologias/{id} · exclui (204)<br>DELETE /escadinha/tipologias/{id} · já excluída → 404 (404) | sim | — |
| PUT | `/escadinha/tipologias/{id}` | 200 | PUT /escadinha/tipologias/{id} · renomeia e mantém a imagem (null) (200)<br>PUT /escadinha/tipologias/{id} · imagem vazia remove (200) | sim | 2 |
| GET | `/escadinha/tipologias/{id}/imagem` | 200 | GET /escadinha/tipologias/{id}/imagem · planta da tipologia (200) | sim | 1 |
| POST | `/escadinha/torres` | 201 | POST /escadinha/torres · cria torre com prancha (201)<br>POST /escadinha/torres · prancha que não é imagem → 400 (400)<br>POST /escadinha/torres · config que não é JSON de objeto/lista → 400 (400)<br>POST /escadinha/torres · usuário sem ESCADINHA → 403 (403, usuario) | sim | 1 |
| DELETE | `/escadinha/torres/{id}` | 204 | DELETE /escadinha/torres/{id} · exclui a torre (204)<br>DELETE /escadinha/torres/{id} · já excluída → 404 (404) | sim | — |
| PUT | `/escadinha/torres/{id}` | 200 | PUT /escadinha/torres/{id} · salva a torre (sem planta mantém a prancha) (200)<br>PUT /escadinha/torres/{id} · versão antiga → 409 (409)<br>PUT /escadinha/torres/{id} · sem versão → 400 (400) | sim | 1 |
| PUT | `/escadinha/torres/{id}/celulas` | 200 | PUT /escadinha/torres/{id}/celulas · marca executado e em execução (200)<br>PUT /escadinha/torres/{id}/celulas · status vazio limpa a célula (200)<br>PUT /escadinha/torres/{id}/celulas · chave fora do padrão → 400 (400)<br>PUT /escadinha/torres/{id}/celulas · data no futuro → 400 (400)<br>PUT /escadinha/torres/{id}/celulas · lista vazia → 400 (400) | sim | 2 |
| GET | `/escadinha/torres/{id}/planta` | 200 | GET /escadinha/torres/{id}/planta · prancha em data URL (200) | sim | 1 |
| GET | `/escadinha/torres/{id}/tipologias` | 200 | GET /escadinha/torres/{id}/tipologias · lista (sem a imagem) (200) | sim | 1 |
| POST | `/escadinha/torres/{id}/tipologias` | 201 | POST /escadinha/torres/{id}/tipologias · cria tipologia com planta (201)<br>POST /escadinha/torres/{id}/tipologias · nome repetido na torre → 409 (409) | sim | 1 |

### Ferramentas

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/ferramentas` | 200 | GET /ferramentas · lista (200) | sim | — |
| POST | `/ferramentas` | 201 | POST /ferramentas · cria (201)<br>POST /ferramentas · sem nome → 400 (400)<br>POST /ferramentas · usuário comum → 403 (403, usuario) | sim | 1 |
| DELETE | `/ferramentas/{id}` | 204 | DELETE /ferramentas/{id} · exclui (204) | sim | — |
| GET | `/ferramentas/{id}` | 200 | GET /ferramentas/{id} · busca (200)<br>GET /ferramentas/{id} · excluída → 404 (404)<br>GET /ferramentas/{id} · inexistente → 404 (404) | — | 1 |
| PUT | `/ferramentas/{id}` | 200 | PUT /ferramentas/{id} · desativa (200) | sim | 1 |

### Financeiro

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/financeiro/categorias` | 200 | GET /financeiro/categorias · procura as categorias de teste (200) | sim | — |
| POST | `/financeiro/categorias` | 201 | POST /financeiro/categorias · cria a entrada de teste (primeira execução) (201)<br>POST /financeiro/categorias · cria a saída de teste com ritmo de fatura (primeira execução) (201)<br>POST /financeiro/categorias · ritmo de fatura numa entrada → 400 (400)<br>POST /financeiro/categorias · tipo inválido → 400 (400)<br>POST /financeiro/categorias · regra de data sem dia → 400 (400)<br>POST /financeiro/categorias · nome repetido no mesmo tipo → 400 (400) | sim | — |
| PUT | `/financeiro/categorias/{id}` | 200 | PUT /financeiro/categorias/{id} · reativa a entrada (200)<br>PUT /financeiro/categorias/{id} · reativa a saída (200)<br>PUT /financeiro/categorias/{id} · tipo não muda com lançamentos → 400 (400)<br>PUT /financeiro/categorias/{id} · desativa a entrada de teste (200)<br>PUT /financeiro/categorias/{id} · desativa a saída de teste (200) | sim | 2 |
| GET | `/financeiro/configuracao` | 200 | GET /financeiro/configuracao · lê (200) | sim | 1 |
| PUT | `/financeiro/configuracao` | 200 | PUT /financeiro/configuracao · regrava os mesmos valores (200)<br>PUT /financeiro/configuracao · 13 meses de média → 400 (400) | sim | 1 |
| GET | `/financeiro/investimentos` | 200 | GET /financeiro/investimentos · carteira da pessoa de teste (200)<br>GET /financeiro/investimentos · o fundo arquivado sai da carteira (200) | sim | 2 |
| POST | `/financeiro/investimentos/ativos` | 201 | POST /financeiro/investimentos/ativos · ticker inválido → 400 (400)<br>POST /financeiro/investimentos/ativos · sem pessoa → 400 (400)<br>POST /financeiro/investimentos/ativos · fundo de teste (cria ou reativa o arquivado) (200/201/400)<br>POST /financeiro/investimentos/ativos · mesmo fundo na mesma pessoa → 400 (400) | sim | 1 |
| PUT | `/financeiro/investimentos/ativos/{id}` | 200 | PUT /financeiro/investimentos/ativos/{id} · renomeia (200)<br>PUT /financeiro/investimentos/ativos/{id} · sem versão → 400 (400)<br>PUT /financeiro/investimentos/ativos/{id} · versão antiga → 409 (409)<br>PUT /financeiro/investimentos/ativos/{id} · arquiva o fundo de teste (200) | sim | 1 |
| POST | `/financeiro/investimentos/ativos/{id}/operacoes` | 201 | POST /financeiro/investimentos/ativos/{id}/operacoes · compra 10 cotas (201)<br>POST /financeiro/investimentos/ativos/{id}/operacoes · reenvio não duplica (201)<br>POST /financeiro/investimentos/ativos/{id}/operacoes · venda maior que a posição → 400 (400)<br>POST /financeiro/investimentos/ativos/{id}/operacoes · vende 4 cotas (201) | sim | 4 |
| POST | `/financeiro/investimentos/ativos/{id}/proventos` | 201 | POST /financeiro/investimentos/ativos/{id}/proventos · pagamento antes da data-com → 400 (400)<br>POST /financeiro/investimentos/ativos/{id}/proventos · registra provento (201) | sim | 1 |
| POST | `/financeiro/investimentos/ativos/{id}/proventos/sincronizar` | 200 | POST /financeiro/investimentos/ativos/{id}/proventos/sincronizar · importa do provedor de cotações (200/502/503) | sim | — |
| DELETE | `/financeiro/investimentos/operacoes/{id}` | 200 | DELETE /financeiro/investimentos/operacoes/{id} · excluir a compra deixaria a venda sem cotas → 400 (400)<br>DELETE /financeiro/investimentos/operacoes/{id} · exclui a venda (200)<br>DELETE /financeiro/investimentos/operacoes/{id} · exclui a compra (200)<br>DELETE /financeiro/investimentos/operacoes/{id} · inexistente → 404 (404) | sim | 2 |
| DELETE | `/financeiro/investimentos/proventos/{id}` | 200 | DELETE /financeiro/investimentos/proventos/{id} · exclui o provento (200) | sim | — |
| GET | `/financeiro/lancamentos` | 200 | GET /financeiro/lancamentos · extrato de mar/2099 da pessoa de teste (200)<br>GET /financeiro/lancamentos · só realizados de saída (200)<br>GET /financeiro/lancamentos · busca por texto (200)<br>GET /financeiro/lancamentos · competência inválida → 400 (400)<br>GET /financeiro/lancamentos · tipo inválido → 400 (400)<br>GET /financeiro/lancamentos · situação inválida → 400 (400)<br>GET /financeiro/lancamentos · o fixo de teste entrou em mar/2099 (200)<br>GET /financeiro/lancamentos · apaga o que sobrou em 2099 (200) | sim | 6 |
| POST | `/financeiro/lancamentos` | 201 | POST /financeiro/lancamentos · sem cdRequisicao → 400 (400)<br>POST /financeiro/lancamentos · cdRequisicao que não é UUID → 400 (400)<br>POST /financeiro/lancamentos · 121 parcelas → 400 (400)<br>POST /financeiro/lancamentos · categoria inexistente → 400 (400)<br>POST /financeiro/lancamentos · usuário sem FINANCEIRO → 403 (403, usuario)<br>POST /financeiro/lancamentos · fatura em 2 parcelas (mar e abr de 2099) (201)<br>POST /financeiro/lancamentos · mesmo cdRequisicao devolve as parcelas já criadas (201)<br>POST /financeiro/lancamentos · salário realizado em mar/2099 (201)<br>POST /financeiro/lancamentos · um lançamento em fev/2099 (mês anterior) (201)<br>POST /financeiro/lancamentos · categoria inativa → 400 (400) | sim | 5 |
| DELETE | `/financeiro/lancamentos/{id}` | 204 | DELETE /financeiro/lancamentos/{id} · versão antiga → 409 (409)<br>DELETE /financeiro/lancamentos/{id} · exclui a 1ª parcela (204) | sim | — |
| PUT | `/financeiro/lancamentos/{id}` | 200 | PUT /financeiro/lancamentos/{id} · edita a 1ª parcela (200)<br>PUT /financeiro/lancamentos/{id} · versão antiga → 409 (409) | sim | 1 |
| GET | `/financeiro/lancamentos/{id}/leituras` | 200 | GET /financeiro/lancamentos/{id}/leituras · evolução da fatura (ritmo de fatura) (200) | sim | 1 |
| PUT | `/financeiro/lancamentos/{id}/realizado` | 200 | PUT /financeiro/lancamentos/{id}/realizado · marca como pago (200)<br>PUT /financeiro/lancamentos/{id}/realizado · sem versão → 400 (400)<br>PUT /financeiro/lancamentos/{id}/realizado · mês fechado trava o lançamento → 400 (400) | sim | 2 |
| GET | `/financeiro/mes/{competencia}` | 200 | GET /financeiro/mes/{competencia} · conta de mar/2099 (200)<br>GET /financeiro/mes/{competencia} · com idPessoa não há saldo anterior (200)<br>GET /financeiro/mes/{competencia} · competência inválida → 400 (400) | sim | 4 |
| POST | `/financeiro/mes/{competencia}/fechar` | 200 | POST /financeiro/mes/{competencia}/fechar · mês anterior aberto e sem saldo inicial → 400 (400)<br>POST /financeiro/mes/{competencia}/fechar · fecha mar/2099 (200)<br>POST /financeiro/mes/{competencia}/fechar · já fechado → 400 (400) | sim | 2 |
| POST | `/financeiro/mes/{competencia}/reabrir` | 200 | POST /financeiro/mes/{competencia}/reabrir · mês que não está fechado → 400 (400)<br>POST /financeiro/mes/{competencia}/reabrir · reabre mar/2099 (200) | sim | 1 |
| PUT | `/financeiro/mes/{competencia}/saldo-inicial` | 200 | PUT /financeiro/mes/{competencia}/saldo-inicial · define 1000 em mar/2099 (200)<br>PUT /financeiro/mes/{competencia}/saldo-inicial · vazio volta ao saldo do mês anterior (200)<br>PUT /financeiro/mes/{competencia}/saldo-inicial · saldo inicial para poder fechar (200)<br>PUT /financeiro/mes/{competencia}/saldo-inicial · tira o saldo inicial (200) | sim | 2 |
| GET | `/financeiro/pessoas` | 200 | GET /financeiro/pessoas · procura a pessoa de teste (200)<br>GET /financeiro/pessoas · usuário sem FINANCEIRO → 403 (403, usuario) | sim | — |
| POST | `/financeiro/pessoas` | 201 | POST /financeiro/pessoas · cria a pessoa de teste (primeira execução) (201)<br>POST /financeiro/pessoas · nome repetido → 400 (400) | sim | — |
| PUT | `/financeiro/pessoas/{id}` | 200 | PUT /financeiro/pessoas/{id} · reativa a pessoa de teste (200)<br>PUT /financeiro/pessoas/{id} · desativa a pessoa de teste (200) | sim | 2 |
| GET | `/financeiro/recorrencias` | 200 | GET /financeiro/recorrencias · procura a recorrência de teste (200) | sim | — |
| POST | `/financeiro/recorrencias` | 201 | POST /financeiro/recorrencias · cria a recorrência de teste, só em mar/2099 (primeira execução) (201)<br>POST /financeiro/recorrencias · valor zero → 400 (400) | sim | — |
| PUT | `/financeiro/recorrencias/{id}` | 200 | PUT /financeiro/recorrencias/{id} · reativa e substitui os dados (200)<br>PUT /financeiro/recorrencias/{id} · versão antiga → 409 (409)<br>PUT /financeiro/recorrencias/{id} · desativa a recorrência de teste (200) | sim | 1 |
| POST | `/financeiro/recorrencias/gerar/{competencia}` | 200 | POST /financeiro/recorrencias/gerar/{competencia} · gera mar/2099 (200)<br>POST /financeiro/recorrencias/gerar/{competencia} · gerar de novo não duplica (200)<br>POST /financeiro/recorrencias/gerar/{competencia} · competência inválida → 400 (400)<br>POST /financeiro/recorrencias/gerar/{competencia} · mês fechado → 400 (400) | sim | 2 |
| GET | `/financeiro/resumo` | 200 | GET /financeiro/resumo · totais com os filtros do extrato (200)<br>GET /financeiro/resumo · de depois de até → 400 (400) | sim | 1 |

### Games

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/games/conquistas` | 200 | GET /games/conquistas · todas as conquistas (200, usuario) | sim | 1 |
| GET | `/games/copas` | 200 | GET /games/copas · minhas Copas (200, usuario) | sim | 1 |
| POST | `/games/copas` | 200 | POST /games/copas · registra uma Copa de 3 rodadas (200, usuario)<br>POST /games/copas · 4 rodadas → 400 (400, usuario)<br>POST /games/copas · resultado que não é JSON → 400 (400, usuario) | sim | 1 |
| GET | `/games/favoritos` | 200 | GET /games/favoritos · meus favoritos (200) | sim | — |
| PUT | `/games/favoritos` | 200 | PUT /games/favoritos · regrava a mesma lista (200)<br>PUT /games/favoritos · nome de jogo inválido → 400 (400)<br>PUT /games/favoritos · 22 favoritos → 400 (400) | sim | 1 |
| POST | `/games/partidas` | 200 | POST /games/partidas · registra partida do jogo de teste (200, usuario)<br>POST /games/partidas · bots demais → 400 (400, usuario)<br>POST /games/partidas · colocação maior que jogadores → 400 (400, usuario)<br>POST /games/partidas · dificuldade desconhecida → 400 (400, usuario) | sim | 1 |
| GET | `/games/resumo` | 200 | GET /games/resumo · números do jogo de teste (200, usuario)<br>GET /games/resumo · jogo inválido → 400 (400) | sim | 1 |
| POST | `/games/salas` | 200 | POST /games/salas · abre sala (quem abre hospeda) (200)<br>POST /games/salas · jogo inválido → 400 (400) | sim | 1 |
| POST | `/games/salas/{codigo}/entrar` | 200 | POST /games/salas/{codigo}/entrar · o usuário de teste entra pelo código (200, usuario)<br>POST /games/salas/{codigo}/entrar · código inexistente → 404 (404)<br>POST /games/salas/{codigo}/entrar · código inválido → 400 (400) | sim | 1 |

### Health

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/nord-tool/health` | 200 | [prep] GET /nord-tool/health · aplicação no ar (200, nenhum) | — | 1 |

### Integrações

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/integracoes/tokens` | 200 | GET /integracoes/tokens · lista (e revoga links [newman] que sobraram de outro run) (200) | sim | 1 |
| POST | `/integracoes/tokens` | 201 | POST /integracoes/tokens · sem rótulo → 400 (400)<br>POST /integracoes/tokens · cria link (a chave só aparece aqui) (201) | sim | 1 |
| DELETE | `/integracoes/tokens/{id}` | 204 | DELETE /integracoes/tokens/{id} · revoga (204)<br>DELETE /integracoes/tokens/{id} · já revogado → 404 (404) | sim | — |
| GET | `/publico/cronograma/{chave}` | 200 | GET /publico/cronograma/{chave} · relatório em JSON sem login (200, nenhum)<br>GET /publico/cronograma/{chave} · relatório em texto (200, nenhum)<br>GET /publico/cronograma/{chave} · chave inválida → 404 (404, nenhum)<br>GET /publico/cronograma/{chave} · revogado deixa de funcionar → 404 (404, nenhum) | — | 2 |

### Lugia

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/lugia/chat` | 200 | POST /lugia/chat · modelo inexistente → 400 (não chama a IA) (400)<br>POST /lugia/chat · usuário sem LUGIA → 403 (403, usuario) | — | — |
| GET | `/lugia/conversas` | 200 | GET /lugia/conversas · conversas do usuário (200) | sim | — |
| DELETE | `/lugia/conversas/{id}` | 204 | DELETE /lugia/conversas/{id} · inexistente → 404 (404) | sim | — |
| GET | `/lugia/conversas/{id}` | 200 | GET /lugia/conversas/{id} · conversa inexistente → 404 (404) | sim | — |
| PATCH | `/lugia/conversas/{id}` | 204 | PATCH /lugia/conversas/{id} · renomear inexistente → 404 (404)<br>PATCH /lugia/conversas/{id} · sem título → 400 (400) | sim | — |
| GET | `/lugia/modelos` | 200 | GET /lugia/modelos · modelos e nível do usuário (200) | sim | 1 |

### Mapeamentos

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/mapeamentos` | 200 | GET /mapeamentos · lista (sem linhas) (200) | sim | 1 |
| POST | `/mapeamentos` | 201 | POST /mapeamentos · cria quantitativo com linhas (201)<br>POST /mapeamentos · tipo inválido → 400 (400)<br>POST /mapeamentos · tolerância acima de 100 → 400 (400)<br>POST /mapeamentos · usuário sem MAPEAMENTOS → 403 (403, usuario) | sim | 1 |
| DELETE | `/mapeamentos/{id}` | 204 | DELETE /mapeamentos/{id} · sem versão → 400 (400)<br>DELETE /mapeamentos/{id} · exclui (204) | sim | — |
| GET | `/mapeamentos/{id}` | 200 | GET /mapeamentos/{id} · detalha com linhas (200)<br>GET /mapeamentos/{id} · excluído → 404 (404) | sim | 1 |
| PUT | `/mapeamentos/{id}` | 200 | PUT /mapeamentos/{id} · substitui as linhas (200)<br>PUT /mapeamentos/{id} · versão antiga → 409 (409)<br>PUT /mapeamentos/{id} · concluído não edita → 422 (422) | sim | 2 |
| PUT | `/mapeamentos/{id}/status` | 200 | PUT /mapeamentos/{id}/status · conclui (200)<br>PUT /mapeamentos/{id}/status · status inválido → 400 (400)<br>PUT /mapeamentos/{id}/status · reabre (200) | sim | 1 |

### Marketing

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/marketing/conexao` | 200 | GET /marketing/conexao · endereço do login da rede (ou rede não configurada) (200/400/422) | sim | 1 |
| POST | `/marketing/contas` | 201 | POST /marketing/contas · código de login inválido → recusa (400/422) | sim | — |
| DELETE | `/marketing/contas/{id}` | 204 | DELETE /marketing/contas/{id} · conta inexistente → 404 (404) | sim | — |
| POST | `/marketing/midias` | 201 | POST /marketing/midias · tipo que não é vídeo → 400 (400)<br>POST /marketing/midias · começa a receber um vídeo de 4 KB (201/422) | sim | 1 |
| PUT | `/marketing/midias/{id}/partes/{indice}` | 204 | PUT /marketing/midias/{id}/partes/{indice} · parte fora de ordem → 400 (400/404)<br>PUT /marketing/midias/{id}/partes/{indice} · envia a parte 0 (204)<br>PUT /marketing/midias/{id}/partes/{indice} · vídeo de outra pessoa ou inexistente → 404 (404) | sim | — |
| GET | `/marketing/painel` | 200 | GET /marketing/painel · painel sem atualizar na rede (200) | sim | — |
| GET | `/marketing/publicacoes` | 200 | GET /marketing/publicacoes · publicações feitas (200) | sim | — |
| POST | `/marketing/publicacoes` | 201 | POST /marketing/publicacoes · sem título → 400 (400)<br>POST /marketing/publicacoes · vídeo inexistente → 404 (404) | sim | — |
| GET | `/marketing/redes` | 200 | GET /marketing/redes · redes e contas conectadas (200)<br>GET /marketing/redes · usuário sem MARKETING → 403 (403, usuario) | sim | 1 |
| GET | `/publico/marketing/midia/{codigo}` | 200 | GET /publico/marketing/midia/{codigo} · link público inválido → 404 (404, nenhum) | — | — |

### Medições

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/medicoes` | 200 | GET /medicoes · lista e status disponíveis (200)<br>GET /medicoes · usuário com LEITURA vê a medição da fase (200, usuario) | sim | 2 |
| POST | `/medicoes` | 201 | POST /medicoes · cria (status vazio vira PENDENTE) (201)<br>POST /medicoes · mesmo contrato e nº → 422 REGISTRO_DUPLICADO (422)<br>POST /medicoes · status inexistente → 400 (400)<br>POST /medicoes · valor zero → 400 (400)<br>POST /medicoes · usuário com MEDICOES:LEITURA → 403 (403, usuario) | sim | 2 |
| DELETE | `/medicoes/{id}` | 204 | DELETE /medicoes/{id} · versão antiga → 409 (409)<br>DELETE /medicoes/{id} · exclui com a versão atual (204)<br>DELETE /medicoes/{id} · já excluída → 404 (404) | sim | — |
| PUT | `/medicoes/{id}` | 200 | PUT /medicoes/{id} · edita com a versão atual (200)<br>PUT /medicoes/{id} · versão antiga → 409 (409)<br>PUT /medicoes/{id} · sem versão → 400 (400) | sim | 2 |
| PUT | `/medicoes/{id}/status` | 200 | PUT /medicoes/{id}/status · troca só o status (200)<br>PUT /medicoes/{id}/status · medição inexistente → 404 (404) | sim | 1 |

### Menu

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/menu-favoritos` | 200 | GET /menu-favoritos · do admin (200)<br>GET /menu-favoritos · o usuário de teste lê os dele (200, usuario) | sim | 1 |
| PUT | `/menu-favoritos` | 200 | PUT /menu-favoritos · regrava os do admin iguais (200)<br>PUT /menu-favoritos · o usuário de teste salva (sem repetir) (200, usuario)<br>PUT /menu-favoritos · caminho inválido → 400 (400, usuario) | sim | 2 |

### Notificações

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/notificacoes/aparelhos` | 200 | GET /notificacoes/aparelhos · o aparelho aparece (200, usuario)<br>GET /notificacoes/aparelhos · o aparelho some (200, usuario) | sim | 2 |
| POST | `/notificacoes/aparelhos` | 204 | POST /notificacoes/aparelhos · endpoint sem https → 400 (400, usuario)<br>POST /notificacoes/aparelhos · inscreve um aparelho de teste (204, usuario) | sim | — |
| POST | `/notificacoes/aparelhos/cancelar` | 204 | POST /notificacoes/aparelhos/cancelar · desativa o aparelho (204, usuario) | sim | — |
| GET | `/notificacoes/caixa` | 200 | GET /notificacoes/caixa · o aviso de teste está na caixa (200, usuario) | — | 1 |
| GET | `/notificacoes/config` | 200 | GET /notificacoes/config · chave pública VAPID (200, usuario) | sim | 1 |
| GET | `/notificacoes/preferencias` | 200 | GET /notificacoes/preferencias · do admin (200) | sim | — |
| PUT | `/notificacoes/preferencias` | 200 | PUT /notificacoes/preferencias · regrava as do admin iguais (200)<br>PUT /notificacoes/preferencias · o usuário de teste salva as dele (200, usuario)<br>PUT /notificacoes/preferencias · antecedência de 121 min → 400 (400, usuario) | sim | 2 |
| POST | `/notificacoes/teste` | 200 | POST /notificacoes/teste · aviso de teste (sem aparelhos = 0) (200, usuario) | sim | 1 |

### Obras e fases

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| PUT | `/administracao/fases/{id}` | 200 | PUT /administracao/fases/{id} · edita a fase de teste (200)<br>PUT /administracao/fases/{id} · versão antiga → 409 (409) | sim | 1 |
| PUT | `/administracao/fases/{id}/usuarios` | 200 | [prep] PUT /administracao/fases/{id}/usuarios · usuário de teste participa da fase de teste (200)<br>PUT /administracao/fases/{id}/usuarios · usuário inexistente → 400 (400) | sim | 1 |
| GET | `/administracao/obras` | 200 | [prep] GET /administracao/obras · procura a obra e a fase de teste (200) | sim | — |
| POST | `/administracao/obras` | 201 | [prep] POST /administracao/obras · cria a obra de teste (só na primeira execução) (201)<br>POST /administracao/obras · código de acesso repetido → 422 REGISTRO_DUPLICADO (422)<br>POST /administracao/obras · código de acesso inválido → 400 (400)<br>POST /administracao/obras · usuário comum → 403 (403, usuario) | sim | 2 |
| PUT | `/administracao/obras/{id}` | 200 | PUT /administracao/obras/{id} · edita a obra de teste (200)<br>PUT /administracao/obras/{id} · versão antiga → 409 CONFLITO_VERSAO (409)<br>PUT /administracao/obras/{id} · sem nrVersao → 400 (400) | sim | 1 |
| POST | `/administracao/obras/{id}/fases` | 201 | [prep] POST /administracao/obras/{id}/fases · cria a fase de teste (só na primeira execução) (201)<br>POST /administracao/obras/{id}/fases · obra inexistente → 404 (404) | sim | 1 |
| POST | `/administracao/obras/vincular-apartamentos` | 200 | POST /administracao/obras/vincular-apartamentos · liga apartamentos antigos pela sigla (200) | sim | 1 |

### permissao-read-controller

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/permissoes` | 200 | GET /permissoes · lista com o registro novo (200)<br>GET /permissoes · o excluído some da lista (200) | sim | 2 |

### permissao-write-controller

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/permissoes` | 201 | POST /permissoes · cria (201)<br>POST /permissoes · sem nome → 400 (400)<br>POST /permissoes · usuário comum → 403 (403, usuario)<br>POST /permissoes · permissão do colaborador (201) | sim | 1 |
| DELETE | `/permissoes/{id}` | 204 | DELETE /permissoes/{id} · exclui (204)<br>DELETE /permissoes/{id} · limpa a permissão do colaborador (204) | sim | — |
| PUT | `/permissoes/{id}` | 200 | PUT /permissoes/{id} · altera (200) | sim | 1 |

### Placas

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/placas` | 200 | GET /placas · placas da obra de teste (200) | sim | 1 |
| POST | `/placas` | 201 | POST /placas · cria placa na obra de teste (201)<br>POST /placas · sem obra escolhida → 400 (400)<br>POST /placas · modelo inexistente → 404 (404) | sim | 1 |
| DELETE | `/placas/{id}` | 204 | DELETE /placas/{id} · exclui a placa (204) | sim | — |
| PUT | `/placas/{id}` | 200 | PUT /placas/{id} · altera (200) | sim | 1 |
| POST | `/placas/imagens` | 201 | POST /placas/imagens · imagem solta para a folha (201) | sim | 1 |
| GET | `/placas/imagens/{id}` | 200 | GET /placas/imagens/{id} · imagem solta (200)<br>GET /placas/imagens/{id} · mesma versão (If-None-Match) → 304 (304) | sim | 3 |
| GET | `/placas/modelos` | 200 | GET /placas/modelos · o modelo continua, desativado (200)<br>GET /placas/modelos · o modelo some (200) | sim | 2 |
| POST | `/placas/modelos` | 201 | POST /placas/modelos · cria modelo temporário (201)<br>POST /placas/modelos · config que não é objeto → 400 (400)<br>POST /placas/modelos · usuário sem PLACAS:ADMIN → 403 (403, usuario) | sim | 1 |
| DELETE | `/placas/modelos/{id}` | 204 | DELETE /placas/modelos/{id} · com placa só desativa (204)<br>DELETE /placas/modelos/{id} · sem placas exclui de vez (204) | sim | — |
| PUT | `/placas/modelos/{id}` | 200 | PUT /placas/modelos/{id} · altera (200) | sim | 1 |
| DELETE | `/placas/modelos/{id}/imagens/{tipo}` | 200 | DELETE /placas/modelos/{id}/imagens/{tipo} · tira o logo (200) | sim | 1 |
| GET | `/placas/modelos/{id}/imagens/{tipo}` | 200 | GET /placas/modelos/{id}/imagens/{tipo} · fundo do modelo (200)<br>GET /placas/modelos/{id}/imagens/{tipo} · mesma versão (If-None-Match) → 304 (304)<br>GET /placas/modelos/{id}/imagens/{tipo} · modelo sem logo → 404 (404) | sim | 3 |
| POST | `/placas/modelos/{id}/imagens/{tipo}` | 200 | POST /placas/modelos/{id}/imagens/{tipo} · envia o fundo (200)<br>POST /placas/modelos/{id}/imagens/{tipo} · envia o logo (200)<br>POST /placas/modelos/{id}/imagens/{tipo} · tipo que não é fundo/logo → 400 (400)<br>POST /placas/modelos/{id}/imagens/{tipo} · arquivo que não é imagem → 400 (400) | sim | 2 |

### Relatório fotográfico

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/relatorios-fotograficos` | 200 | GET /relatorios-fotograficos · lista (sem itens) (200)<br>GET /relatorios-fotograficos · aparece na lista de quem recebeu (200, usuario) | sim | 2 |
| POST | `/relatorios-fotograficos` | 201 | POST /relatorios-fotograficos · modelo desativado → 400 (400)<br>POST /relatorios-fotograficos · com modelo e sem itens copia os itens do modelo (201)<br>POST /relatorios-fotograficos · layout inválido → 400 (400)<br>POST /relatorios-fotograficos · sem título → 400 (400)<br>POST /relatorios-fotograficos · usuário com LEITURA → 403 (403, usuario) | sim | 2 |
| DELETE | `/relatorios-fotograficos/{id}` | 204 | DELETE /relatorios-fotograficos/{id} · versão antiga → 409 (409)<br>DELETE /relatorios-fotograficos/{id} · exclui (204) | sim | — |
| GET | `/relatorios-fotograficos/{id}` | 200 | GET /relatorios-fotograficos/{id} · versão atual do relatório (200)<br>GET /relatorios-fotograficos/{id} · quem recebeu vê (200, usuario)<br>GET /relatorios-fotograficos/{id} · versão atual do relatório (200)<br>GET /relatorios-fotograficos/{id} · excluído → 404 (404) | sim | 1 |
| PUT | `/relatorios-fotograficos/{id}` | 200 | PUT /relatorios-fotograficos/{id} · item de outro relatório → 400 (400)<br>PUT /relatorios-fotograficos/{id} · os itens enviados substituem os atuais (200)<br>PUT /relatorios-fotograficos/{id} · versão antiga → 409 (409)<br>PUT /relatorios-fotograficos/{id} · concluído não edita → 422 (422) | sim | 1 |
| PUT | `/relatorios-fotograficos/{id}/compartilhamento` | 200 | PUT /relatorios-fotograficos/{id}/compartilhamento · compartilha com o usuário de teste (200)<br>PUT /relatorios-fotograficos/{id}/compartilhamento · pessoa inexistente → 400 (400) | sim | 1 |
| PUT | `/relatorios-fotograficos/{id}/modelo` | 200 | PUT /relatorios-fotograficos/{id}/modelo · tira o modelo (200)<br>PUT /relatorios-fotograficos/{id}/modelo · volta o modelo com itens e layout (200) | sim | 2 |
| PUT | `/relatorios-fotograficos/{id}/status` | 200 | PUT /relatorios-fotograficos/{id}/status · conclui (200)<br>PUT /relatorios-fotograficos/{id}/status · status inválido → 400 (400)<br>PUT /relatorios-fotograficos/{id}/status · reabre (200)<br>PUT /relatorios-fotograficos/{id}/status · quem recebeu não altera → 403 (403, usuario) | sim | — |
| GET | `/relatorios-fotograficos/equipes` | 200 | GET /relatorios-fotograficos/equipes · equipes que eu enxergo (200) | sim | — |
| DELETE | `/relatorios-fotograficos/fotos/{idFoto}` | 204 | DELETE /relatorios-fotograficos/fotos/{idFoto} · exclui a foto (204) | sim | — |
| PUT | `/relatorios-fotograficos/fotos/{idFoto}` | 200 | PUT /relatorios-fotograficos/fotos/{idFoto} · legenda e ordem (200)<br>PUT /relatorios-fotograficos/fotos/{idFoto} · ordem 0 → 400 (400) | sim | 1 |
| GET | `/relatorios-fotograficos/fotos/{idFoto}/imagem` | 200 | GET /relatorios-fotograficos/fotos/{idFoto}/imagem · imagem da foto (200)<br>GET /relatorios-fotograficos/fotos/{idFoto}/imagem · mesma versão (If-None-Match) → 304 (304) | sim | 3 |
| PUT | `/relatorios-fotograficos/fotos/{idFoto}/imagem` | 200 | PUT /relatorios-fotograficos/fotos/{idFoto}/imagem · troca a imagem (legenda fica) (200) | sim | 1 |
| POST | `/relatorios-fotograficos/itens/{idItem}/fotos` | 201 | POST /relatorios-fotograficos/itens/{idItem}/fotos · foto no primeiro item (201)<br>POST /relatorios-fotograficos/itens/{idItem}/fotos · arquivo que não é imagem → 400 (400) | sim | 1 |
| GET | `/relatorios-fotograficos/modelos` | 200 | GET /relatorios-fotograficos/modelos · procura o modelo fixo (200)<br>GET /relatorios-fotograficos/modelos · versão atual do modelo (200) | sim | — |
| POST | `/relatorios-fotograficos/modelos` | 201 | POST /relatorios-fotograficos/modelos · cria o modelo fixo (primeira execução) (201)<br>POST /relatorios-fotograficos/modelos · fonte inválida → 400 (400)<br>POST /relatorios-fotograficos/modelos · opacidade 70% → 400 (400)<br>POST /relatorios-fotograficos/modelos · usuário sem ADMIN do módulo → 403 (403, usuario) | sim | 1 |
| PUT | `/relatorios-fotograficos/modelos/{id}` | 200 | PUT /relatorios-fotograficos/modelos/{id} · altera e substitui os itens (200)<br>PUT /relatorios-fotograficos/modelos/{id} · versão antiga → 409 (409)<br>PUT /relatorios-fotograficos/modelos/{id} · desativa (200)<br>PUT /relatorios-fotograficos/modelos/{id} · reativa (200) | sim | 1 |
| DELETE | `/relatorios-fotograficos/modelos/{id}/imagens/{tipo}` | 200 | DELETE /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · remove o ícone (200) | sim | 1 |
| GET | `/relatorios-fotograficos/modelos/{id}/imagens/{tipo}` | 200 | GET /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · fundo do modelo (200)<br>GET /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · mesma versão (If-None-Match) → 304 (304)<br>GET /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · sem ícone → 404 (404) | sim | 3 |
| POST | `/relatorios-fotograficos/modelos/{id}/imagens/{tipo}` | 200 | POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · fundo (marca d'água) (200)<br>POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · ícone (200)<br>POST /relatorios-fotograficos/modelos/{id}/imagens/{tipo} · tipo logo → 400 (400) | sim | 2 |
| GET | `/relatorios-fotograficos/pessoas` | 200 | GET /relatorios-fotograficos/pessoas · com quem compartilhar (200) | sim | 1 |

### Repertório

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| POST | `/repertorio/cifras-enviadas` | 200 | POST /repertorio/cifras-enviadas · sem pessoas → 400 (400)<br>POST /repertorio/cifras-enviadas · cifra vazia → 400 (400)<br>POST /repertorio/cifras-enviadas · compartilha com o usuário de teste (200) | sim | 1 |
| GET | `/repertorio/cifras-recebidas` | 200 | GET /repertorio/cifras-recebidas · quem recebeu vê (sem o texto) (200, usuario) | sim | 1 |
| DELETE | `/repertorio/cifras-recebidas/{id}` | 204 | DELETE /repertorio/cifras-recebidas/{id} · exclui a cópia recebida (204, usuario) | sim | — |
| POST | `/repertorio/cifras-recebidas/{id}/abrir` | 200 | POST /repertorio/cifras-recebidas/{id}/abrir · abre e marca como lida (200, usuario)<br>POST /repertorio/cifras-recebidas/{id}/abrir · cópia de outra pessoa → 404 (404) | sim | 1 |
| GET | `/repertorio/musicas` | 200 | GET /repertorio/musicas · minhas músicas (sem os dados) (200) | sim | 1 |
| DELETE | `/repertorio/musicas/{chave}` | 204 | DELETE /repertorio/musicas/{chave} · exclui a música e o áudio (204) | sim | — |
| GET | `/repertorio/musicas/{chave}` | 200 | GET /repertorio/musicas/{chave} · música com os dados (200) | sim | 1 |
| PUT | `/repertorio/musicas/{chave}` | 200 | PUT /repertorio/musicas/{chave} · guarda a música (200)<br>PUT /repertorio/musicas/{chave} · atualiza pela mesma chave (200)<br>PUT /repertorio/musicas/{chave} · chave com espaço → 400 (400)<br>PUT /repertorio/musicas/{chave} · dados que não são objeto → 400 (400) | — | 2 |
| GET | `/repertorio/musicas/{chave}/audio` | 200 | GET /repertorio/musicas/{chave}/audio · áudio da música (200)<br>GET /repertorio/musicas/{chave}/audio · mesma versão (If-None-Match) → 304 (304)<br>GET /repertorio/musicas/{chave}/audio · música excluída → 404 (404) | sim | 3 |
| PUT | `/repertorio/musicas/{chave}/audio` | 200 | PUT /repertorio/musicas/{chave}/audio · envia o áudio WAV (200)<br>PUT /repertorio/musicas/{chave}/audio · texto → 400 (400) | sim | 1 |
| GET | `/repertorio/pessoas` | 200 | GET /repertorio/pessoas · com quem compartilhar (200) | sim | 1 |
| GET | `/repertorio/projetos` | 200 | GET /repertorio/projetos · minhas criações (200) | sim | 1 |
| DELETE | `/repertorio/projetos/{chave}` | 204 | DELETE /repertorio/projetos/{chave} · exclui (204) | sim | — |
| GET | `/repertorio/projetos/{chave}` | 200 | GET /repertorio/projetos/{chave} · criação com os dados (200)<br>GET /repertorio/projetos/{chave} · excluída → 404 (404) | sim | 1 |
| PUT | `/repertorio/projetos/{chave}` | 200 | PUT /repertorio/projetos/{chave} · guarda a criação (200) | — | 1 |
| GET | `/repertorio/uso` | 200 | GET /repertorio/uso · espaço usado (200) | sim | 1 |

### SAC

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/sac/chamados` | 200 | GET /sac/chamados · meus chamados (200, usuario)<br>GET /sac/chamados · todos=true sem ser ADMIN do SAC → 403 (403, usuario)<br>GET /sac/chamados · ADMIN vê todos (200) | sim | 2 |
| POST | `/sac/chamados` | 201 | POST /sac/chamados · o usuário de teste abre chamado com print (201, usuario)<br>POST /sac/chamados · sem descrição → 400 (400, usuario)<br>POST /sac/chamados · imagem que não é imagem → 400 (400, usuario) | sim | 1 |
| DELETE | `/sac/chamados/{id}` | 204 | DELETE /sac/chamados/{id} · quem abriu não exclui depois de atendido → 422 (422, usuario)<br>DELETE /sac/chamados/{id} · ADMIN exclui sempre (204) | sim | — |
| PUT | `/sac/chamados/{id}/resposta` | 200 | PUT /sac/chamados/{id}/resposta · usuário sem ADMIN do SAC → 403 (403, usuario)<br>PUT /sac/chamados/{id}/resposta · status inválido → 400 (400)<br>PUT /sac/chamados/{id}/resposta · ADMIN responde (em andamento) (200)<br>PUT /sac/chamados/{id}/resposta · chamado inexistente → 404 (404) | sim | 1 |
| PUT | `/sac/chamados/vistos` | 204 | PUT /sac/chamados/vistos · marca como visto (204, usuario) | sim | — |
| GET | `/sac/imagens/{id}` | 200 | GET /sac/imagens/{id} · print do chamado (de quem abriu) (200, usuario)<br>GET /sac/imagens/{id} · mesma versão (If-None-Match) → 304 (304, usuario)<br>GET /sac/imagens/{id} · imagem do chamado excluído → 404 (404) | sim | 3 |
| GET | `/sac/novidades` | 200 | GET /sac/novidades · ADMIN recebe a contagem de abertos (200)<br>GET /sac/novidades · quem abriu vê a resposta como novidade (200, usuario)<br>GET /sac/novidades · a novidade some (200, usuario) | sim | 4 |

### Status Cronograma Semanal

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/statusCronogramaSemanal` | 200 | GET /statusCronogramaSemanal · status do cronograma (200) | — | 1 |

### Status Vistoria

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/statusVistoria` | 200 | GET /statusVistoria · status de vistoria (200) | sim | 1 |

### Termo de reprova

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/apartamentoVistoria/{idApartamento}/termos-reprova` | 200 | GET /apartamentoVistoria/{id}/termos-reprova · lista do apartamento (200) | sim | 1 |
| POST | `/apartamentoVistoria/{idApartamento}/termos-reprova` | 201 | POST /apartamentoVistoria/{id}/termos-reprova · anexa termo de 2 páginas (201)<br>POST /apartamentoVistoria/{id}/termos-reprova · segundo termo recebe o nº 2 (201)<br>POST /apartamentoVistoria/{id}/termos-reprova · 81 páginas → 400 (400)<br>POST /apartamentoVistoria/{id}/termos-reprova · apartamento inexistente → 404 (404) | sim | 2 |
| DELETE | `/apartamentoVistoria/termos-reprova/{idTermo}` | 204 | DELETE /apartamentoVistoria/termos-reprova/{idTermo} · exclui o termo 2 (204) | sim | — |
| GET | `/apartamentoVistoria/termos-reprova/{idTermo}` | 200 | GET /apartamentoVistoria/termos-reprova/{idTermo} · metadados (200)<br>GET /apartamentoVistoria/termos-reprova/{idTermo} · excluído → 404 (404) | sim | 1 |
| GET | `/apartamentoVistoria/termos-reprova/{idTermo}/arquivo` | 200 | GET /apartamentoVistoria/termos-reprova/{idTermo}/arquivo · PDF do termo (200)<br>GET /apartamentoVistoria/termos-reprova/{idTermo}/arquivo · mesma versão (If-None-Match) → 304 (304) | sim | 3 |
| PUT | `/apartamentoVistoria/termos-reprova/{idTermo}/arquivo` | 200 | PUT /apartamentoVistoria/termos-reprova/{idTermo}/arquivo · PDF de 1 página remove a foto da página 2 (200) | sim | 2 |
| POST | `/apartamentoVistoria/termos-reprova/{idTermo}/fotos` | 201 | POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos · foto na página 1 (201)<br>POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos · segunda foto (201)<br>POST /apartamentoVistoria/termos-reprova/{idTermo}/fotos · página inexistente → 400 (400) | sim | 2 |
| PUT | `/apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem` | 200 | PUT /apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem · inverte a ordem (200)<br>PUT /apartamentoVistoria/termos-reprova/{idTermo}/fotos/ordem · foto de outro termo → 400 (400) | sim | 1 |
| PUT | `/apartamentoVistoria/termos-reprova/{idTermo}/situacao` | 200 | PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao · concluir sem foto → 400 (400)<br>PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao · conclui com observação (200)<br>PUT /apartamentoVistoria/termos-reprova/{idTermo}/situacao · situação desconhecida → 400 (400) | sim | 2 |
| DELETE | `/apartamentoVistoria/termos-reprova/fotos/{idFoto}` | 204 | DELETE /apartamentoVistoria/termos-reprova/fotos/{idFoto} · exclui a foto (204) | sim | — |
| PUT | `/apartamentoVistoria/termos-reprova/fotos/{idFoto}` | 200 | PUT /apartamentoVistoria/termos-reprova/fotos/{idFoto} · só a imagem, sem miniatura → 400 (400)<br>PUT /apartamentoVistoria/termos-reprova/fotos/{idFoto} · troca imagem, legenda e página (200) | sim | 2 |
| GET | `/apartamentoVistoria/termos-reprova/fotos/{idFoto}/imagem` | 200 | GET /apartamentoVistoria/termos-reprova/fotos/{idFoto}/imagem · imagem da foto (200)<br>GET /apartamentoVistoria/termos-reprova/fotos/{idFoto}/imagem · mesma versão (If-None-Match) → 304 (304) | sim | 3 |
| GET | `/apartamentoVistoria/termos-reprova/fotos/{idFoto}/miniatura` | 200 | GET /apartamentoVistoria/termos-reprova/fotos/{idFoto}/miniatura · miniatura da foto (200)<br>GET /apartamentoVistoria/termos-reprova/fotos/{idFoto}/miniatura · mesma versão (If-None-Match) → 304 (304) | sim | 3 |
| GET | `/apartamentoVistoria/termos-reprova/resumo` | 200 | GET /apartamentoVistoria/termos-reprova/resumo · painel do DAT (200)<br>GET /apartamentoVistoria/termos-reprova/resumo · usuário comum → 403 (403, usuario) | sim | 1 |

### Treinos

| Método | Rota | Status real | Requisições (status esperado) | Front | Regras |
|---|---|---|---|---|---|
| GET | `/treinos` | 200 | GET /treinos · usuário sem TREINOS → 403 (403, usuario)<br>GET /treinos · fichas do usuário (200)<br>GET /treinos · a carga usada foi para a ficha e conta a sessão (200) | sim | 2 |
| POST | `/treinos` | 201 | POST /treinos · cria ficha com exercícios (201)<br>POST /treinos · dias fora de 1–7 → 400 (400)<br>POST /treinos · 21 séries → 400 (400) | sim | 1 |
| DELETE | `/treinos/{id}` | 204 | DELETE /treinos/{id} · sem versão → 400 (400)<br>DELETE /treinos/{id} · exclui a ficha (204) | sim | — |
| PUT | `/treinos/{id}` | 200 | PUT /treinos/{id} · exercício de outro treino → 400 (400)<br>PUT /treinos/{id} · substitui os exercícios (200)<br>PUT /treinos/{id} · versão antiga → 409 (409) | sim | 1 |
| GET | `/treinos/sessoes` | 200 | GET /treinos/sessoes · últimas sessões (limite) (200) | sim | 1 |
| POST | `/treinos/sessoes` | 201 | POST /treinos/sessoes · registra o treino e atualiza a carga da ficha (201)<br>POST /treinos/sessoes · treino de outra pessoa ou inexistente → 404 (400/404) | sim | 1 |
| DELETE | `/treinos/sessoes/{id}` | 204 | DELETE /treinos/sessoes/{id} · exclui a sessão (204)<br>DELETE /treinos/sessoes/{id} · já excluída → 404 (404) | sim | — |

