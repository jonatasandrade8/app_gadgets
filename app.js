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
// ========================================================
// LÓGICA DO GADGET 1: CALCULADORA DE VIAGEM (AVANÇADO - TCO)
// ========================================================

/**
 * Calcula o Custo Total de Propriedade (TCO) da Viagem.
 */
function calcularViagemAvancado(event) {
    event.preventDefault(); 

    // 1. Coletar os valores de entrada
    const precoCombustivel = parseFloat(document.getElementById('combustivel_av').value);
    const consumoMedio = parseFloat(document.getElementById('consumo_av').value);
    const distancia = parseFloat(document.getElementById('distancia_av').value);
    const pedagios = parseFloat(document.getElementById('pedagios').value);
    const custoPneu = parseFloat(document.getElementById('custo_pneu').value);
    const kmPneu = parseFloat(document.getElementById('km_pneu').value);
    const custoOleo = parseFloat(document.getElementById('custo_oleo').value);
    const kmOleo = parseFloat(document.getElementById('km_oleo').value);

    // Validação
    const inputs = [precoCombustivel, consumoMedio, distancia, pedagios, custoPneu, kmPneu, custoOleo, kmOleo];
    if (inputs.some(isNaN) || consumoMedio === 0 || kmPneu === 0 || kmOleo === 0) {
        alert("Por favor, insira valores válidos e não-nulos para os quilômetros.");
        return;
    }

    // 2. Cálculo dos Custos Fixos/Manutenção por Km
    // Se você não incluiu custos anuais fixos, vamos usar apenas os essenciais de manutenção.
    
    // Custo por Km (Pneus):
    const custoKmPneu = custoPneu / kmPneu;

    // Custo por Km (Óleo):
    const custoKmOleo = custoOleo / kmOleo;

    // Custo Total de Manutenção por Km:
    const custoKmManutencaoTotal = custoKmPneu + custoKmOleo;

    // Custo Total de Manutenção na Viagem:
    const custoTotalManutencaoViagem = distancia * custoKmManutencaoTotal;


    // 3. Cálculo do Custo de Combustível (Básico)
    const litrosGasto = distancia / consumoMedio;
    const custoTotalCombustivel = litrosGasto * precoCombustivel;


    // 4. Custo Final (TCO - Travel Cost of Ownership)
    const custoTotalAvancado = custoTotalCombustivel + custoTotalManutencaoViagem + pedagios;

    // 5. Exibir os Resultados
    document.getElementById('custo-km-manutencao').textContent = `R$ ${custoKmManutencaoTotal.toFixed(4)}`; // 4 casas para precisão
    document.getElementById('litros-gasto-av').textContent = litrosGasto.toFixed(2);
    document.getElementById('custo-total-av').textContent = `R$ ${custoTotalAvancado.toFixed(2)}`;
}


// ========================================================
// LÓGICA DO GADGET 2: CALCULADORA DE GASTOS DE ENERGIA
// ========================================================

let equipamentos = [];

/**
 * Calcula o custo mensal de um único equipamento.
 * @param {number} potenciaW - Potência em Watts.
 * @param {number} tempoUsoH - Horas de uso diário.
 * @param {number} diasUsoM - Dias de uso mensal.
 * @param {number} valorKWh - Preço do kW/h (R$/kW/h).
 * @returns {number} Custo mensal em Reais.
 */
function calcularCustoEquipamento(potenciaW, tempoUsoH, diasUsoM, valorKWh) {
    // Consumo Mensal (kWh): (Potência * Tempo Diário * Dias no Mês) / 1000
    const consumoKWh = (potenciaW * tempoUsoH * diasUsoM) / 1000;
    
    // Custo Mensal (R$): Consumo Mensal * Valor do kW/h
    return consumoKWh * valorKWh;
}

/**
 * Adiciona um novo equipamento à lista.
 */
function adicionarEquipamento(event) {
    event.preventDefault();

    const nome = document.getElementById('nome_equipamento').value;
    const potencia = parseFloat(document.getElementById('potencia_w').value);
    const tempo = parseFloat(document.getElementById('tempo_uso_h').value);
    const dias = parseInt(document.getElementById('dias_uso').value);

    if (!nome || isNaN(potencia) || isNaN(tempo) || isNaN(dias) || potencia <= 0 || tempo <= 0 || dias <= 0) {
        alert("Preencha todos os campos do equipamento com valores válidos.");
        return;
    }

    const novoEquipamento = {
        id: Date.now(), // ID único para remoção
        nome: nome,
        potencia: potencia,
        tempoUso: tempo,
        diasUso: dias,
        custo: 0 // Será calculado depois
    };

    equipamentos.push(novoEquipamento);
    document.getElementById('form-novo-equipamento').reset(); // Limpa o formulário
    
    renderizarEquipamentos();
}

/**
 * Remove um equipamento da lista pelo ID.
 * @param {number} id - ID único do equipamento.
 */
function removerEquipamento(id) {
    equipamentos = equipamentos.filter(eq => eq.id !== id);
    renderizarEquipamentos();
}

/**
 * Renderiza a lista de equipamentos e calcula o total.
 */
function renderizarEquipamentos() {
    const listaContainer = document.getElementById('equipamentos-list');
    const valorKWh = parseFloat(document.getElementById('valor_kwh').value) || 0;
    let custoTotal = 0;
    let htmlContent = '';

    if (equipamentos.length === 0) {
        htmlContent = '<p class="placeholder-text">Nenhum equipamento adicionado.</p>';
        listaContainer.innerHTML = htmlContent;
        document.getElementById('custo-total-energia').textContent = `R$ 0.00`;
        return;
    }

    equipamentos.forEach(eq => {
        eq.custo = calcularCustoEquipamento(eq.potencia, eq.tempoUso, eq.diasUso, valorKWh);
        custoTotal += eq.custo;

        htmlContent += `
            <div class="equipamento-item">
                <div class="item-info">
                    <strong>${eq.nome}</strong>
                    <small>${eq.potencia}W | ${eq.tempoUso}h/dia | ${eq.diasUso} dias</small>
                </div>
                <span class="item-cost">R$ ${eq.custo.toFixed(2)}</span>
                <button class="delete-btn" onclick="removerEquipamento(${eq.id})">
                    <span class="icon">×</span>
                </button>
            </div>
        `;
    });

    listaContainer.innerHTML = htmlContent;
    document.getElementById('custo-total-energia').textContent = `R$ ${custoTotal.toFixed(2)}`;
}

// ========================================================
// INICIALIZAÇÃO DA APLICAÇÃO (Atualização do DOMContentLoaded)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Gadget 1: Viagem ---
    // Listener para o formulário Básico (já existia)
    const formBasico = document.getElementById('form-viagem-basico');
    if (formBasico) {
        formBasico.addEventListener('submit', calcularViagemBasico);
    }
    // NOVO: Listener para o formulário Avançado
    const formAvancado = document.getElementById('form-viagem-avancado');
    if (formAvancado) {
        formAvancado.addEventListener('submit', calcularViagemAvancado);
    }
    
    // --- Gadget 2: Energia ---
    // Listener para adicionar novo equipamento
    const formNovoEquipamento = document.getElementById('form-novo-equipamento');
    if (formNovoEquipamento) {
        formNovoEquipamento.addEventListener('submit', adicionarEquipamento);
    }
    // Listener para recalcular o custo total se o valor do kW/h mudar
    document.getElementById('valor_kwh').addEventListener('change', renderizarEquipamentos);

    // Inicialização
    showGadget('gadget-viagem');
    showViagemModel('basico');
});

// A função calcularViagemBasico do passo anterior deve ser mantida.