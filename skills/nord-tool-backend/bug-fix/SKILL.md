# Backend: corrigir bug

1. Leia o perfil e steering do backend e rastreie o fluxo desde a API até a persistência.
2. Identifique a causa observável; confira logs e testes sem registrar dados sensíveis.
3. Faça uma correção pequena no ponto responsável e cubra regras de negócio somente em testes da classe `*ServiceImpl` correspondente, nomeados `*ServiceImplTest`, usando JUnit 5 e Mockito. Não adicione testes para controllers, DTOs/forms, repositories, handlers, configuração, filtros de segurança, utilitários ou integração. Se o comportamento não puder ser verificado por um `ServiceImpl`, registre a lacuna e descreva uma verificação manual objetiva.
4. Verifique efeitos em transações, dados existentes, API e scripts SQL relacionados.
5. Rode as verificações Maven pertinentes, relate exatamente a suíte executada e siga as policies globais de Git.
