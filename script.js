// script.js - Funcionalidades do dashboard

// Configurações
const CONFIG = {
    animationDelay: 300,
    toastDuration: 3000,
    storageKeys: {
        form1: 'relatorioVistoria',
        form2: 'relatorioVistoriaSubestacao'
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard IAT/ERCBA iniciado');
    verificarFormularios();
    verificarDadosSalvos();
    inicializarEventos();
    mostrarBoasVindas();
});

// Função para abrir formulários
function abrirFormulario(url) {
    mostrarToast(`Abrindo ${url}...`, 'info');
    
    // Efeito de transição
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = url;
    }, CONFIG.animationDelay);
}

// Verificar se os formulários existem
function verificarFormularios() {
    const form1 = document.getElementById('badgeForm1');
    const form2 = document.getElementById('badgeForm2');
    
    // Verificar formulario1.html
    fetch('formulario1.html', { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                form1.textContent = 'Disponível';
                form1.className = 'status-badge available';
                document.getElementById('statusForm1').style.opacity = '1';
            } else {
                throw new Error('Não encontrado');
            }
        })
        .catch(() => {
            form1.textContent = 'Não encontrado';
            form1.className = 'status-badge error';
        });
    
    // Verificar formulario2.html
    fetch('formulario2.html', { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                form2.textContent = 'Disponível';
                form2.className = 'status-badge available';
                document.getElementById('statusForm2').style.opacity = '1';
            } else {
                throw new Error('Não encontrado');
            }
        })
        .catch(() => {
            form2.textContent = 'Não encontrado';
            form2.className = 'status-badge error';
        });
}

// Verificar dados salvos localmente
function verificarDadosSalvos() {
    try {
        const dadosForm1 = localStorage.getItem(CONFIG.storageKeys.form1);
        const dadosForm2 = localStorage.getItem(CONFIG.storageKeys.form2);
        
        if (dadosForm1) {
            console.log('✅ Formulário 1 possui dados salvos');
            adicionarBadgeSalvo('form1');
        }
        
        if (dadosForm2) {
            console.log('✅ Formulário 2 possui dados salvos');
            adicionarBadgeSalvo('form2');
        }
        
        if (!dadosForm1 && !dadosForm2) {
            console.log('ℹ️ Nenhum dado salvo encontrado');
        }
    } catch (e) {
        console.error('Erro ao verificar localStorage:', e);
    }
}

// Adicionar badge de dados salvos
function adicionarBadgeSalvo(formId) {
    const card = formId === 'form1' 
        ? document.querySelector('.form-card:first-child')
        : document.querySelector('.form-card:last-child');
    
    const badge = document.createElement('div');
    badge.className = 'saved-badge';
    badge.innerHTML = '<i class="fas fa-database"></i> Dados salvos';
    badge.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: rgba(40, 167, 69, 0.9);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8em;
        display: flex;
        align-items: center;
        gap: 5px;
        z-index: 1;
        backdrop-filter: blur(5px);
    `;
    
    card.appendChild(badge);
}

// Inicializar eventos
function inicializarEventos() {
    // Adicionar efeito hover nos cards
    const cards = document.querySelectorAll('.form-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
        
        // Efeito de clique
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-acessar')) return;
            
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        });
    });
    
    // Tecla ESC para voltar (se estiver em um formulário, mas mantemos aqui)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.location.pathname.includes('index.html')) {
            if (confirm('Deseja realmente sair do sistema?')) {
                window.close();
            }
        }
    });
}

// Mostrar toast notification
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('statusToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = mensagem;
    
    // Definir cor baseada no tipo
    const cores = {
        success: '#28a745',
        info: '#003366',
        warning: '#ffc107',
        error: '#dc3545'
    };
    
    toast.style.background = cores[tipo] || cores.info;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, CONFIG.toastDuration);
}

// Mostrar mensagem de boas-vindas baseada na hora
function mostrarBoasVindas() {
    const hora = new Date().getHours();
    let saudacao = '';
    
    if (hora < 12) saudacao = 'Bom dia';
    else if (hora < 18) saudacao = 'Boa tarde';
    else saudacao = 'Boa noite';
    
    console.log(`${saudacao}! Bem-vindo ao Sistema de Formulários IAT/ERCBA`);
    
    // Mostrar toast de boas-vindas apenas na primeira visita
    if (!sessionStorage.getItem('boasVindasMostrada')) {
        setTimeout(() => {
            mostrarToast(`${saudacao}! Selecione um formulário para começar`, 'info');
        }, 1000);
        sessionStorage.setItem('boasVindasMostrada', 'true');
    }
}

// Função para limpar dados (útil para debug)
function limparDadosSalvos() {
    if (confirm('Tem certeza que deseja limpar todos os dados salvos?')) {
        localStorage.removeItem(CONFIG.storageKeys.form1);
        localStorage.removeItem(CONFIG.storageKeys.form2);
        
        // Remover badges
        document.querySelectorAll('.saved-badge').forEach(badge => badge.remove());
        
        mostrarToast('Todos os dados foram removidos', 'success');
    }
}

// Exportar funções para uso global
window.abrirFormulario = abrirFormulario;
window.limparDadosSalvos = limparDadosSalvos;

// Adicionar atalho de teclado para limpar dados (Ctrl+Shift+L)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        limparDadosSalvos();
    }
});

// Prevenir perda acidental
window.addEventListener('beforeunload', (e) => {
    // Apenas para navegação interna
    if (!e.target.activeElement.href) {
        return;
    }
});

// Verificar conexão (útil para verificar se as imagens dos logos carregam)
window.addEventListener('online', () => {
    mostrarToast('Conexão restabelecida', 'success');
});

window.addEventListener('offline', () => {
    mostrarToast('Você está offline. Algumas funcionalidades podem ser limitadas.', 'warning');
});