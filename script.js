// script.js - Funcionalidades completas offline

// ============================================
// CONFIGURAÇÕES
// ============================================
const APP_CONFIG = {
    name: 'IAT - Sistema de Vistorias',
    version: '1.0.0',
    storageKeys: {
        form1: 'relatorioVistoria',
        form2: 'relatorioVistoriaSubestacao'
    },
    autoSaveInterval: 30000, // 30 segundos
    toastDuration: 3000
};

// ============================================
// INICIALIZAÇÃO
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log(`${APP_CONFIG.name} v${APP_CONFIG.version} iniciado`);
    verificarConexao();
    verificarDadosSalvos();
    inicializarEventos();
    verificarFormulariosExistem();
});

// ============================================
// FUNÇÃO PRINCIPAL: ABRIR FORMULÁRIO
// ============================================
function abrirFormulario(url) {
    mostrarToast(`Abrindo formulário...`, 'info');
    
    // Salva estado atual
    sessionStorage.setItem('ultimoAcesso', new Date().toISOString());
    sessionStorage.setItem('formularioDestino', url);
    
    // Efeito visual
    document.body.style.opacity = '0.7';
    document.body.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// ============================================
// FUNÇÃO PARA VOLTAR AO DASHBOARD
// (para ser usada nos formulários)
// ============================================
function voltarDashboard() {
    if (confirm('Deseja voltar ao dashboard? Os dados não salvos serão perdidos.')) {
        window.location.href = 'index.html';
    }
}

// ============================================
// VERIFICAÇÕES DE CONEXÃO (OFFLINE)
// ============================================
function verificarConexao() {
    const offlineBadge = document.getElementById('offlineBadge');
    
    function atualizarStatusOffline() {
        if (!navigator.onLine) {
            offlineBadge.style.display = 'flex';
            document.body.classList.add('offline');
            mostrarToast('Modo offline ativado. Os dados serão salvos localmente.', 'info');
        } else {
            offlineBadge.style.display = 'none';
            document.body.classList.remove('offline');
        }
    }
    
    // Verifica status inicial
    atualizarStatusOffline();
    
    // Monitora mudanças na conexão
    window.addEventListener('online', () => {
        offlineBadge.style.display = 'none';
        document.body.classList.remove('offline');
        mostrarToast('Conexão restabelecida', 'success');
    });
    
    window.addEventListener('offline', () => {
        offlineBadge.style.display = 'flex';
        document.body.classList.add('offline');
        mostrarToast('Você está offline. Os dados continuarão sendo salvos localmente.', 'warning');
    });
}

// ============================================
// VERIFICAR DADOS SALVOS LOCALMENTE
// ============================================
function verificarDadosSalvos() {
    try {
        // Verifica localStorage disponível
        if (typeof localStorage === 'undefined') {
            console.warn('LocalStorage não suportado');
            mostrarToast('Armazenamento local não suportado', 'error');
            return;
        }
        
        // Verifica dados do formulário 1
        const dadosForm1 = localStorage.getItem(APP_CONFIG.storageKeys.form1);
        if (dadosForm1) {
            try {
                const dados = JSON.parse(dadosForm1);
                const dataSalvamento = new Date(dados.dataSalvamento || dados.dataVistoria);
                if (!isNaN(dataSalvamento)) {
                    adicionarBadgeSalvo('form1', `Salvo em: ${dataSalvamento.toLocaleDateString()}`);
                } else {
                    adicionarBadgeSalvo('form1', 'Rascunho salvo');
                }
            } catch {
                adicionarBadgeSalvo('form1', 'Rascunho salvo');
            }
        }
        
        // Verifica dados do formulário 2
        const dadosForm2 = localStorage.getItem(APP_CONFIG.storageKeys.form2);
        if (dadosForm2) {
            try {
                const dados = JSON.parse(dadosForm2);
                if (dados.dataCadastro) {
                    const dataSalvamento = new Date(dados.dataCadastro);
                    if (!isNaN(dataSalvamento)) {
                        adicionarBadgeSalvo('form2', `Salvo em: ${dataSalvamento.toLocaleDateString()}`);
                    } else {
                        adicionarBadgeSalvo('form2', 'Rascunho salvo');
                    }
                } else {
                    adicionarBadgeSalvo('form2', 'Rascunho salvo');
                }
            } catch {
                adicionarBadgeSalvo('form2', 'Rascunho salvo');
            }
        }
        
        console.log('✅ Verificação de dados concluída');
    } catch (e) {
        console.error('Erro ao verificar localStorage:', e);
    }
}

// ============================================
// ADICIONAR BADGE DE DADOS SALVOS
// ============================================
function adicionarBadgeSalvo(formId, texto) {
    const cards = document.querySelectorAll('.select-card');
    const index = formId === 'form1' ? 0 : 1;
    
    if (cards[index]) {
        const badge = document.createElement('div');
        badge.className = 'saved-data-badge';
        badge.innerHTML = `<i class="fas fa-database"></i> ${texto || 'Rascunho salvo'}`;
        badge.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            background: var(--success);
            color: white;
            padding: 5px 12px;
            border-radius: 30px;
            font-size: 0.8rem;
            display: flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 4px 10px rgba(40, 167, 69, 0.3);
            z-index: 10;
        `;
        
        // Garante que o card tem position relative
        cards[index].style.position = 'relative';
        cards[index].appendChild(badge);
    }
}

// ============================================
// VERIFICAR SE FORMULÁRIOS EXISTEM (OFFLINE)
// ============================================
function verificarFormulariosExistem() {
    const forms = [
        { url: 'formulario1.html', index: 0 },
        { url: 'formulario2.html', index: 1 }
    ];
    
    forms.forEach(form => {
        // Tenta verificar se o arquivo existe via fetch
        fetch(form.url, { method: 'HEAD', cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    console.warn(`⚠️ ${form.url} não encontrado`);
                    marcarFormularioIndisponivel(form.index);
                }
            })
            .catch(() => {
                // Se falhou, assume que está offline mas o arquivo pode existir
                console.log(`ℹ️ Não foi possível verificar ${form.url} - modo offline`);
            });
    });
}

// ============================================
// MARCAR FORMULÁRIO INDISPONÍVEL
// ============================================
function marcarFormularioIndisponivel(index) {
    const cards = document.querySelectorAll('.select-card');
    if (cards[index]) {
        const card = cards[index];
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
        card.onclick = null;
        
        const statusText = card.querySelector('.status-text');
        if (statusText) {
            statusText.textContent = 'Arquivo não encontrado';
            statusText.style.color = 'var(--danger)';
        }
        
        const dot = card.querySelector('.status-dot');
        if (dot) {
            dot.style.background = 'var(--danger)';
        }
    }
}

// ============================================
// INICIALIZAR EVENTOS
// ============================================
function inicializarEventos() {
    // Adicionar eventos de teclado para acessibilidade
    const cards = document.querySelectorAll('.select-card');
    
    cards.forEach((card, index) => {
        // Evento de teclado (Enter ou Espaço)
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const url = index === 0 ? 'formulario1.html' : 'formulario2.html';
                abrirFormulario(url);
            }
        });
        
        // Efeito de clique
        card.addEventListener('mousedown', () => {
            card.style.transform = 'scale(0.98)';
        });
        
        card.addEventListener('mouseup', () => {
            card.style.transform = '';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Atalho de teclado: Esc para voltar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !window.location.href.includes('formulario')) {
            if (confirm('Deseja sair do sistema?')) {
                window.close();
            }
        }
    });
    
    // Prevenir perda acidental de dados
    window.addEventListener('beforeunload', (e) => {
        // Não faz nada, apenas permite saída limpa
    });
}

// ============================================
// MOSTRAR TOAST NOTIFICATION
// ============================================
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('statusToast');
    const toastMessage = document.getElementById('toastMessage');
    
    if (!toast || !toastMessage) return;
    
    toastMessage.textContent = mensagem;
    
    // Definir cor baseada no tipo
    const cores = {
        success: 'var(--success)',
        info: 'var(--primary)',
        warning: 'var(--warning)',
        error: 'var(--danger)'
    };
    
    toast.style.background = cores[tipo] || cores.info;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, APP_CONFIG.toastDuration);
}

// ============================================
// FUNÇÕES DE UTILIDADE PARA FORMULÁRIOS
// ============================================

// Função para ser chamada pelos formulários ao salvar
function notificarSalvamento(formulario) {
    const nomeForm = formulario === 1 ? 'Relatório de Vistoria' : 'Relatório - Subestação';
    mostrarToast(`${nomeForm} salvo localmente`, 'success');
    
    // Atualiza badge no dashboard se existir
    if (window.opener && !window.opener.closed) {
        try {
            window.opener.location.reload();
        } catch (e) {
            console.log('Não foi possível atualizar dashboard');
        }
    }
}

// Função para verificar espaço disponível no localStorage
function verificarEspacoStorage() {
    try {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += (localStorage[key].length * 2) / 1024 / 1024; // Aproximado em MB
            }
        }
        console.log(`Espaço utilizado: ~${total.toFixed(2)} MB`);
        return total;
    } catch (e) {
        console.error('Erro ao verificar espaço:', e);
        return 0;
    }
}

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================
window.abrirFormulario = abrirFormulario;
window.voltarDashboard = voltarDashboard;
window.notificarSalvamento = notificarSalvamento;
window.verificarEspacoStorage = verificarEspacoStorage;

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA DO SERVICE WORKER
// (para cache dos arquivos e funcionamento offline)
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
        const CACHE_NAME = 'iat-vistorias-v1';
        const urlsToCache = [
            './',
            './index.html',
            './formulario1.html',
            './formulario2.html',
            './style.css',
            './script.js',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        ];

        self.addEventListener('install', event => {
            event.waitUntil(
                caches.open(CACHE_NAME)
                    .then(cache => cache.addAll(urlsToCache))
            );
        });

        self.addEventListener('fetch', event => {
            event.respondWith(
                caches.match(event.request)
                    .then(response => response || fetch(event.request))
            );
        });
        `;
        
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swUrl)
            .then(reg => console.log('Service Worker registrado para uso offline'))
            .catch(err => console.log('Service Worker não suportado'));
    });
}
