let portfolioData = {};
let currentLang = 'pt';
let currentTimelineIndex = 0;
let currentTabId = 'ifpr';

// 1. INICIALIZAÇÃO: Busca o JSON quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    fetch('data.json')
        .then(data => {
            portfolioData = data;
            updateContent(currentLang);
            setupLanguageToggle();
            setupTimelineInteractions();
            setupTabsInteractions();
            setupPDFGeneration();
            setupEmailCopy(); // Nova função adicionada aqui
        })
        .catch(error => console.error("Erro ao carregar os dados:", error));
});

// 2. PREENCHIMENTO: Atualiza todos os textos baseados no idioma
function updateContent(lang) {
    const data = portfolioData[lang];
    
    // Header & Hero
    document.getElementById('btn-pdf').innerText = data.header.botao_pdf;
    document.getElementById('hero-citacao').innerText = data.hero.citacao;
    document.getElementById('hero-subtitulo').innerText = data.hero.subtitulo;

    // Timeline
    document.getElementById('timeline-titulo').innerText = data.timeline.titulo;
    const timelineCards = document.querySelectorAll('.timeline-card');
    data.timeline.experiencias.forEach((exp, index) => {
        timelineCards[index].querySelector('.card-empresa').innerText = exp.empresa;
        timelineCards[index].querySelector('.card-tempo').innerText = exp.tempo;
    });
    // Atualiza a descrição exibida de acordo com a bolinha selecionada no momento
    document.getElementById('timeline-texto').innerText = data.timeline.experiencias[currentTimelineIndex].descricao;

    // Sobre mim
    document.getElementById('sobre-titulo').innerText = data.sobre.titulo;
    const sobreContainer = document.getElementById('sobre-textos');
    sobreContainer.innerHTML = ''; // Limpa os textos antigos
    data.sobre.paragrafos.forEach(p => {
        const pElement = document.createElement('p');
        pElement.innerText = p;
        sobreContainer.appendChild(pElement);
    });

    // Educação (Abas)
    document.getElementById('educacao-titulo').innerText = data.educacao.titulo;
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns[0].innerText = data.educacao.instituicoes[0].titulo;
    tabBtns[1].innerText = data.educacao.instituicoes[1].titulo;
    updateTabContent();

    // Certificações
    document.getElementById('certificacoes-titulo').innerText = data.certificacoes.titulo;
    const certCards = document.querySelectorAll('.cert-card');
    data.certificacoes.lista.forEach((cert, index) => {
        certCards[index].querySelector('h4').innerText = cert.nome;
        certCards[index].querySelector('span').innerText = cert.instituicao;
    });

    // Habilidades
    document.getElementById('habilidades-titulo').innerText = data.habilidades.titulo;
    
    // Traduzindo os títulos das colunas de habilidades de forma simples
    const titulosIdiomas = { pt: 'Idiomas', en: 'Languages', fr: 'Langues', es: 'Idiomas' };
    document.getElementById('titulo-idiomas').innerText = titulosIdiomas[lang];
    
    populateSkills('container-soft', data.habilidades.soft_skills);
    populateSkills('container-idiomas', data.habilidades.idiomas);
    populateSkills('container-hard', data.habilidades.hard_skills);

    // Depoimento
    document.getElementById('depoimento-titulo').innerText = data.depoimento.titulo;
    document.getElementById('depoimento-texto').innerText = `"${data.depoimento.texto}"`;
    document.getElementById('depoimento-nome').innerText = data.depoimento.autor;
    document.getElementById('depoimento-cargo').innerText = data.depoimento.empresa;

    // Footer
    document.getElementById('footer-titulo').innerText = data.footer_titulo;
}

// Injeta as pílulas de habilidades dinamicamente
function populateSkills(containerId, skillsArray) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    skillsArray.forEach(skill => {
        const div = document.createElement('div');
        div.className = 'skill-pilula';
        div.innerText = skill;
        container.appendChild(div);
    });
}

// 3. EVENTOS DE CLIQUE: Botões de Idioma
function setupLanguageToggle() {
    const btns = document.querySelectorAll('.idioma-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.idioma-btn.ativo').classList.remove('ativo');
            e.target.classList.add('ativo');
            currentLang = e.target.innerText.toLowerCase();
            updateContent(currentLang);
        });
    });
}

// 4. EVENTOS DE CLIQUE: Timeline Interativa
function setupTimelineInteractions() {
    const items = document.querySelectorAll('.timeline-item');
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            document.querySelector('.timeline-ponto.ativo').classList.remove('ativo');
            item.querySelector('.timeline-ponto').classList.add('ativo');
            currentTimelineIndex = index;
            document.getElementById('timeline-texto').innerText = portfolioData[currentLang].timeline.experiencias[index].descricao;
        });
    });
}

// 5. EVENTOS DE CLIQUE: Abas de Educação
function setupTabsInteractions() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            document.querySelector('.tab-btn.ativo').classList.remove('ativo');
            e.target.classList.add('ativo');
            currentTabId = index === 0 ? 'ifpr' : 'ufpr';
            updateTabContent();
        });
    });
}

// Atualiza o conteúdo da aba específica (IFPR ou UFPR)
function updateTabContent() {
    const inst = portfolioData[currentLang].educacao.instituicoes.find(i => i.id === currentTabId);
    document.getElementById('tab-titulo').innerText = inst.titulo;
    document.getElementById('tab-subtitulo').innerText = inst.subtitulo;
    document.getElementById('tab-descricao').innerText = inst.descricao;
}

// 6. EXPORTAÇÃO: Gerador de PDF
function setupPDFGeneration() {
    document.getElementById('btn-pdf').addEventListener('click', () => {
        const element = document.body;
        const opt = {
            margin:       [10, 0, 10, 0], // Margens superior e inferior
            filename:     `Jheniffer_Biral_CV_${currentLang.toUpperCase()}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });
}
// 7. EVENTOS DE CLIQUE: Copiar Email
function setupEmailCopy() {
    const emailBtns = document.querySelectorAll('.copy-email');
    
    emailBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const email = btn.getAttribute('data-email');
            
            // API do navegador para copiar texto
            navigator.clipboard.writeText(email).then(() => {
                const tooltip = btn.querySelector('.tooltip');
                tooltip.innerText = "Copiado para área de transferência!";
                
                // Retorna ao texto original após 2.5 segundos
                setTimeout(() => {
                    tooltip.innerText = "Clique para copiar";
                }, 2500);
            });
        });
    });
}