# SPEC-11 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** entra inteira (item 1). Acrescentar: exportar e restaurar uma conta isolada (SPEC-21).

**Origem:** L-27 (sistema de recovery/backup); L-62 (backup real e fora do mesmo lugar do sistema).

**O que é:** cópias automáticas, criptografadas e guardadas em outro provedor, mais um teste periódico que prova que a restauração funciona. Backup que nunca foi restaurado não conta. É a primeira spec porque todas as outras mexem em dados, e a migração da SPEC-07 move o banco inteiro.

**Situação atual:**

- O Postgres roda no Railway, e nenhum README documenta backup, retenção ou teste de restauração.
- PDFs e fotos ficam dentro do banco (`arquivo_armazenado`, `BYTEA`). O dump inclui esses arquivos, é grande e cresce rápido.
- Os scripts do `nord-tool-scripts-sql` recriam o esquema, mas não os dados.

**O que fazer:**

1. **Regra 3-2-1:** três cópias, em dois tipos de armazenamento, uma fora do provedor principal. Na prática: o banco, o backup do próprio provedor e um bucket em outro provedor (por exemplo Backblaze B2 ou S3 em conta separada).
2. **Dump diário** com `pg_dump -Fc`, criptografado (age ou GPG) antes de sair do servidor. Roda por job agendado (GitHub Actions agendado agora; CronJob na SPEC-07).
3. **Retenção:** 7 diários, 4 semanais e 12 mensais. Bucket com versionamento e *object lock* (imutabilidade), para que nem uma credencial vazada consiga apagar o histórico.
4. **Recuperação pontual (PITR)** quando o banco sair do Railway: arquivamento contínuo de WAL com WAL-G ou pgBackRest, ou o recurso nativo do Postgres gerenciado escolhido.
5. **Teste de restauração automático** mensal: restaura o último dump num banco descartável, roda contagens e consultas de conferência, registra o tempo e destrói o banco. Falhou, alerta.
6. **Metas e runbook:** RPO (quanto dado se aceita perder) e RTO (em quanto tempo volta) definidos com o time. Ponto de partida: RPO de 24 h com dump, depois 15 min com WAL. O runbook descreve passo a passo a restauração, documentado em `nord-center-infra-agent`.
7. **Arquivos:** quando os arquivos forem para object storage (SPEC-07 item 9), ligar versionamento e replicação do bucket também.
8. **Alertas** (SPEC-06) para backup que falhou, backup que não rodou e tamanho fora do normal.

**Critérios de aceite:**

- [ ] Existe backup diário criptografado em provedor diferente do banco, com retenção e imutabilidade ativas.
- [ ] O teste mensal de restauração rodou com sucesso pelo menos uma vez e o tempo está registrado.
- [ ] O runbook foi executado por alguém que não o escreveu.
- [ ] Uma falha simulada de backup gera alerta.

**Depende de:** nada. Fazer antes da SPEC-03 e obrigatoriamente antes da SPEC-07.

**Prazo estimado:** 2 a 3 dias úteis (16 a 24 horas).
