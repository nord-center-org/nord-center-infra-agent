# Frontend: validação

- Comandos disponíveis no `package.json`: `npm run lint`, `npm run build` e `npm test`.
- Execute verificações apropriadas à mudança e cubra estados/fluxos afetados.
- Para mudanças de interface, confira apresentação em viewport relevante se houver ambiente disponível.
- Relate o que foi executado e quaisquer limitações.

## Pipeline e deploy

- O `.github/workflows/pipeline.yml` roda no PR para `develop` uma checagem leve que precisa passar antes do merge: **Lint, Build & Testes** (`npm ci`, `npm run lint`, `npm run build` e `npm test`) e **Secret Scanning** (Gitleaks nos commits novos). Antes de abrir PR, rode os três comandos localmente.
- No merge em `develop` roda o pipeline completo: as mesmas etapas, **Análise de Vulnerabilidades** (`npm audit --omit=dev --audit-level=high`) e **Container Image** (build do `dockerfile` + Trivy). As vulnerabilidades só geram alerta; build, testes, segredos e a imagem bloqueiam.
- O job **CD (Railway)** publica com `railway up` (environment `develop` do GitHub: secret `RAILWAY_TOKEN` e variável `RAILWAY_SERVICE`) somente se as etapas bloqueantes passarem. O auto-deploy pelo GitHub fica desligado no serviço do Railway; não o religue, senão o deploy deixa de esperar o pipeline e volta a pedir aprovação para commits de quem não é membro do projeto.
- Não enfraqueça o pipeline para fazer um PR passar (pular etapas, `continue-on-error` em etapa bloqueante, remover Gitleaks); corrija a causa.
