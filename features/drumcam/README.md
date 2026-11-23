# Drumcam

| | |
|---|---|
| Slug | `drumcam` |
| Status | ativa |
| Versão atual | [v3](v3.md) |
| Repositórios | nord-tool-backend, nord-tool-frontend |
| Onde no app | Repertório → Drumcam, e o modo câmera dentro do app NordTool (6.0+) |

## O que faz

Um app Android (APK) que transforma um celular antigo em câmera fixa e outro celular em controle. A câmera fica parada no local, por exemplo na igreja, ligada na tomada e de tela apagada. Pelo controle, no mesmo Wi-Fi, a pessoa vê a prévia, manda gravar e parar, vê e baixa os vídeos. Também publica direto no YouTube, com título no padrão, descrição, tags, playlist e uma thumb escolhida da biblioteca salva. Quem envia o vídeo ao YouTube é o próprio celular-câmera, então o arquivo pesado não passa pelo celular do controle.

## Regras de negócio vigentes

- **RN-01** Um único APK com dois modos, escolhidos na primeira abertura e lembrados: câmera ou controle. _(v1)_
- **RN-02** Os dois celulares precisam estar no mesmo Wi-Fi. A câmera se anuncia na rede (NSD `_drumcam._tcp`) e o controle a acha sozinho; também dá para digitar o endereço `IP:porta` mostrado na câmera. _(v1)_
- **RN-03** Todo comando exige o PIN de 6 dígitos mostrado na tela e na notificação da câmera. Depois de 10 PINs errados, o IP fica bloqueado por 5 minutos. O PIN pode ser trocado pelo painel. _(v1)_
- **RN-04** A câmera fica ativa em segundo plano (serviço com notificação fixa), segurando CPU e Wi-Fi, e tenta voltar sozinha quando o celular reinicia. _(v1)_
- **RN-05** A prévia só existe fora da gravação. A câmera se fecha sozinha 20 s depois do último pedido de prévia, para economizar bateria e evitar calor. _(v1)_
- **RN-06** A gravação é em 1080p, ou 720p quando o aparelho não tem 1080p ou a pessoa escolhe, com vídeo até 12 Mbit/s e áudio AAC de 192 kbit/s. O celular pode ficar em pé ou deitado. O áudio vem do microfone ativo (o iRig, quando ligado), e há a opção "sem processamento" para não comprimir a bateria. _(v1)_
- **RN-07** Perto de 3,8 GB, abaixo do limite de 4 GB do MP4 de muitos aparelhos, a gravação continua num arquivo novo (`-p2`, `-p3`…). _(v1)_
- **RN-08** O título vem do modelo `{evento} - {musica} - Drumcam {data}`, editável. A data é a da gravação; o último evento usado vem preenchido. Descrição e tags também têm modelo. _(v1)_
- **RN-09** As thumbs ficam salvas no celular-câmera, reduzidas no controle para no máximo 1280×720 e 2 MB, o limite do YouTube. Na publicação a pessoa escolhe uma ou nenhuma. _(v1)_
- **RN-10** O login no YouTube usa o fluxo de dispositivo do Google: a câmera mostra um código, e a pessoa confirma em google.com/device. As credenciais OAuth (tipo "TVs e dispositivos de entrada limitada") são criadas pelo dono do canal e ficam só no celular-câmera. O painel nunca devolve o segredo. _(v1)_
- **RN-11** O envio é retomável. Se a rede cair, a câmera pergunta ao YouTube até onde chegou e continua de lá. Ao religar o serviço, os envios pendentes recomeçam. Thumb e playlist são aplicadas depois; se falharem, o vídeo fica publicado com um aviso. _(v1)_
- **RN-12** A visibilidade padrão é privada. Enquanto o projeto da API não passar pela auditoria do YouTube, o YouTube força privado em qualquer escolha. _(v1)_
- **RN-13** Não dá para apagar nem publicar o vídeo que está sendo gravado, nem apagar um vídeo no meio do envio. _(v1)_
- **RN-14** O Drumcam faz parte do app NordTool (6.0+): em Repertório → Drumcam, dentro do app, "Usar este celular como câmera" liga o modo câmera e "Controlar no Wi-Fi" acha a câmera e abre o painel completo. O app Drumcam separado (`drumcam.apk`) deixa de ser necessário. _(v2)_
- **RN-15** Pela internet, de qualquer lugar: a câmera fica conectada ao relé do NordTool com a conta do app (aparelho registrado), e Repertório → Drumcam lista as câmeras da mesma conta e abre o painel ali mesmo. Só a mesma pessoa alcança as próprias câmeras; o PIN não é pedido porque a conta já autoriza. _(v2)_
- **RN-16** Pela internet passam comandos, estado, prévia e thumbs (até 1 MB por resposta; thumbs enviadas pela internet até 900 KB). O vídeo não desce pela internet: baixar só no mesmo Wi-Fi; publicar no YouTube continua indo direto da câmera. _(v2)_
- **RN-17** No computador, no mesmo Wi-Fi, Repertório → Drumcam abre o endereço da câmera (`IP:porta`) no navegador, com o PIN. _(v2)_
- **RN-18** A sub-aba Drumcam do Repertório passa a se chamar **Estúdio** (`?aba=estudio`; o link antigo `?aba=drumcam` continua abrindo), com visual de mesa de transmissão e quatro partes: Estúdio, Monitoramento, Galeria e Câmeras. _(v3)_
- **RN-19** Câmera ao vivo: qualquer aparelho da conta (celular no app NordTool 8.0+ ou no navegador, ou um notebook com webcam) vira câmera em "Ser câmera". A imagem e o som vão por WebRTC direto para cada painel; o relé só passa o sinal (oferta, resposta e candidatos), sempre entre aparelhos da mesma conta. Até 9 câmeras por conta. A câmera mostra quantos estão vendo, mantém a tela ligada e pode escurecer a tela sem parar. _(v3)_
- **RN-20** A qualidade da transmissão segue o uso: baixa na grade do monitoramento (fluida, com pouca banda), média no estúdio e alta na tela cheia; quando duas telas usam a mesma câmera, vale a maior. _(v3)_
- **RN-21** Estúdio: escolher quais câmeras entram no vídeo (Fontes), a cena (lado a lado, janelinha, destaque, grade, empilhado, uma câmera) e o formato (16:9, 9:16, 1:1); arrastar e redimensionar cada câmera no programa (com ou sem manter a proporção), mudar a ordem, esconder, espelhar, preencher ou caber, cantos arredondados e posição numérica. _(v3)_
- **RN-22** Filtros por câmera: brilho, contraste, saturação, temperatura, matiz, preto e branco, sépia, desfoque e vinheta, com predefinições (Vívido, Palco, P&B, Sépia, Quente, Frio, Cinema); duplo clique volta ao padrão. _(v3)_
- **RN-23** Mixer de áudio: volume de cada câmera (até +6 dB) com medidor, mudo, solo, pan e volume mestre; dá para ouvir a mistura neste aparelho (desligado por padrão, para não microfonar). _(v3)_
- **RN-24** Gravação "Rápido": grava o programa ao vivo (até 1080p, 30 fps, MP4 quando o navegador grava MP4; senão WebM). "Alta qualidade": cada câmera também grava no próprio aparelho (8 Mbit/s, em partes guardadas no aparelho); ao parar, os arquivos vêm pelo WebRTC e o NordTool monta o vídeo com a mesma cena, filtros e volumes, alinhando as câmeras pelo relógio; leva o tempo do vídeo. A versão rápida fica salva de qualquer forma. _(v3)_
- **RN-25** Galeria: vídeos, clipes e fotos ficam neste aparelho e tocam ali mesmo, sem baixar; dá para renomear, baixar e apagar. Ao terminar uma gravação, a Galeria abre direto no vídeo. _(v3)_
- **RN-26** Monitoramento: todas as câmeras ao vivo em grade (automática, 2×2 ou 3×3) com nome, situação, bateria, gravando e data e hora; tocar numa abre a tela cheia, com zoom por pinça, rodinha ou botões (0,5×, 1×, 2×…; 0,5× e o tele trocam de lente, e sem zoom próprio o zoom é digital), duplo toque volta a 1×, foto na resolução cheia, clipe de 30 s, ouvir, lanterna, microfone, lente, resolução (até 4K) e renomear a câmera. _(v3)_
- **RN-27** Detecção de movimento (neste aparelho, com a tela aberta): compara quadros pequenos de cada câmera; com movimento em quadros seguidos, a câmera pisca em vermelho e entra na lista de Eventos, com bipe, notificação do aparelho (opcional) e clipe de 15 s na Galeria (opcional); sensibilidade de 1 a 10 e no máximo um aviso a cada 10 s por câmera. _(v3)_
- **RN-28** A câmera do app da v1/v2 (grava no celular, publica no YouTube, Wi-Fi com PIN) continua em Estúdio → Câmeras. _(v3)_

