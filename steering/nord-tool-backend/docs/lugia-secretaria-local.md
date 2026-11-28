# Secretária local: Ollama na sua máquina, falando com a nuvem

A Lugia (no `nord-tool-backend`, no Railway) conversa com um modelo rodando no **seu PC** pelo Ollama. O PC não abre nenhuma porta no
roteador: ele mesmo liga para a Cloudflare e mantém um **túnel reverso** de saída. A entrada pública desse túnel fica
fechada pelo **Cloudflare Access**, e só quem tem o *service token* (o backend do NordTool) passa.

## Arquitetura

```
 Navegador ──JWT──▶ backend (Railway) ──HTTPS + service token──▶ Cloudflare (Access) ──túnel de saída──▶ cloudflared ──▶ Ollama
 (NordTool)          fila, 1 por vez,        CF-Access-Client-Id         confere o token,       (conexão aberta    (seu PC)    127.0.0.1:11434
                     tempos-limite,          CF-Access-Client-Secret     bloqueia o resto       pelo PC, sem porta
                     disjuntor                                                                    aberta no roteador)
```

- **Login e permissão** continuam no NordTool: a pessoa só chega à Lugia com o JWT e o módulo `LUGIA`.
- **O backend é o único cliente do túnel.** O navegador nunca vê a URL do túnel nem o token.
- **O Ollama só escuta em 127.0.0.1.** Quem o alcança de fora é o `cloudflared`, que roda na mesma máquina.
- **O hardware é protegido em duas camadas:**
  - no backend, pelo `LugiaProtetor` (usado pelo `LugiaOllamaProvider`): fila curta, um pedido por vez, tempos-limite e disjuntor;
  - no Ollama, pelas variáveis abaixo: um pedido em paralelo, um modelo carregado e limite de contexto.

## 1. Ollama no PC

Instale o Ollama (ollama.com) e baixe um modelo que caiba na sua placa de vídeo:

| Placa de vídeo (VRAM) | Modelo sugerido | Comando |
|---|---|---|
| 6–8 GB | Qwen 2.5 7B ou Llama 3.1 8B (quantizado q4) | `ollama pull qwen2.5:7b` |
| 12 GB | Qwen 2.5 14B q4 | `ollama pull qwen2.5:14b` |
| 24 GB | Qwen 2.5 32B q4 | `ollama pull qwen2.5:32b` |
| só CPU | Qwen 2.5 3B (lento) | `ollama pull qwen2.5:3b` |

Variáveis do Ollama: no Windows, em "Variáveis de ambiente do usuário"; no Linux, no `systemctl edit ollama`, com `Environment=...`.

| Variável | Valor | Por quê |
|---|---|---|
| `OLLAMA_HOST` | `127.0.0.1:11434` | só a própria máquina acessa (nunca `0.0.0.0`) |
| `OLLAMA_NUM_PARALLEL` | `1` | um pedido gerando por vez: não divide a GPU |
| `OLLAMA_MAX_LOADED_MODELS` | `1` | um modelo na memória de vídeo |
| `OLLAMA_MAX_QUEUE` | `8` | fila interna curta (o backend já segura a dele) |
| `OLLAMA_KEEP_ALIVE` | `30m` | o modelo fica carregado 30 min depois do último uso e descarrega sozinho |
| `OLLAMA_ORIGINS` | *(não defina)* | ninguém chama o Ollama pelo navegador |

Reinicie o Ollama e teste: `curl http://127.0.0.1:11434/api/version`.

## 2. Túnel da Cloudflare (recomendado)

Precisa de um domínio na Cloudflare (pode ser um barato, só para isso).

1. **Instale o `cloudflared`:**
   - Windows: `winget install --id Cloudflare.cloudflared`;
   - Linux: pacote `.deb` ou `.rpm` do site da Cloudflare.
2. **Crie o túnel** e aponte um subdomínio para ele:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create secretaria
   cloudflared tunnel route dns secretaria ollama.seudominio.com
   ```
3. **Configure o túnel** em `~/.cloudflared/config.yml` (no Windows, `%USERPROFILE%\.cloudflared\config.yml`):
   ```yaml
   tunnel: secretaria
   credentials-file: /caminho/para/<id-do-tunel>.json
   ingress:
     - hostname: ollama.seudominio.com
       service: http://127.0.0.1:11434
       originRequest:
         httpHostHeader: "127.0.0.1:11434"   # o Ollama confere o Host
         connectTimeout: 10s
     - service: http_status:404               # qualquer outro nome: 404
   ```
4. **Deixe o túnel subir com o PC:** `cloudflared service install` (no Windows, em PowerShell como administrador).

## 3. Cloudflare Access: fechar a porta para todo mundo, menos a Lugia

No painel Zero Trust da Cloudflare:

1. **Access → Service Auth → Create Service Token** com o nome `nordtool-railway`. Copie o **Client ID** e o
   **Client Secret**: o secret aparece uma vez só.
2. **Access → Applications → Add → Self-hosted:**
   - **Domain:** `ollama.seudominio.com`;
   - **Policy:** *Action* = **Service Auth**, *Include* = **Service Token** `nordtool-railway`. Não crie nenhuma
     política *Allow* para pessoas: o navegador não tem por que entrar.
3. (Opcional) **Security → WAF → Rate limiting:** até 30 pedidos/min no `ollama.seudominio.com`.
4. **Teste:**
   - sem o token, `curl -i https://ollama.seudominio.com/api/version` tem de dar **403**;
   - com o token tem de responder:
     ```bash
     curl -H "CF-Access-Client-Id: <id>" -H "CF-Access-Client-Secret: <secret>" https://ollama.seudominio.com/api/version
     ```

