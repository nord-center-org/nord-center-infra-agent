# Ferramentas Git locais

Implementadas: `git_status`, `git_diff` (somente leitura) e `git_commit`. As ferramentas atuam apenas nos três diretórios locais configurados em `server/projects.ts`; comandos são executados sem shell. `git_commit` exige os caminhos explicitamente selecionados e bloqueia `main`, `master` e `develop`.
