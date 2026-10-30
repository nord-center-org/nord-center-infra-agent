# Frontend: Escadinha — leitura de projetos e modelo do pavimento

Use ao mexer na importação de projetos da Escadinha (`utils/projetoPacote.ts`, `projetoVetorial.ts`, `projetoPdfVetor.ts`, `escadinhaComodos.ts`, `zip.ts`), na planta 2D ou no 3D do pavimento.

## Método (o mesmo do protótipo do Juan no Blender)

1. **Isole um pavimento tipo antes de replicar.** O modelo nasce da 1ª fiada do *pavimento tipo* (prancha `EST-…-MOD-TI?`, título "…PAVIMENTO TIPO…"). Subsolo (`PSA`), térreo/transfer (`TE?`) e barrilete/cobertura (`CO?`) têm outra planta e nunca são base.
2. **Paredes reais = blocos da 1ª fiada** (retângulos 9/14/19 cm na escala da prancha, tipo pela legenda). Pedaço curto solto (< 50 cm sem encostar em parede) é símbolo, não parede.
3. **Vão na 1ª fiada é porta** (a janela tem peitoril, a fiada continua): vão de 0,55–1,10 m entre trechos da mesma parede ou da ponta de parede até a parede perpendicular. Corredor (≥ 1,2 m) nunca é porta.
4. **Cômodos** = regiões livres com os vãos fechados e o contorno da torre como limite. **Hall** = cômodo com mais portas (+ trechos compridos ligados a ele). **Apartamento** = cômodos ligados por porta sem passar pelo hall, ≥ 22 m², com entrada pelo hall; grupo com o dobro da área típica e duas entradas é partido entre as entradas.
5. **Pavimentos** saem do corte esquemático votado entre todas as pranchas da torre (nome mais citado por cota; nome repetido vira o pavimento que falta).
6. **Lados A/B** pela junta de dilatação escrita na 1ª fiada.
7. **Torre sem tipo próprio** usa o da torre gêmea só quando o projeto diz que é a mesma tipologia ("TORRES 1 E 3"), e avisa no checklist.

## Pacote do Construcode

- Leia o ZIP por partes (`indiceZip`/`extrairDoZip`): pacotes de obra passam de 600 MB.
- Só a revisão mais nova de cada prancha (`revisoesVigentes`: R04 > T04 > R03).
- Só desenhe (pdf.js) fôrma, 1ª fiada e graute da estrutura; o resto entra pelo nome (disciplina, torre pelo código `TIA/TOB/TAC`).
- A arquitetura do Construcode vem com texto em curvas: não dá para ler nomes de cômodos dela sem OCR.

## Status da escadinha

Marcados no pavimento (aba Modelo 3D): executado, em execução, não se aplica. Calculados pelas datas: atrasado, atrasada em execução, atraso com anterior pendente, dentro do período do ciclo (janela correndo, ainda depende da anterior), meta do ciclo (janela correndo e liberada), vazio. A grade "A Escadinha" é só reflexo.

## Validação

- Testes puros em `escadinhaComodos.test.ts`, `projetoVetorial.test.ts`, `escadinhaCury.test.ts` (`npm test`).
- Para conferir com projeto real, rode o pipeline em node (pdfjs `legacy/build/pdf.mjs`) sobre o ZIP e desenhe paredes/cômodos num PNG; na Next Guarulhos (5875) o esperado é T1 = 19, T2 = 18, T3 = 19 apartamentos por andar e pavimentos 1º ao 24º (T3 até o 23º).
