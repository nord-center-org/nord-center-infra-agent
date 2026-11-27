# SPEC-22 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**Origem:** decisão de faturar com o MVP: planos mensal e anual, cancelamento, diretrizes e segurança de ponta.

**O que é:** o módulo que vende e cobra o uso do NordTool. Ele cobre:

- planos e limites;
- checkout num gateway de pagamento brasileiro;
- cobrança recorrente e nota fiscal;
- troca de plano, inadimplência e cancelamento pela própria tela.

Tudo segue regras claras para o cliente e com segurança no nível de quem lida com dinheiro. O sistema nunca toca em dado de cartão.

**Situação atual:** não existe nada de cobrança. A base que será reaproveitada:

- contas e limites por plano (SPEC-21);
- 2FA (SPEC-12);
- Cloudflare e captcha (SPEC-17);
- e-mail transacional (já existe, por SMTP);
- idempotência e outbox (padrões da SPEC-15, aplicados aqui primeiro).

**Gateway de pagamento: Asaas como escolha inicial (26/11/2026); as demais opções seguem em estudo.** Foi escolhido entre Asaas, Iugu, Pagar.me, Mercado Pago e Stripe, com dois critérios principais: poucas taxas e conta tanto com CPF quanto com CNPJ.

- **Taxas mais baixas no Pix e no boleto**, os meios mais usados em vendas para empresas: cerca de R$ 2 por Pix ou boleto recebido e R$ 0,49 + 2,99% no cartão à vista, sem mensalidade nem adesão, com taxas menores nos 3 primeiros meses ([preços Asaas](https://www.asaas.com/precos-e-taxas)). Os valores variam entre as páginas do próprio Asaas: conferir os vigentes no menu de taxas da conta antes de fechar os preços dos planos.
- **Aceita CPF e CNPJ** no cadastro.
- **Assinatura recorrente nativa:** cada fatura ou boleto recorrente sai com QR Code Pix, então o cliente pode pagar a mensalidade por Pix ([meios de pagamento](https://www.asaas.com/meios-de-pagamento)).
- **Nota fiscal de serviço integrada:** R$ 0,49 por nota, sem mensalidade, com emissão automática para assinaturas pela API ([nota fiscal Asaas](https://asaas.com/nota-fiscal), [FAQ da API](https://docs.asaas.com/docs/faq-de-notas-fiscais.md)). Isso elimina a integração com um emissor separado.
- **API com sandbox e webhooks**, usados nos fluxos e na segurança desta spec.

**Comparativo (preços públicos consultados em 26/11/2026):**

| Gateway | CPF e CNPJ | Assinatura com Pix | Nota fiscal integrada | Taxas principais | Quanto sobra de R$ 300 |
| --- | --- | --- | --- | --- | --- |
| Asaas (escolhido) | Sim | Sim | Sim, R$ 0,49 por nota | cerca de R$ 2 por Pix ou boleto; cartão R$ 0,49 + 2,99% | Pix cerca de R$ 297,85; cartão cerca de R$ 290,54 |
| [Stripe](https://stripe.com/br/pricing) | Sim (CNPJ opcional para pessoa física) | Sim | Não informado | Cartão 3,99% + R$ 0,39; Pix 1,19%; boleto R$ 3,45; mais 0,7% do Billing | Pix cerca de R$ 294,33; cartão cerca de R$ 285,54 |
| [Mercado Pago](https://www.mercadopago.com.br/ferramentas-para-vender/assinaturas) | Sim (conta pessoal ou Conta Negócio) | Não: assinatura só com cartão ou saldo Mercado Pago | Não informado | Crédito 4,49% recebendo na hora | Cartão cerca de R$ 286,53 |
| Iugu | Não confirmado | Sim | Não informado | Pix 0,99%; boleto R$ 2,19 e cartão 3,34%, mais R$ 0,40 de processamento; tem mensalidade de plano | Depende da mensalidade |
| Pagar.me | Sem informação clara para o gateway online | — | — | — | Fora da comparação |

Plano B, se o Asaas não aprovar a conta ou mudar as condições: Stripe. É mais cara, mas tem a melhor experiência de integração e também aceita pessoa física. A integração fica atrás de uma interface (`GatewayPagamentoProvider`), no mesmo padrão do `ArmazenamentoService`, para a troca não mexer no resto do sistema.

**Opções em estudo:** ficam documentadas para comparação antes da decisão final no ADR, ou para uma troca futura se as condições mudarem. O que falta verificar em cada uma:

- **Stripe (plano B):** se emite NFS-e ou se exige um emissor separado; quanto o 0,7% do Billing pesa no volume esperado; prazo de recebimento no Brasil.
- **Iugu:** se aceita cadastro com CPF; valor da mensalidade e das taxas de configuração do plano; se emite NFS-e integrada; se, a partir de certo volume, a negociação de taxas compensa a mensalidade.
- **Mercado Pago:** se a assinatura passou a aceitar Pix ou boleto, ou continua só com cartão e saldo; taxa com recebimento em 30 dias; emissão de nota.
- **Pagar.me:** se o gateway online (não a maquininha) aceita pessoa física; taxas de Pix, boleto e cartão; recursos de assinatura e de nota.

Refazer a comparação com os preços da data do ADR e com o volume e o ticket esperados. A projeção de receita define quanto cada ponto percentual de taxa representa por mês.

**CPF ou CNPJ (atenção):** dá para começar recebendo como pessoa física, mas a nota fiscal de serviço do Asaas é voltada para quem tem CNPJ. Como os clientes serão construtoras, que vão exigir nota, na prática é preciso ter CNPJ antes de vender. O tipo de empresa e o enquadramento tributário para venda de software por assinatura são definidos com um contador, porque o imposto entra no preço dos planos.

**Modelo de dados (novo módulo "Assinaturas", já no formato modular da SPEC-09):**

| Tabela | Guarda |
| --- | --- |
| `plano` | código, nome, periodicidade (gratuito, mensal, anual), preço, limites (usuários, obras, armazenamento, módulos) e versão. Mudar preço cria uma versão nova, e quem já assina mantém o preço até o aviso de reajuste |
| `assinatura` | conta, plano, status, início, fim do período atual, "cancelar no fim do período", fim do prazo de arrependimento e id no gateway |
| `fatura` | valor, vencimento, status, link de pagamento, número e link da nota fiscal, id no gateway |
| `evento_pagamento` | webhooks recebidos: id externo único, payload, assinatura verificada, processado em, tentativas e erro |
| `historico_assinatura` | trilha imutável de toda mudança: quem, quando, de onde, de qual status para qual |

**Ciclo de vida da assinatura:**

1. **Gratuito** (SPEC-23). Toda conta começa aqui.
2. **Ativa:** pagamento confirmado pelo gateway. Libera os limites do plano.
3. **Em arrependimento:** nos 7 primeiros dias após a contratação, o cancelamento devolve 100% do valor, automaticamente pelo gateway, e cancela a nota. O CDC garante a desistência em até 7 dias nas contratações feitas fora do estabelecimento, como pela internet, com devolução do que foi pago ([Guardar Dinheiro](https://www.guardardinheiro.com.br/blog/como-cancelar-assinaturas-direitos)).
4. **Inadimplente:** pagamento falhou. O gateway tenta de novo e o cliente recebe aviso por e-mail e na tela, com 7 dias de carência e acesso normal.
5. **Suspensa:** carência vencida. Fica só leitura, com exportação liberada (LGPD); pagar reativa na hora.
6. **Cancelamento agendado:** o cliente cancelou depois dos 7 dias. Mantém o acesso até o fim do período pago e não renova.
7. **Encerrada:** a conta volta ao plano gratuito com os dados preservados. O que passar dos limites do gratuito fica só leitura. Contas sem uso por um prazo a definir são avisadas e depois excluídas (SPEC-20).

**Fluxos:**

- **Página pública de planos** com o comparativo mensal e anual (o anual com desconto) e o que cada plano inclui.
- **Checkout hospedado pelo gateway:** o cartão nunca passa pelo NordTool. Os dados fiscais da conta (CNPJ, endereço, inscrição municipal) são coletados para a nota.
- **Troca de plano:**
  - de mensal para anual, ou para um plano maior: imediato, com crédito proporcional;
  - para um plano menor: no fim do período, avisando quais limites serão ultrapassados.
- **Tela "Assinatura"**, só para o administrador da conta: plano atual, próxima cobrança, faturas e notas, trocar cartão (portal do gateway), trocar plano e cancelar.
- **Renovação:**
  - plano anual: aviso por e-mail 15 e 3 dias antes de renovar;
  - plano mensal: aviso junto com a fatura;
  - reajuste de preço avisado com 30 dias de antecedência, valendo só na renovação seguinte.

**Cancelamento (sem fricção):**

- **Pelo mesmo canal:** um botão na tela "Assinatura", em até dois cliques, disponível 24 horas e sem exigir ligação. O CDC exige que quem contrata pela internet ofereça o cancelamento pelo mesmo canal, e a Lei do SAC (Decreto 11.034/2022) pede esse tipo de solicitação disponível 24 horas por dia, nos mesmos meios da contratação ([InfoMoney](https://www.infomoney.com.br/?p=3109974)).
- **Comprovante:** confirmação na tela e por e-mail, com número de protocolo. O decreto exige isso dos serviços regulados; aqui é adotado como boa prática.
- **Motivo:** pergunta opcional, que nunca bloqueia o cancelamento.
- **Plano anual após os 7 dias:** a política de reembolso (proporcional ou não) é decidida com o jurídico e precisa estar nos termos antes da primeira venda.

**Diretrizes (termos de assinatura, junto com a SPEC-20):** o que cada plano inclui e seus limites, renovação automática, como cancelar, reembolso e arrependimento, inadimplência e suspensão, meta de disponibilidade, canal de suporte, reajuste e papéis na LGPD. O NordTool atua como operador dos dados que o cliente cadastra, e o cliente é o controlador, o que pede um acordo de tratamento de dados (DPA). O texto passa pelo jurídico e pelo contador antes de publicar.

**Segurança:**

- **Nenhum dado de cartão** armazenado ou trafegando pelo NordTool (checkout hospedado ou tokenização do gateway), o que reduz o escopo de PCI ao mínimo.
- **Webhooks:**
  - assinatura HMAC verificada e janela de tempo contra reenvio malicioso;
  - idempotência pelo id do evento (tabela `evento_pagamento`);
  - processamento assíncrono com retry e fila de falhas;
  - antes de mudar qualquer status, o backend reconsulta o gateway pela API, em vez de confiar no corpo do webhook.
- **Reconciliação diária** entre gateway e banco (assinaturas, faturas e notas); qualquer divergência gera alerta.
- **Limites aplicados no backend** pelo serviço de entitlements da SPEC-21; o front só esconde.
- **Ações de cobrança** (trocar plano, cancelar, mudar dados fiscais) exigem administrador da conta, 2FA (SPEC-12) e reautenticação.
- **Auditoria imutável** de todo evento de cobrança.
- **Backoffice:** cortesia ou desconto só com motivo registrado; ninguém altera status à mão sem deixar trilha.
- **Chaves do gateway** em secret por ambiente: sandbox em `develop`, produção só em produção, com rotação documentada.
- **Contra teste de cartão roubado:** rate limit e captcha (Turnstile) no cadastro e no checkout, mais o antifraude do gateway.

**Nota fiscal:** NFS-e emitida automaticamente a cada pagamento confirmado (pelo gateway ou por um provedor de emissão), enviada por e-mail e disponível na tela. Cancelada no arrependimento. O regime tributário e o código de serviço são confirmados com o contador.

**Métricas do negócio (SPEC-06):** receita recorrente mensal, cancelamentos, conversão do gratuito para pago e inadimplência, num painel e com alerta de queda.

**Critérios de aceite:**

- [ ] Uma conta gratuita assina o plano mensal e o anual no sandbox, recebe a nota e tem os limites liberados sem intervenção manual.
- [ ] O cancelamento pela tela leva no máximo dois cliques, gera protocolo por e-mail e mantém o acesso até o fim do período. Dentro de 7 dias, devolve 100% e cancela a nota.
- [ ] Pagamento recusado leva à carência, depois à suspensão só leitura, e o pagamento reativa na hora.
- [ ] Webhook com assinatura inválida é recusado; o mesmo webhook repetido não duplica nada; a reconciliação acusa uma divergência simulada.
- [ ] Nenhum dado de cartão aparece no banco, nos logs ou no tráfego do NordTool.
- [ ] Termos de assinatura revisados pelo jurídico e regime fiscal confirmado pelo contador.

**Depende de:** SPEC-21 (contas e limites), SPEC-12 itens 1 e 2 (senha forte e 2FA) e SPEC-20 parcial (termos e aceite). Gateway: Asaas, já decidido; o ADR registra a escolha no primeiro dia, e a conta (com CNPJ) precisa estar aprovada antes do início da integração.

**Prazo estimado:** 24 a 31 dias úteis (192 a 248 horas), sem contar o tempo de aprovação da conta no gateway e as revisões jurídica e contábil.
