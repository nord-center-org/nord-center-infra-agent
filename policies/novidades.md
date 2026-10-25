# Novidades no Lugia Nexus

O Lugia Nexus é o mascote da tela inicial do NordTool. Ele conta às pessoas o que mudou no app.

**Toda entrega que muda algo visível para quem usa o NordTool**, em qualquer repositório (frontend, backend, SQL, `lugia-center`), acrescenta uma entrada no topo de `NOVIDADES` em `nord-tool-frontend/src/react-app/utils/novidades.ts`, no mesmo PR da mudança no frontend. Se a mudança não tocar o frontend, abra um PR no frontend só com a entrada.

Cada entrada tem:

- `id` único e estável: `AAAA-MM-DD-assunto`;
- `data` da publicação (`AAAA-MM-DD`);
- `titulo` curto e `texto` de uma ou duas frases, escritos para quem usa o app, sem jargão técnico;
- `onde`: o caminho no menu (`rotulo`) e a rota (`caminho`) para ver a novidade, quando houver uma tela.

Mudanças só internas (refatoração, testes, CI, documentação) não entram. Os testes de `utils/novidades.test.ts` garantem ids únicos e a ordem da mais nova para a mais antiga.
