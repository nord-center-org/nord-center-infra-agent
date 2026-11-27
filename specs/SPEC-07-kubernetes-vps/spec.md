# SPEC-07 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica para a evolução. Com clientes pagantes, a virada para a VPS exige janela anunciada, ensaio completo e rollback testado; o ambiente de produção separado (item 6 do MVP) facilita isso.

**Origem:** I-2 ("migração para o Kubernetes, AWS/EKS ou um mais barato"); L-66 (Kubernetes e VPS, novo sistema de deploy, novo hospedeiro, remover o Railway).

**O que é:** tirar backend, frontend e MCP do Railway e rodar em um cluster Kubernetes gerenciado, com infraestrutura como código, deploy por pipeline e ambientes separados. A primeira entrega desta spec é uma decisão de provedor com custo estimado; o que vem depois é execução.

**Situação atual:**

- Backend e front publicam no Railway via `railway up` no job de CD, só para `develop`. `master` ainda não publica por CI.
- O Postgres também está no Railway, e os arquivos (PDFs e fotos) ficam dentro dele em `BYTEA`. O provedor definitivo de arquivos ("Drive/S3") está marcado como "a decidir" no README.
- O MCP remoto ainda não tem deploy.
- As imagens já estão prontas para container: o backend roda não root com memória limitada; o front roda em nginx.

**Opções de provedor (taxa do control plane, sem contar nós, banco e tráfego):**

| Opção | Control plane | Observação |
| --- | --- | --- |
| AWS EKS | US$ 0,10/h por cluster, cerca de US$ 73/mês ([fonte](https://oneuptime.com/blog/post/2026-02-09-managed-kubernetes-pricing-comparison/view)) | Ecossistema mais completo (RDS, S3, Secrets Manager); a opção mais cara para um cluster pequeno |
| DigitalOcean DOKS | Gratuito; HA opcional por US$ 40/mês ([preços DO](https://docs.digitalocean.com/products/kubernetes/details/pricing)) | Nós a partir de cerca de US$ 12/mês; Postgres gerenciado e Spaces (compatível com S3) no mesmo provedor |
| Google GKE | Um cluster zonal com a taxa coberta pelo crédito gratuito; depois US$ 0,10/h | Autopilot cobra por pod e tira o trabalho de gerenciar nós |
| Azure AKS | Tier Free sem taxa e sem SLA | Faz sentido se já houver uso de Azure |
| k3s em VPS (ex.: Hetzner) | Sem taxa | O mais barato, mas a operação do cluster (upgrades, backup do etcd) fica com o time |

**Recomendação (revisada com o L-66, que pede VPS):** k3s em VPS, com um nó no começo e três nós com etcd embutido quando precisar de alta disponibilidade. Usar um provedor com datacenter próximo dos usuários; a latência para o Brasil pesa na escolha. É o caminho mais barato e atende ao pedido. O custo é operar o cluster: upgrades do k3s e do sistema, backup do datastore e segurança das máquinas. O Postgres pode ser gerenciado (menos risco) ou ficar numa VPS própria com o backup da SPEC-11. Se a operação pesar, DOKS é o meio-termo, com control plane gratuito. EKS só se houver motivo para estar na AWS. Os preços foram conferidos em fontes de 2026; reconfirmar na página oficial antes de contratar.

**O que fazer:**

1. **Decisão (ADR)** com provedor, região (latência para o Brasil) e estimativa mensal de cluster, nós, Postgres gerenciado, armazenamento de objetos, registry e tráfego, comparada com o custo atual do Railway.
2. **Infraestrutura como código** (Terraform/OpenTofu) num repositório novo, por exemplo `nord-tool-infra`: cluster, Postgres gerenciado com backup automático, bucket de arquivos, registry e DNS.
3. **Manifests por app** (Helm ou Kustomize) para backend, frontend e MCP, com estes elementos:
   - `requests`/`limits` coerentes com o `-Xmx512m` atual;
   - probes da SPEC-06;
   - `securityContext` não root e `readOnlyRootFilesystem`;
   - PodDisruptionBudget.
4. **Entrada:** Gateway API ou Ingress controller, com TLS automático (cert-manager) e os headers da SPEC-04.
5. **Segredos:** secret manager do provedor via External Secrets (ou Sealed Secrets). Nenhum segredo em manifest.
6. **Ambientes:** namespaces `develop` e `prod`. `prod` publica a partir de `master` com aprovação humana, conforme `policies/release.md`.
7. **CD:** o GitHub Actions gera a imagem, publica com digest e faz o deploy (Helm ou GitOps com Argo CD).
8. **Scripts SQL:** os scripts do `nord-tool-scripts-sql` rodam como Job (ou passo do pipeline) antes do rollout do backend, mantendo a ordem SQL, backend, front.
9. **Arquivos:** implementar `ArmazenamentoS3ServiceImpl` (a interface `ArmazenamentoService` já existe) e migrar o conteúdo de `arquivo_armazenado` para o bucket, o que tira peso do banco.
10. **Virada:** subir em paralelo, migrar o banco com janela curta (dump e restore), trocar o DNS e manter o Railway parado por algumas semanas como rollback.

**Específico de VPS:**

- **Endurecimento das máquinas:** acesso SSH só por chave e sem root, firewall liberando apenas 80 e 443 publicamente (API do k3s e SSH só por VPN), atualizações automáticas de segurança e fail2ban ou CrowdSec.
- **Provisionamento reprodutível:** Terraform para as VPS e Ansible (ou cloud-init) para o sistema e o k3s. Uma máquina perdida se recria em minutos.
- **Armazenamento:** volumes persistentes (Longhorn ou o block storage do provedor) só para o que precisar; arquivos vão para object storage.
- **Desligamento do Railway:** só depois de duas semanas estáveis no novo ambiente e de um teste de restauração (SPEC-11). Remover os jobs `railway up`, os secrets `RAILWAY_TOKEN` e o profile `railway` do backend.

**Critérios de aceite:**

- [ ] `terraform apply` recria o ambiente do zero; nada configurado à mão.
- [ ] Merge em `develop` publica no namespace `develop` sem passo manual; `prod` só com aprovação.
- [ ] Rollback para a versão anterior em um comando, testado.
- [ ] Backup do banco restaurado com sucesso num teste.
- [ ] Custo mensal real dentro da estimativa do ADR.

**Depende de:** SPEC-03 (imagens novas), SPEC-06 (probes) e SPEC-04 (headers e segredos). A SPEC-08 completa esta com réplicas e autoscaling.

**Prazo estimado:** 20 a 25 dias úteis (160 a 200 horas).
