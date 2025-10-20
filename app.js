// ========================================================
// LÓGICA DE NAVEGAÇÃO E UX (Aparência de App Mobile)
// ========================================================

/**
 * Alterna a visualização entre os diferentes gadgets (telas).
 * @param {string} gadgetId - O ID do gadget a ser exibido (ex: 'gadget-viagem').
 */
function showGadget(gadgetId) {
    // 1. Esconder todas as telas de gadgets
    document.querySelectorAll('.gadget-screen').forEach(screen => {
        screen.classList.add('hidden');
        screen.classList.remove('active');
    });

    // 2. Mostrar a tela do gadget selecionado
    const activeGadget = document.getElementById(gadgetId);
    if (activeGadget) {
        activeGadget.classList.remove('hidden');
        activeGadget.classList.add('active');
    }

    // 3. Atualizar o estado 'active' na barra de navegação inferior
    document.querySelectorAll('.app-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    // Encontra o botão de navegação correspondente ao gadgetId e o ativa
    document.querySelector(`.app-nav button[onclick*="${gadgetId}"]`).classList.add('active');
}

/**
 * Alterna entre os modelos Básico e Avançado da Calculadora de Viagem.
 * @param {string} model - 'basico' ou 'avancado'.
 */
function showViagemModel(model) {
    const basico = document.getElementById('viagem-basico');
    const avancado = document.getElementById('viagem-avancado');
    const buttons = document.querySelectorAll('.segment-control button');

    // Remove 'active' de todos os botões e adiciona ao botão clicado
    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.segment-control button[onclick*="${model}"]`).classList.add('active');
    
    // Troca a visibilidade dos modelos
    if (model === 'basico') {
        basico.classList.remove('hidden');
        avancado.classList.add('hidden');
    } else {
        basico.classList.add('hidden');
        avancado.classList.remove('hidden');
    }
}


// ========================================================
// LÓGICA DO GADGET 1: CALCULADORA DE VIAGEM (BÁSICO)
// ========================================================

/**
 * Calcula o custo total e litros gastos no Modelo Básico.
 */
function calcularViagemBasico(event) {
    event.preventDefault(); // Impede o recarregamento da página

    // 1. Coletar os valores de entrada
    const precoCombustivel = parseFloat(document.getElementById('combustivel').value);
    const consumoMedio = parseFloat(document.getElementById('consumo').value);
    const distancia = parseFloat(document.getElementById('distancia').value);

    // Validação básica (garante que os valores são válidos)
    if (isNaN(precoCombustivel) || isNaN(consumoMedio) || isNaN(distancia) || consumoMedio === 0) {
        alert("Por favor, insira valores válidos para o cálculo.");
        return;
    }

    // 2. Realizar os Cálculos
    // Litros Gasto: Distância / Consumo Médio
    const litrosGasto = distancia / consumoMedio;

    // Custo Total: Litros Gasto * Preço do Combustível
    const custoTotal = litrosGasto * precoCombustivel;

    // 3. Exibir os Resultados
    document.getElementById('litros-gasto').textContent = litrosGasto.toFixed(2);
    document.getElementById('custo-total').textContent = `R$ ${custoTotal.toFixed(2)}`;
}

// ========================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Configura o Listener para o formulário da Calculadora de Viagem Básico
    const formBasico = document.getElementById('form-viagem-basico');
    if (formBasico) {
        formBasico.addEventListener('submit', calcularViagemBasico);
    }
    
    // 2. Garante que o primeiro gadget (Viagem) e o modelo Básico estejam visíveis na inicialização
    showGadget('gadget-viagem');
    showViagemModel('basico');
});
