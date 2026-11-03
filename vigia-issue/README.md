# Vigia de issue

Um chat com a IA pela issue do GitHub, sem pagar API. Você escreve o pedido como comentário numa issue. Um script no seu computador olha a issue a cada 30 segundos, o que é de graça e não usa IA. Quando chega um comentário seu, ele entrega o pedido ao **Gemini CLI** (logado com a sua conta Google) ou ao **Claude Code** (logado com a sua assinatura), rodando no próprio computador. A IA faz o trabalho seguindo as regras deste repositório (branch, PR para `develop`, squash merge com CI verde) e o vigia responde na issue.

- A IA só é chamada quando chega pedido. Esperar não gasta nada.
- Só são executados comentários de quem está em `AUTORIZADOS`. Comentário de qualquer outra pessoa é ignorado.
- As respostas do vigia levam uma marca invisível e nunca são tratadas como pedido.
- Os comentários que já estavam na issue quando o vigia começou não são executados.
- Um pedido por vez. O que chegar enquanto um roda espera a vez.

## Instalação (uma vez)

1. **Node 18 ou mais novo:** <https://nodejs.org> (versão LTS).
2. **A IA, logada com a sua conta (sem chave de API):**
   - Gemini: `npm install -g @google/gemini-cli` e depois rode `gemini` uma vez e escolha **entrar com o Google**.
   - Claude: `npm install -g @anthropic-ai/claude-code` e depois rode `claude` uma vez e entre com a sua assinatura.
3. **Git e GitHub nesta máquina:** a IA faz commit, push e abre PR com o seu login. Instale o Git e o GitHub CLI (`gh`) e rode `gh auth login`.
4. **Os repositórios** clonados numa mesma pasta, por exemplo `C:\Users\voce\nord`:
   ```
   git clone https://github.com/nord-center-org/nord-tool-frontend
   git clone https://github.com/nord-center-org/nord-tool-backend
   git clone https://github.com/nord-center-org/nord-tool-scripts-sql
   git clone https://github.com/nord-center-org/nord-center-infra-agent
   ```
5. **A issue do chat:** crie uma issue (ex.: "Chat com o agente") e anote o número.
6. **Token para o vigia ler e responder a issue:** GitHub → Settings → Developer settings → *Fine-grained tokens* → acesso só ao repositório da issue, com **Issues: Read and write**. Esse token é só do vigia; a IA usa o login do passo 3.
7. Nesta pasta (`vigia-issue`), copie `.env.exemplo` para `.env` e preencha. O `.env` está no `.gitignore` e nunca vai para o Git.

## Usar

```
cd nord-center-infra-agent/vigia-issue
node vigia.mjs
```

Deixe a janela aberta (o computador precisa estar ligado e com internet). Escreva o pedido como comentário na issue. Em até 30 s aparece 👀 e "Recebi". Ao terminar, o vigia responde com o resumo e os links dos PRs e marca o pedido com 👍. Se der erro, marca com 😕.

Para trocar de IA, mude `AGENTE` no `.env` e reinicie.

## Cuidados

- A IA roda **com permissão para editar arquivos e rodar comandos na `PASTA_TRABALHO`**. Use uma pasta só para isso, com os clones, e não a pasta onde você trabalha à mão.
- O Gemini CLI roda com `--yolo` (aprova as ações sozinho), porque não tem ninguém olhando para aprovar. O Claude Code roda com edição liberada e as ferramentas da lista em `lib.mjs`. Dá para trocar em `AGENTE_ARGS`.
- As cotas gratuitas são do Google e da Anthropic e mudam de tempos em tempos. Pedido grande gasta mais.
- Testes do script: `node --test vigia-issue/lib.test.mjs`.
