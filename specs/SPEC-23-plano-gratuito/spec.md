# SPEC-23 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**Origem:** decisão de oferecer um plano gratuito de teste, com 15 minutos diários, para a pessoa testar sempre que puder.

**O que é:** um plano permanente e gratuito, com limite de uso diário medido no servidor e limites de tamanho. A empresa conhece o NordTool com os próprios dados e, quando assina, continua de onde parou. O desenho precisa evitar três problemas:

- o usuário perder trabalho quando o tempo acaba;
- alguém burlar o limite;
- contas gratuitas pesarem na infraestrutura.

**Situação atual:** não há medição de uso. A sessão já é renovada pelo front só quando há atividade (`AuthProvider`), o que dá uma base para detectar uso real. As contas e os limites vêm da SPEC-21; os valores do plano, da tabela `plano` da SPEC-22.

**Regras propostas (valores configuráveis na tabela `plano`, a confirmar com o negócio):**

- 15 minutos de uso por dia **por conta**, somando todos os usuários. A contagem zera à meia-noite de Brasília.
- Até 2 usuários, 1 obra ativa e 500 MB de arquivos.
- Todos os módulos do MVP liberados, para o teste mostrar o produto inteiro.
- Sem prazo para acabar. Conta sem uso por 180 dias recebe aviso e depois é excluída (SPEC-20).

**O que fazer:**

1. **O que conta como "minuto de uso":** um minuto em que houve uso real.
   - Qualquer requisição autenticada marca o minuto, e o front manda um *heartbeat* a cada 60 s só enquanto a aba está visível e houve interação nos últimos 2 minutos.
   - Aba esquecida aberta não consome tempo.
   - Desligar o heartbeat não burla, porque as próprias requisições contam.
2. **Medição no servidor, no Postgres** (decisão já tomada): tabela `uso_diario` (conta, dia, minutos), atualizada com `INSERT … ON CONFLICT` atômico, e um registro de minutos já contados para não contar o mesmo minuto duas vezes com dois usuários ao mesmo tempo. O front só exibe; quem decide é o backend.
3. **Quando o tempo acaba:**
   - As rotas dos módulos respondem um 4xx com `cdErro` próprio (ex.: `LIMITE_DIARIO_ATINGIDO`) no formato da SPEC-14.
   - Continuam liberados: login, tela de assinatura e planos, exportação dos próprios dados e logout.
   - Um salvamento já em andamento tem 60 s de tolerância para terminar.
4. **Experiência no front:**
   - contador de minutos restantes no topo;
   - aviso aos 3 minutos finais;
   - formulário em edição guardado como rascunho local, para nada se perder;
   - tela de limite atingido mostrando quando o tempo volta, com o botão de assinar.
5. **Limites de tamanho:** usuários, obras e armazenamento verificados pelo serviço de entitlements (SPEC-21) na criação, com mensagem clara e convite para assinar.
6. **Contra abuso:**
   - uma conta gratuita por CNPJ (validado) e e-mail confirmado no cadastro;
   - bloqueio de e-mails descartáveis;
   - captcha (Turnstile, SPEC-17);
   - limite de contas novas por IP e por dispositivo;
   - alerta (não banimento automático) quando várias contas parecem ser do mesmo dono.
7. **Conversão:**
   - convite para assinar quando o limite é atingido e depois de alguns dias de uso;
   - ao assinar, os limites sobem na hora e nada é migrado;
   - ao cancelar um plano pago, a conta volta ao gratuito com os dados preservados (SPEC-22).
8. **Métricas (SPEC-06):** minutos usados por dia, quantas contas batem o limite, conversão do gratuito para pago e custo de infraestrutura das contas gratuitas.

**Critérios de aceite:**

- [ ] Com dois usuários da mesma conta usando ao mesmo tempo, o minuto conta uma vez só, e a soma do dia para em 15.
- [ ] Aba aberta sem interação não consome tempo; desligar o heartbeat não permite usar além do limite.
- [ ] Atingido o limite, os módulos bloqueiam no backend, e assinatura e exportação continuam acessíveis; um formulário em edição não perde dados.
- [ ] A contagem zera à meia-noite de Brasília.
- [ ] Um segundo cadastro gratuito com o mesmo CNPJ é recusado.

**Depende de:** SPEC-21 (contas e entitlements) e SPEC-22 (tabela de planos e fluxo de assinatura). O padrão de erro vem da SPEC-14 (base).

**Prazo estimado:** 9 a 11 dias úteis (72 a 88 horas).
