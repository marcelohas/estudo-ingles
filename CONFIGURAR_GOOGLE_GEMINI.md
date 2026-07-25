# Google + Gemini no portal de inglês

O portal usa a mesma solução do Lumina Reader:

- Google Identity Services;
- OAuth 2.0 no navegador;
- token temporário da conta Google;
- chamada direta ao Gemini com `Authorization: Bearer`;
- nenhuma chave do Gemini armazenada no código.

O Client ID público já usado pelo Lumina Reader foi reutilizado. Como os dois
projetos estão no mesmo domínio (`marcelohas.github.io`), a origem JavaScript é
a mesma.

## Verificações no Google Cloud

No projeto associado ao Client ID:

1. mantenha `https://marcelohas.github.io` em **Authorized JavaScript origins**;
2. confirme que a Generative Language API está habilitada;
3. confirme que a tela de consentimento OAuth permite os escopos solicitados;
4. se o aplicativo estiver em modo de teste, inclua sua conta Google em
   **Test users**.

O token fica somente na memória da página. Ao atualizar ou fechar o portal, é
necessário conectar a conta novamente. O portal não armazena senha nem token em
`localStorage`.