## Onde está no código

- **Frontend:**
  - `drumcam/`: projeto Gradle separado do app NordTool (`br.com.nordtool.drumcam`, minSdk 21, sem bibliotecas), com:
    - `Gravador.java`: câmera e gravação;
    - `Servidor.java`: HTTP mínimo;
    - `ServicoCamera.java`: rotas do painel, PIN, NSD e travas;
    - `YouTube.java`: login e envio;
    - `Videos.java`: arquivos e metadados;
    - `ControleActivity.java`: descoberta e WebView;
    - `assets/painel.html`: painel servido pela câmera.
  - `public/app/drumcam.apk`: o APK publicado.

## Versões

| Versão | Data | Resumo | Branch | PRs |
|---|---|---|---|---|
| [v1](v1.md) | 2026-11-22 | App câmera + controle no mesmo Wi-Fi, com publicação no YouTube | `feature-drumcam` | [frontend#232](https://github.com/nord-center-org/nord-tool-frontend/pull/232), [infra#103](https://github.com/nord-center-org/nord-center-infra-agent/pull/103) |
| [v2](v2.md) | 2026-11-23 | No Repertório e dentro do app NordTool 6.0, no Wi-Fi e pela internet (relé do NordTool) | `feature-drumcam-v2` | backend, frontend (links nos PRs), infra (este PR) |
| [v3](v3.md) | 2026-11-23 | Estúdio: várias câmeras ao vivo (WebRTC), cenas, filtros, mixer, gravação rápida e em alta qualidade, galeria e monitoramento | `feature-drumcam-v3` | backend, frontend (links nos PRs), infra (este PR) |

## Correções

| Data | Branch | O que foi corrigido | PRs |
|---|---|---|---|

## Dependências e impactos

Desde a v2 depende do backend só para o relé (`/drumcam/bilhete` e o WebSocket `/drumcam/ws`, em memória, sem banco) e vive dentro do app NordTool ([app-android](../app-android/README.md) v5, APK 6.0, assinado com a chave do NordTool). O painel é um arquivo só (`public/drumcam/painel.html`), servido pela câmera no Wi-Fi e pelo NordTool no modo relé. O `drumcam/` da v1 continua no repositório, mas não precisa mais ser instalado.
