# SPEC-20 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** entra parcial (item 12): termos de uso e de assinatura, privacidade, cookies, aceite, DPA para os clientes B2B e exportação e exclusão por conta. A retenção automática e o registro de tratamento vêm depois.

**Origem:** L-37 (revisar a política de cookies e a política de privacidade).

**O que é:** publicar as políticas e dar ao usuário os direitos previstos na LGPD: saber o que é guardado, exportar, corrigir e excluir. O sistema também passa a apagar sozinho o que não precisa mais guardar. A parte técnica cabe ao dev; o texto das políticas deve ser validado por alguém da área jurídica.

**Situação atual:**

- O app guarda dados pessoais e financeiros (Financeiro, Caixinha, Treinos), dados de terceiros (convidados do Casamento, colaboradores das obras), fotos e conversas com IA.
- As conversas e anexos da Lugia são enviados a provedores no exterior (Anthropic, OpenAI, Google, Groq, OpenRouter e, com a SPEC-10, possivelmente chineses).
- Nenhuma rota de política de privacidade aparece no catálogo de telas do front, e o cadastro não registra aceite.
- Hoje o front não usa cookies, só `sessionStorage` (token) e `localStorage` (tema). A SPEC-12 vai criar um cookie de sessão, que é estritamente necessário. Ferramentas de RUM ou analytics da SPEC-06 podem exigir consentimento.

**O que fazer:**

1. **Política de privacidade**, numa tela pública `/privacidade` com versão e data. Deve dizer:
   - quais dados são coletados e para quê, com a base legal de cada um;
   - com quem são compartilhados (hospedagem, e-mail, provedores de IA);
   - por quanto tempo ficam guardados;
   - quais são os direitos do titular e o contato do encarregado.
2. **Política de cookies e armazenamento local** (`/cookies`), listando cookie de sessão, `sessionStorage` e `localStorage`. Banner de consentimento só se entrar algo não essencial (analytics, RUM); o que for essencial não precisa de consentimento, mas precisa ser informado.
3. **Aceite registrado** no cadastro e a cada nova versão da política: usuário, versão e data, numa tabela nova.
4. **Direitos do titular** em "Minha conta":
   - exportar meus dados (JSON ou ZIP, que pode ir para a fila da SPEC-19);
   - corrigir dados;
   - solicitar exclusão, respeitando o que precisa ser mantido por obrigação legal.
5. **Retenção e expurgo automático:** prazos para logs, sessões, conversas da Lugia, tokens e arquivos de usuários excluídos. Um job agendado apaga ou anonimiza.
6. **Provedores de IA como suboperadores:** registrar quais recebem dados. Usar as opções de não treinar com os dados e de retenção mínima quando o provedor oferecer. Integrar com a política de dados da SPEC-10. O Cloudflare (SPEC-17) também entra na lista de suboperadores, porque vê o tráfego descriptografado na borda.
7. **Registro das operações de tratamento**, simples e versionado na infra: dado, finalidade, base legal, onde fica, quem acessa e retenção.
8. **Plano de incidente:** quem decide, como avaliar e como comunicar à ANPD e aos titulares, ligado aos alertas da SPEC-06.

**Critérios de aceite:**

- [ ] As telas de privacidade e de cookies estão publicadas, e o cadastro grava o aceite com a versão.
- [ ] Um usuário de teste exporta os próprios dados e solicita a exclusão pela tela.
- [ ] O job de retenção apaga ou anonimiza o que passou do prazo (verificado em `develop`).
- [ ] O texto das políticas foi revisado pelo jurídico.

**Depende de:** nada para as políticas e o aceite. A exportação se beneficia da SPEC-19, e o cookie da SPEC-12 entra na política de cookies.

**Prazo estimado:** 8 a 10 dias úteis (64 a 80 horas), sem contar a revisão jurídica do texto.
