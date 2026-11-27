# Marketing

| | |
|---|---|
| Slug | `marketing` |
| Status | ativa |
| Versão atual | [v1](v1.md) |
| Repositórios | nord-tool-scripts-sql, nord-tool-backend, nord-tool-frontend |
| Onde no app | Gestão Individual > Marketing (`/gestao/marketing`) |

## O que faz

A pessoa conecta as próprias contas do YouTube, do Instagram e do TikTok pelo login oficial de cada rede e publica um vídeo em várias delas de uma vez, com um toque em "Compartilhar". Um painel junta seguidores e views de todas as contas e mostra os posts recentes de cada uma. O objetivo é divulgar o NordTool e captar assinantes.

## Regras de negócio vigentes

- **RN-01** As contas são conectadas pelo login oficial da rede (OAuth): o NordTool nunca vê a senha. Cada pessoa só vê, usa e desconecta as próprias contas. _(v1)_
- **RN-02** Os tokens das redes ficam no banco criptografados (AES-256-GCM) e são renovados sozinhos antes de vencer: o do Instagram com 7 dias de folga, os outros com 5 minutos. Desconectar apaga o acesso; o que já foi publicado continua na rede. _(v1)_
- **RN-03** A volta do login da rede só é aceita com o `state` assinado pelo NordTool para a mesma pessoa e a mesma rede, em até 10 minutos. O endereço de volta é `<frontend>/gestao/marketing/conectar`, e só vale para uma origem permitida (NORD_CORS_ORIGINS) ou para o NORD_APP_URL. _(v1)_
- **RN-04** Uma rede sem as chaves do app no servidor aparece como "não configurada" e não pode ser conectada. _(v1)_
- **RN-05** Vídeo:
  - MP4, MOV ou WebM, até 500 MB; o Instagram não aceita WebM;
  - sobe em partes de 8 MB, em ordem;
  - fica num arquivo temporário do servidor até terminar de publicar em todas as contas escolhidas, ou no máximo 2 horas;
  - cada pessoa tem no máximo 3 vídeos em envio ao mesmo tempo. _(v1)_
- **RN-06** Publicar:
  - cria uma publicação por conta, com status ENVIANDO, PUBLICADO, PRIVADO ou ERRO, link e aviso;
  - roda em segundo plano, e a tela acompanha;
  - um envio parado há mais de 1 hora (servidor reiniciou) vira ERRO;
  - título até 150 caracteres (100 no YouTube) e legenda até 2.200. _(v1)_
- **RN-07** Cada rede publica assim:
  - YouTube: vídeo ou Short, público ou privado conforme a escolha;
  - Instagram: Reel, sempre público;
  - TikTok: público quando a conta permite, senão privado ("só eu").

  Enquanto o app da rede não passa pela auditoria, o YouTube e o TikTok deixam o post privado; a publicação fica como PRIVADO, com o aviso de como torná-lo público na própria rede. _(v1)_
- **RN-08** O Instagram busca o vídeo por um link público com código aleatório. O link só existe enquanto o vídeo está no servidor e serve apenas o arquivo, sem dado nenhum da conta. É a única rota pública do Marketing. _(v1)_
- **RN-09** Painel:
  - por conta: seguidores, views somadas e os 12 posts mais recentes, com views, curtidas e comentários (o que a rede não informa aparece como "—");
  - no topo: seguidores e views de todas as contas somados;
  - os números ficam guardados por 5 minutos, e "Atualizar" busca de novo;
  - o erro de uma rede aparece só na conta dela. _(v1)_
- **RN-10** Acesso MARKETING: LEITURA vê o painel e as publicações; ESCRITA conecta, desconecta e publica. Só os perfis com o curinga (administradores) já começam com ele; para os outros, o administrador libera em Acessos. _(v1)_

## Onde está no código

- **SQL:** `DDL/78.marketing_ddl.sql` (`marketing_conta`, `marketing_publicacao`).
- **Backend:**
  - Endpoints (`/api/v1/nord-tool/marketing/…`):
    - `GET /redes`, `GET /conexao`, `POST /contas`, `DELETE /contas/{id}`;
    - `POST /midias`, `PUT /midias/{id}/partes/{indice}`;
    - `POST|GET /publicacoes`, `GET /painel`;
    - `GET /publico/marketing/midia/{codigo}` (pública).
  - `MarketingService`/`MarketingServiceImpl` com `MarketingRepository`.
  - `service/marketing/`: `YoutubeProvider`, `InstagramProvider`, `TiktokProvider`, `MarketingCofre` (cifra e `state`) e `ProviderHttp`.
  - Variáveis de ambiente: `NORD_MARKETING_YOUTUBE_CLIENT_ID/_SECRET`, `NORD_MARKETING_INSTAGRAM_APP_ID/_SECRET`, `NORD_MARKETING_TIKTOK_CLIENT_KEY/_SECRET`, `NORD_MARKETING_CHAVE` (opcional) e `NORD_MARKETING_URL_API` (opcional).
- **Frontend:**
  - `pages/Marketing.tsx` (abas Painel, Publicar e Contas) e `pages/MarketingConectar.tsx` (volta do login);
  - `services/MarketingService.ts`;
  - `utils/marketing.ts`, com teste.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-24 | Conectar YouTube, Instagram e TikTok, publicar vídeo em todas de uma vez e painel de views | `feature-marketing` | sql, backend, frontend (links nos PRs), infra (este PR) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

- [acessos](../acessos/README.md): novo módulo MARKETING.
- Depende dos apps de desenvolvedor de cada rede, criados pelo dono do NordTool, e das variáveis de ambiente no Railway.
