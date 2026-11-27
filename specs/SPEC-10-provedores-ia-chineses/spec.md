# SPEC-10 — Spec

> Copiado do plano de origem ("NordTool — Plano de specs", 26/11/2026). A situação atual ainda não foi conferida no código: confira antes de escrever o plano de implementação (policies/specs.md, seção 3).

**No MVP:** fica fora, junto com a Lugia. Quando a Lugia entrar na venda, os provedores e o custo de IA entram como cota por plano.

**Origem:** R ("usar providers para AI chinesas"); contexto das anotações de Ollama/OpenCode com `qwen2.5-coder`.

**O que é:** adicionar modelos como DeepSeek, Qwen (Alibaba), Kimi (Moonshot) e GLM (Zhipu) como opções na Lugia e nos agentes de código. O motivo costuma ser custo baixo e bom desempenho em código. A maioria desses provedores expõe API compatível com a da OpenAI, o que simplifica a integração; confirmar endpoint por endpoint.

**Situação atual:**

- A Lugia já é multi-provedor: Claude pelo SDK, e ChatGPT, Gemini, Groq e OpenRouter por HTTP, cada um ligado por chave + lista de modelos em variável de ambiente.
- O OpenRouter já serve modelos DeepSeek e Qwen. O teste mais rápido é só configurar `LUGIA_MODELOS_OPENROUTER`, sem código novo.
- Cada provedor novo hoje parece exigir código próprio. Conferir se OpenAI, Groq e OpenRouter já compartilham um cliente.

**Ponto de atenção — dados:** a Lugia recebe dados financeiros e pessoais (Financeiro, Casamento, anexos). Mandar isso para a API hospedada na China é transferência internacional de dados pessoais, com implicações de LGPD. Os modelos de pesos abertos (DeepSeek, Qwen) também rodam fora da China: OpenRouter com roteamento de provedor, Groq ou Ollama local. A escolha de onde rodar precisa ser uma decisão registrada.

**O que fazer:**

1. **Provedor genérico compatível com a OpenAI.** Uma configuração em lista (`nome`, `baseUrl`, variável da chave, modelos, suporta imagem sim ou não), para que adicionar provedor seja só configuração. Mesmo tratamento de erro e repetição em 429/5xx que já existe.
2. **Configurar os provedores escolhidos** sem modelo padrão fixo no código (os ids mudam com frequência, mesma regra já usada para a OpenAI).
3. **Política de dados (ADR):** quais módulos ou dados podem ir para cada provedor. Uma opção é marcar o provedor como "sem dados pessoais" e esconder ele quando a conversa tiver anexos ou contexto de módulos sensíveis. O modo agente (escrita em repositório) continua só com o provedor atual até decisão contrária.
4. **Agentes de código:** documentar na infra como usar esses modelos no OpenCode (provider próprio ou via Ollama local) e quais subagentes da SPEC-02 podem usá-los. Exemplo: Revisor e Testes, sim; Segurança, a decidir.
5. **Medir** latência, erro e custo por provedor (SPEC-06), para comparar com os atuais.

**Critérios de aceite:**

- [ ] Pelo menos um modelo chinês responde na Lugia com streaming SSE, via configuração.
- [ ] Adicionar um segundo provedor compatível não exige código novo.
- [ ] A regra de dados está implementada e coberta no `LugiaServiceImplTest`.
- [ ] Os provedores novos aparecem nas métricas por provedor.

**Depende de:** nada para o teste via OpenRouter. A política de dados deve ser decidida antes de liberar para todos os usuários.

**Prazo estimado:** 5 a 6 dias úteis (40 a 48 horas).
