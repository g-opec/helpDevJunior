// Adiciona um ouvinte de evento que espera o DOM (a estrutura da página) ser completamente carregado antes de executar o script.
document.addEventListener('DOMContentLoaded', () => { 
    const buscaInput = document.getElementById('buscaInput');
    const botaoBusca = document.getElementById('botao-busca');
    const searchResultDisplay = document.getElementById('search-result-display');
    const resultadoComentarioDiv = document.getElementById('resultado-comentario');
    const codigoInput = document.getElementById('codigoInput');
    const botaoComentar = document.getElementById('botao-comentar');
    const botaoCopiar = document.getElementById('botao-copiar');

    let todosOsDados = [];
    let linguagensInfo = new Map(); // Armazenará os metadados das linguagens pelo ID

    // Função para carregar os dados dos arquivos JSON
    // 'async' indica que esta função pode executar operações assíncronas (como 'fetch') sem bloquear o resto do código.
    async function carregarDados() { 
        try {
            // 1. Carrega o arquivo principal de linguagens
            const linguagensRes = await fetch('linguagens.json');
            const linguagensArray = await linguagensRes.json();

            // 2. Mapeia as informações e prepara os fetches para os dados de cada linguagem
            const fetches = linguagensArray.map(lang => {
                linguagensInfo.set(lang.id, lang); // Guarda os metadados (incluindo formato do comentário)
                return fetch(lang.arquivoDados).then(res => res.json());
            });

            // 3. Carrega todos os arquivos de dados em paralelo
            // 'Promise.all' aguarda que todas as requisições 'fetch' na lista sejam concluídas.
            const todosOsDadosPorLinguagem = await Promise.all(fetches); 

            // 4. Junta todos os dados em um único array, adicionando o tipo
            todosOsDados = [];
            linguagensArray.forEach((lang, index) => {
                const dadosDaLinguagem = todosOsDadosPorLinguagem[index];
                dadosDaLinguagem.forEach(item => item.tipo = lang.id); // Usa o 'id' como tipo
                todosOsDados.push(...dadosDaLinguagem);
            });

        } catch (error) { // O bloco 'catch' é executado se ocorrer qualquer erro no bloco 'try'.
            console.error("Erro ao carregar os dados:", error);
            searchResultDisplay.innerHTML = `<p class="erro">Não foi possível carregar as definições. Verifique o console para mais detalhes.</p>`;
        }
    }

    // Função para a busca simples
    function buscarTermo() {
        // Limpa os resultados de buscas ou análises anteriores para uma nova exibição.
        searchResultDisplay.innerHTML = '';
        resultadoComentarioDiv.innerHTML = '';

        // Garante que o botão de copiar não seja exibido na busca simples.
        botaoCopiar.style.display = 'none';

        const termo = buscaInput.value.toLowerCase().trim();
        if (!termo) {
            return;
        }

        const encontrado = todosOsDados.find(item => item.nome.toLowerCase() === termo);

        if (encontrado) {
            // Escapa caracteres HTML no nome e na descrição para evitar que o navegador os renderize como tags.
            const nomeHtml = encontrado.nome.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const descricaoHtml = encontrado.descricao.replace(/</g, "&lt;").replace(/>/g, "&gt;");

            // Limpa o nome para usar na URL (ex: "<h1>" vira "h1") e codifica para a URL
            const termoParaUrl = encodeURIComponent(encontrado.nome.replace(/[<>]/g, ''));
            const docLink = `https://developer.mozilla.org/search?q=${termoParaUrl}`;

            // Insere o HTML com o resultado formatado na área de exibição.
            searchResultDisplay.innerHTML = `
                <h3>${nomeHtml}</h3>
                <p>${descricaoHtml}</p>
                <div class="info-adicional">
                    <span class="tipo-tag">${encontrado.tipo.toUpperCase()}</span>
                    <a href="${docLink}" target="_blank" class="doc-link">Documentação</a>
                </div>
            `;
        } else {
            searchResultDisplay.innerHTML = `<p>Nenhuma descrição encontrada para "${termo}".</p>`;
        }
    }

    // Função para comentar o código
    function comentarCodigo() {
        // Limpa os resultados de buscas ou análises anteriores.
        searchResultDisplay.innerHTML = '';
        resultadoComentarioDiv.innerHTML = '';
 
        // Garante que o botão de copiar comece oculto
        botaoCopiar.style.display = 'none';

        const codigo = codigoInput.value;
        if (!codigo.trim()) {
            return;
        }

        // Cria um mapa (um dicionário chave-valor) para acesso rápido às descrições pelo nome do termo.
        const mapaDeDescricoes = new Map(todosOsDados.map(item => {
            const nomeLimpo = item.nome.replace(/[<>]/g, '').split(' ')[0];
            return [nomeLimpo, { descricao: item.descricao, tipo: item.tipo }];
        }));

        const termosDeBusca = Array.from(mapaDeDescricoes.keys());

        // Constrói a regex de forma mais inteligente para evitar falsos positivos
        const termosRegex = termosDeBusca.map(termo => {
            if (termo === 'var') {
                // Para 'var', usa um lookahead negativo para não corresponder se for seguido por '('
                return `\\b${termo}\\b(?!\\()`;
            }
            return `\\b${termo}\\b`;
        }).join('|');
        // Cria a expressão regular final. Ex: /(?<!</)(\bdiv\b|\bspan\b|\bvar\b(?!\())/g
        const regex = new RegExp(`(?<!</)(${termosRegex})`, 'g');
        const linhas = codigo.split('\n');
        let htmlResultante = '';

        linhas.forEach((linha, index) => {
            // Escapa caracteres HTML para exibição segura
            let linhaHtml = linha.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            // Cria uma cópia da linha para realizar a busca, evitando que a regex atue sobre as descrições.
            const linhaParaBusca = linha;

            // Objeto para agrupar comentários por tipo (js, css, html), usando Sets para evitar descrições duplicadas.
            const comentariosPorTipo = {
                js: new Set(),
                css: new Set(),
                html: new Set()
            };

            // Encontra todas as correspondências na linha
            const matches = linhaParaBusca.match(regex);

            if (matches) {
                matches.forEach(match => {
                    const info = mapaDeDescricoes.get(match);
                    // Adiciona a descrição ao Set do tipo correspondente
                    if (info && comentariosPorTipo[info.tipo]) {
                        comentariosPorTipo[info.tipo].add(info.descricao);
                    }
                });
            }

            let comentariosHtml = [];
            // Itera sobre os tipos de comentários encontrados (js, css, html)
            for (const tipo in comentariosPorTipo) {
                if (comentariosPorTipo[tipo].size > 0) {
                    // Busca as informações da linguagem (como o formato do comentário) no mapa 'linguagensInfo'.
                    const infoLinguagem = linguagensInfo.get(tipo);
                    if (infoLinguagem && infoLinguagem.comentario) {
                        const textoComentario = Array.from(comentariosPorTipo[tipo]).map(c => c.replace(/</g, "&lt;").replace(/>/g, "&gt;")).join('; ');
                        const comentarioFormatado = infoLinguagem.comentario.replace('%s', textoComentario);
                        comentariosHtml.push(comentarioFormatado);
                    }
                }
            }

            // Constrói a linha de código com número e comentários
            htmlResultante += `<div class="code-line">`;
            htmlResultante += `<span class="line-number">${index + 1}</span>`;
            htmlResultante += `<span class="code-content" style="white-space: pre;">${linhaHtml}</span>`;

            if (comentariosHtml.length > 0) {
                htmlResultante += `<span style="color: #7f8c8d; margin-left: 20px;">${comentariosHtml.join(' ')}</span>`;
            }
            htmlResultante += `</div>`;
        });

        // Exibe o resultado formatado como código
        resultadoComentarioDiv.innerHTML = `<div class="code-container">${htmlResultante}</div>`;

        // Se houver resultado, exibe o botão de copiar
        if (htmlResultante.trim() !== '') {
            botaoCopiar.style.display = 'block';
        }
    }

    // Adiciona os ouvintes de evento
    botaoBusca.addEventListener('click', buscarTermo); 
    // Permite que a busca seja acionada também ao pressionar a tecla 'Enter'.
    buscaInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            buscarTermo();
        }
    });

    botaoComentar.addEventListener('click', comentarCodigo);

    // Oculta o botão de copiar inicialmente
    botaoCopiar.style.display = 'none';

    // Verifica se os elementos existem antes de adicionar o evento
    if (botaoCopiar && resultadoComentarioDiv) {
        botaoCopiar.addEventListener('click', () => {
            // Pega o texto de dentro do elemento que contém o código comentado
            const codeContainer = resultadoComentarioDiv.querySelector('.code-container');
            if (!codeContainer) {
                alert('Não há código gerado para copiar.');
                return;
            }

            // Reconstrói o texto a partir dos elementos HTML para garantir uma cópia limpa.
            const linhasDeCodigo = Array.from(codeContainer.querySelectorAll('.code-line'));
            const textoParaCopiar = linhasDeCodigo.map(linhaDiv => {
                const codigo = linhaDiv.querySelector('.code-content')?.textContent || '';
                const comentario = linhaDiv.querySelector('span[style*="color: #7f8c8d"]')?.innerText || '';
                return comentario ? `${codigo} ${comentario}` : codigo;
            }).join('\n');
             
            // Usa a API do Navegador (Clipboard API) para copiar o texto. É uma abordagem moderna e segura.
            if (textoParaCopiar) {
                navigator.clipboard.writeText(textoParaCopiar)
                    .then(() => {
                        // Fornece um feedback visual para o usuário
                        const textoOriginal = botaoCopiar.textContent;
                        botaoCopiar.textContent = 'Copiado!';
                        
                        // Retorna ao texto original após 2 segundos
                        setTimeout(() => {
                            botaoCopiar.textContent = textoOriginal;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Falha ao tentar copiar o código: ', err);
                        alert('Não foi possível copiar o código para a área de transferência.');
                    });
            } else {
                alert('Não há código gerado para copiar.');
            }
        });
    }

    // Carrega os dados assim que a página estiver pronta
    carregarDados();
});
