# Help Dev Junior

## Resumo
O **Help Dev Junior** é uma ferramenta web interativa e didática, projetada para auxiliar estudantes e desenvolvedores em início de carreira a compreenderem os fundamentos do desenvolvimento front-end. A aplicação oferece duas funcionalidades principais: uma busca rápida por termos (tags HTML, propriedades CSS e palavras-chave JavaScript) e um analisador que comenta automaticamente blocos de código, explicando cada elemento encontrado.

Seu objetivo é servir como um dicionário dinâmico e um assistente de estudos, acelerando o aprendizado e a consulta de conceitos essenciais.

---

## Descrição do Projeto

O projeto nasceu da necessidade de criar um ambiente de apoio para quem está dando os primeiros passos no mundo do desenvolvimento web. A curva de aprendizado inicial pode ser íngreme, com uma vasta quantidade de tags, propriedades e conceitos de programação para memorizar. Esta ferramenta foi concebida para achatar essa curva, funcionando como um "tutor de código" sempre à disposição.

Com uma interface limpa e intuitiva, o projeto se divide em duas grandes áreas de interação:

1.  **Busca Rápida:** Um campo de busca no topo da página permite ao usuário digitar um termo e receber instantaneamente sua descrição, tipo (HTML, CSS ou JS) e um link direto para a documentação oficial na MDN (Mozilla Developer Network).
2.  **Analisador de Código:** Uma área de texto permite que o usuário cole um bloco de código. Ao clicar em "Comentar", a ferramenta analisa linha por linha, identifica termos conhecidos usando expressões regulares (RegExp) e exibe o código na área de resultados, enriquecido com comentários explicativos ao lado de cada linha relevante.

### Propósito Didático
Todo o projeto foi desenvolvido com um foco educacional, não apenas em sua funcionalidade, mas também em seu próprio código-fonte. Os arquivos `index.html`, `style.css` e `script.js` estão extensivamente comentados para que outros estudantes possam ler, entender e aprender com a implementação.

---

## Arquitetura Técnica

A arquitetura do projeto foi pensada para ser escalável e de fácil manutenção. Em vez de manter as definições fixas no código (hardcoded), a aplicação carrega dinamicamente todas as informações a partir de arquivos `.json`.

* **Arquivo Mestre (`linguagens.json`):** Centraliza os metadados de cada linguagem suportada (como nome, formato de comentário e o caminho para seu arquivo de dados específico).
* **Escalabilidade:** Para adicionar suporte a uma nova linguagem ou expandir o conhecimento sobre as existentes, basta editar ou adicionar arquivos JSON, sem a necessidade de alterar a lógica principal do JavaScript.

---

## Funcionalidades Principais

### Busca de Termos
* Campo de busca para consulta rápida de tags HTML, propriedades CSS e palavras-chave JavaScript.
* Exibição instantânea da descrição, tipo da linguagem e um link para a documentação oficial na MDN.
* Interface limpa e feedback claro caso o termo não seja encontrado.

### Análise e Comentário de Código
* Área de texto para inserção de blocos de código (HTML, CSS e/ou JS).
* Análise linha por linha que identifica múltiplos termos em uma mesma linha.
* Agrupamento inteligente de comentários por linguagem, aplicando a sintaxe correta para cada uma (`` para HTML, `/* */` para CSS e `//` para JS).
* Lógica de detecção aprimorada para evitar falsos positivos (ex: diferenciação entre `var` do JavaScript e a função `var()` do CSS).

### Cópia de Código
* Botão "Copiar Código" que permite ao usuário copiar todo o código comentado para a área de transferência.
* Feedback visual ("Copiado!") para confirmar o sucesso da operação.

### Interface e Responsividade
* Layout adaptável a diferentes tamanhos de tela, de desktops a dispositivos móveis.
* Arquitetura dinâmica baseada em carregamento de dados externos.

---

## Como Executar

Para visualizar o projeto,
Acesse: https://g-opec.github.io/helpDevJunior/
ou clone este repositório e abra o arquivo `index.html` em seu navegador. Recomenda-se o uso de um servidor local simples (como o Live Server do VS Code) para garantir o carregamento correto dos arquivos JSON.