## 4. Backend no Railway

Variáveis do serviço (o secret nunca vai para o código nem para o frontend):

```
OLLAMA_URL=https://ollama.seudominio.com
LUGIA_MODELOS_OLLAMA=qwen2.5:7b
CF_ACCESS_CLIENT_ID=<client id>
CF_ACCESS_CLIENT_SECRET=<client secret>
# opcionais (padrão entre parênteses)
OLLAMA_MAX_SIMULTANEOS=1        # (1) pedidos gerando ao mesmo tempo
OLLAMA_FILA_MAX=4               # (4) esperando a vez; acima disso, "ocupada"
OLLAMA_ESPERA_MAX_S=60          # (60) quanto tempo um pedido espera na fila
OLLAMA_PRIMEIRO_PEDACO_S=90     # (90) até a primeira palavra (inclui carregar o modelo)
OLLAMA_TIMEOUT_S=300            # (300) resposta inteira
OLLAMA_NUM_CTX=8192             # (8192) contexto; mais = mais VRAM
OLLAMA_MAX_TOKENS=1024          # (1024) tamanho máximo da resposta
OLLAMA_KEEP_ALIVE=30m           # (30m)
```

Com `OLLAMA_URL` pública sem HTTPS ou sem proteção (service token ou `OLLAMA_TOKEN`), a secretária local fica desligada e o backend avisa no log.

No chat da Lugia, o modelo aparece no grupo **"Secretária local (sua máquina)"**. Ele também entra **primeiro** no
modo Automático: se a máquina estiver desligada, o disjuntor recusa na hora e o Automático passa para as IAs
gratuitas da nuvem.

## O que o backend faz para não sobrecarregar o PC

| Situação | Comportamento |
|---|---|
| Já tem um pedido gerando | os próximos esperam numa fila de até 4 |
| Fila cheia | responde na hora "a secretária local está ocupada" (não empilha) |
| Esperou 60 s na fila | desiste e avisa |
| Modelo demorando para carregar | até 90 s pela primeira palavra; depois, até 300 s no total |
| A resposta passou do tempo total | a leitura é interrompida e a conexão fechada (o Ollama para de gerar) |
| PC desligado ou túnel parado | depois de 3 falhas seguidas, o disjuntor abre por 60 s e responde na hora "fora do ar", sem esperar o tempo-limite; então deixa um pedido de teste passar |
| Resposta longa | limitada a 1024 tokens e contexto de 8192 |

## Segurança: checklist

- [ ] O Ollama escuta só em `127.0.0.1` (`netstat -an | findstr 11434` mostra `127.0.0.1:11434`).
- [ ] Nenhuma porta aberta ou redirecionada no roteador.
- [ ] A aplicação do Access só tem a política Service Auth, e o `curl` sem token dá 403.
- [ ] O service token fica só nas variáveis do Railway (serviço do backend). Gire-o a cada 6–12 meses ou se vazar: crie um novo, troque no Railway e apague o antigo.
- [ ] `cloudflared` e Ollama atualizados.
- [ ] O PC tem antivírus e firewall ativos; o usuário do Windows tem senha.
- [ ] O túnel só leva ao Ollama (o `ingress` termina em `http_status:404`). Não exponha outros serviços no mesmo túnel sem Access.

## Alternativa: ngrok

Se não tiver domínio na Cloudflare:
- crie um domínio estático no ngrok;
- exija um cabeçalho secreto com uma *traffic policy* (`expressions: ["req.headers['authorization'][0] != 'Bearer <token>'"]` → `deny`);
- suba o túnel com `ngrok http 127.0.0.1:11434 --url=<seu-dominio>.ngrok-free.app --host-header=127.0.0.1:11434 --traffic-policy-file=politica.yml`;
- no backend, use `OLLAMA_URL=https://<seu-dominio>.ngrok-free.app` e `OLLAMA_TOKEN=<token>`.

O plano grátis do ngrok tem limite de tráfego e uma página de aviso no navegador, que não afeta o backend.
