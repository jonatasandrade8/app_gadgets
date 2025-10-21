// ========================================================
// RECURSOS GLOBAIS E ESTADOS
// ========================================================

const appContainer = document.getElementById('app-content-container');
let equipamentos = []; // Estado global para o gadget de Energia
let docItens = [];     // Estado global para o gadget de Documentos
let docType = 'OS';    // Estado global para o tipo de Documento (OS, Nota, Orcamento)

// Variáveis de estado para armazenar os últimos resultados calculados (uso no PDF)
let lastViagemResults = {};
let lastEnergiaResults = {};
let lastProdutividadeResults = {};
let lastDocumentosData = {};


// ========================================================
// 1. O ROUTER E NAVEGAÇÃO (Mantido)
// ========================================================

const gadgetRenderers = {
    'viagem': renderViagem,
    'energia': renderEnergia,
    'produtividade': renderProdutividade,
    'documentos': renderDocumentos
};

/**
 * Função principal de navegação (Router)
 */
function showGadget(gadgetId) {
    appContainer.innerHTML = '';
    
    if (gadgetRenderers[gadgetId]) {
        gadgetRenderers[gadgetId]();
    } else {
        appContainer.innerHTML = `<section class="gadget-screen"><h2>Em Desenvolvimento</h2><p>O gadget ${gadgetId} está sendo construído!</p></section>`;
    }

    // Atualiza o estado 'active' na barra de navegação
    document.querySelectorAll('.app-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-gadget-id') === gadgetId) {
            item.classList.add('active');
        }
    });
}


// ========================================================
// 2. GADGET 1: CALCULADORA DE VIAGEM (Cálculos atualizados para estado)
// ========================================================

function renderViagem() {
    appContainer.innerHTML = `
        <section id="gadget-viagem" class="gadget-screen active">
            <h2>🚗 Calculadora de Viagem</h2>
            <div class="segment-control">
                <button class="active" data-model="basico" onclick="showViagemModel('basico')">Básico</button>
                <button data-model="avancado" onclick="showViagemModel('avancado')">Avançado</button>
            </div>

            <div id="viagem-basico" class="model-content active">
                <h3>Modelo Básico</h3>
                <form id="form-viagem-basico">
                    <div class="input-group">
                        <label for="combustivel">Preço do Combustível (R$/L):</label>
                        <input type="number" id="combustivel" value="5.50" step="0.01" required>
                    </div>
                    <div class="input-group">
                        <label for="consumo">Consumo Médio (Km/L):</label>
                        <input type="number" id="consumo" value="10" required>
                    </div>
                    <div class="input-group">
                        <label for="distancia">Distância da Viagem (Km):</label>
                        <input type="number" id="distancia" value="500" required>
                    </div>
                    <button type="submit" class="cta-button">Calcular</button>
                    
                    <div class="result-box">
                        <p>Litros Gastos: <span id="litros-gasto">0.00</span> L</p>
                        <p>Custo Total: <span id="custo-total">R$ 0.00</span></p>
                    </div>
                </form>
            </div>

            <div id="viagem-avancado" class="model-content hidden">
                 <h3>Modelo Avançado (TCO da Viagem)</h3>
                 <p class="small-text">Inclui custos de veículos leves E pesados, diárias e Arla (Opcional).</p>
                 <form id="form-viagem-avancado">
                    <div class="input-group">
                        <label for="combustivel_av">Preço do Combustível (R$/L):</label>
                        <input type="number" id="combustivel_av" value="5.50" step="0.01" required>
                    </div>
                    <div class="input-group">
                        <label for="consumo_av">Consumo Médio (Km/L):</label>
                        <input type="number" id="consumo_av" value="10" required>
                    </div>
                    <div class="input-group">
                        <label for="distancia_av">Distância da Viagem (Km):</label>
                        <input type="number" id="distancia_av" value="500" required>
                    </div>
                    
                    <h4>Variáveis Opcionais</h4>
                    <div class="checkbox-group">
                        <input type="checkbox" id="check_pesado">
                        <label for="check_pesado">Veículo Pesado (Adicionar Arla)</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="check_diarias">
                        <label for="check_diarias">Diárias do Motorista/Alimentação</label>
                    </div>
                    <div class="input-group">
                        <label for="pedagios">Pedágios / Taxas (R$):</label>
                        <input type="number" id="pedagios" value="50.00" step="0.01" required>
                    </div>

                    <div id="fields_pesado" class="hidden">
                         <h4>Custos Veículo Pesado</h4>
                        <div class="input-group">
                            <label for="consumo_arla">Consumo de ARLA 32 (Litros/100 Km):</label>
                            <input type="number" id="consumo_arla" value="3.0" step="0.1">
                        </div>
                        <div class="input-group">
                            <label for="preco_arla">Preço do ARLA 32 (R$/L):</label>
                            <input type="number" id="preco_arla" value="4.00" step="0.01">
                        </div>
                    </div>

                    <div id="fields_diarias" class="hidden">
                         <h4>Diárias do Motorista</h4>
                        <div class="input-group">
                            <label for="dias_viagem">Dias de Duração da Viagem:</label>
                            <input type="number" id="dias_viagem" value="1" min="1">
                        </div>
                        <div class="input-group">
                            <label for="custo_diaria">Custo Fixo Diário (Alimentação/Outros - R$):</label>
                            <input type="number" id="custo_diaria" value="100.00" step="0.01">
                        </div>
                    </div>

                    <h4>Custos de Manutenção</h4>
                    <div class="input-group">
                        <label for="custo_pneu">Custo da Troca de Pneus (R$ total):</label>
                        <input type="number" id="custo_pneu" value="2000" required>
                    </div>
                    <div class="input-group">
                        <label for="km_pneu">Km Máximo Pneus (Km):</label>
                        <input type="number" id="km_pneu" value="40000" required>
                    </div>
                    <div class="input-group">
                        <label for="custo_oleo">Custo da Troca de Óleo (R$ total):</label>
                        <input type="number" id="custo_oleo" value="300" required>
                    </div>
                    <div class="input-group">
                        <label for="km_oleo">Km Máximo Óleo (Km):</label>
                        <input type="number" id="km_oleo" value="10000" required>
                    </div>

                    <button type="submit" class="cta-button">Calcular TCO da Viagem</button>
                    
                    <div class="result-box">
                        <p>Custo Manutenção/Km: <span id="custo-km-manutencao">R$ 0.00</span></p>
                        <p>Custos Extras (Arla + Diárias): <span id="custo-extras">R$ 0.00</span></p>
                        <p>Custo Total (TCO): <span id="custo-total-av">R$ 0.00</span></p>
                    </div>
                    <div class="action-buttons-group">
                        <button type="button" class="cta-button small-button action-button" onclick="generatePdf('viagem')">
                            Baixar Relatório (PDF)
                        </button>
                        <button type="button" class="cta-button small-button secondary-button" onclick="shareContent('viagem')">
                            Compartilhar
                        </button>
                    </div>
                </form>
            </div>
        </section>
    `;
    attachViagemListeners();
}

/**
 * Anexa todos os listeners de formulário e checkbox, corrigindo o problema da SPA.
 */
function attachViagemListeners() {
    const formBasico = document.getElementById('form-viagem-basico');
    const formAvancado = document.getElementById('form-viagem-avancado');

    if (formBasico) formBasico.addEventListener('submit', calcularViagemBasico);
    if (formAvancado) formAvancado.addEventListener('submit', calcularViagemAvancado);

    const checkPesado = document.getElementById('check_pesado');
    const checkDiarias = document.getElementById('check_diarias');
    
    if (checkPesado) checkPesado.addEventListener('change', toggleHeavyVehicleFields);
    if (checkDiarias) checkDiarias.addEventListener('change', toggleDriverDailyFields);

    // Garante que o modelo inicial seja o Básico
    showViagemModel('basico');
}

// Funções auxiliares de Viagem (mantidas)

function toggleHeavyVehicleFields() {
    const isChecked = document.getElementById('check_pesado').checked;
    document.getElementById('fields_pesado').classList.toggle('hidden', !isChecked);
}

function toggleDriverDailyFields() {
    const isChecked = document.getElementById('check_diarias').checked;
    document.getElementById('fields_diarias').classList.toggle('hidden', !isChecked);
}

function showViagemModel(model) {
    const basico = document.getElementById('viagem-basico');
    const avancado = document.getElementById('viagem-avancado');
    const buttons = document.querySelectorAll('#gadget-viagem .segment-control button');

    if (!basico || !avancado) return;

    buttons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#gadget-viagem .segment-control button[data-model="${model}"]`).classList.add('active');
    
    if (model === 'basico') {
        basico.classList.remove('hidden');
        avancado.classList.add('hidden');
    } else {
        basico.classList.add('hidden');
        avancado.classList.remove('hidden');
    }
}

/**
 * Cálculo Básico (Salva resultados no estado)
 */
function calcularViagemBasico(event) {
    event.preventDefault(); 
    
    const precoCombustivel = parseFloat(document.getElementById('combustivel').value);
    const consumoMedio = parseFloat(document.getElementById('consumo').value);
    const distancia = parseFloat(document.getElementById('distancia').value);

    if (isNaN(precoCombustivel) || isNaN(consumoMedio) || isNaN(distancia) || consumoMedio <= 0) {
        alert("Preencha todos os campos do modelo Básico com valores numéricos válidos.");
        return;
    }

    const litrosGasto = distancia / consumoMedio;
    const custoTotal = litrosGasto * precoCombustivel;

    // Salva o estado para o PDF
    lastViagemResults = {
        model: 'basico',
        distancia: distancia,
        precoCombustivel: precoCombustivel,
        consumoMedio: consumoMedio,
        litrosGasto: litrosGasto,
        custoTotal: custoTotal
    };

    document.getElementById('litros-gasto').textContent = litrosGasto.toFixed(2);
    document.getElementById('custo-total').textContent = `R$ ${custoTotal.toFixed(2)}`;
}

/**
 * Cálculo Avançado (TCO) (Salva resultados no estado)
 */
function calcularViagemAvancado(event) {
    event.preventDefault(); 

    const precoCombustivel = parseFloat(document.getElementById('combustivel_av').value) || 0;
    const consumoMedio = parseFloat(document.getElementById('consumo_av').value) || 0;
    const distancia = parseFloat(document.getElementById('distancia_av').value) || 0;
    const pedagios = parseFloat(document.getElementById('pedagios').value) || 0;
    
    const custoPneu = parseFloat(document.getElementById('custo_pneu').value) || 0;
    const kmPneu = parseFloat(document.getElementById('km_pneu').value) || 1; 
    const custoOleo = parseFloat(document.getElementById('custo_oleo').value) || 0;
    const kmOleo = parseFloat(document.getElementById('km_oleo').value) || 1;

    if (distancia <= 0 || consumoMedio <= 0) {
         alert("Distância e Consumo devem ser maiores que zero.");
         return;
    }

    // CÁLCULO DE CUSTOS DE MANUTENÇÃO
    const custoKmManutencaoTotal = (custoPneu / kmPneu) + (custoOleo / kmOleo);
    const custoTotalManutencaoViagem = distancia * custoKmManutencaoTotal;

    // CÁLCULO DE CUSTO DE COMBUSTÍVEL
    const litrosGasto = distancia / consumoMedio;
    const custoTotalCombustivel = litrosGasto * precoCombustivel;

    // CÁLCULO DE CUSTOS EXTRAS (ARLA + DIÁRIAS)
    let custoExtras = 0;
    let arlaData = null;
    let diariaData = null;

    // ARLA
    if (document.getElementById('check_pesado') && document.getElementById('check_pesado').checked) {
        const consumoArla = parseFloat(document.getElementById('consumo_arla').value) || 0;
        const precoArla = parseFloat(document.getElementById('preco_arla').value) || 0;

        if (distancia > 0 && consumoArla > 0 && precoArla > 0) {
            const litrosArla = (distancia / 100) * consumoArla;
            custoExtras += litrosArla * precoArla;
            arlaData = { litrosArla, precoArla, consumoArla, custo: litrosArla * precoArla };
        }
    }

    // DIÁRIAS
    if (document.getElementById('check_diarias') && document.getElementById('check_diarias').checked) {
        const diasViagem = parseFloat(document.getElementById('dias_viagem').value) || 0;
        const custoDiaria = parseFloat(document.getElementById('custo_diaria').value) || 0;
        
        if (diasViagem > 0 && custoDiaria > 0) {
            custoExtras += diasViagem * custoDiaria;
            diariaData = { diasViagem, custoDiaria, custo: diasViagem * custoDiaria };
        }
    }

    // CUSTO FINAL (TCO)
    const custoTotalAvancado = custoTotalCombustivel + custoTotalManutencaoViagem + pedagios + custoExtras;

    // Salva o estado para o PDF
    lastViagemResults = {
        model: 'avancado',
        distancia: distancia,
        precoCombustivel: precoCombustivel,
        consumoMedio: consumoMedio,
        litrosGasto: litrosGasto,
        custoTotalCombustivel: custoTotalCombustivel,
        pedagios: pedagios,
        custoManutencao: {
            custoKmManutencaoTotal,
            custoPneu, kmPneu, custoOleo, kmOleo,
            custoTotalManutencaoViagem
        },
        custoExtras: {
            total: custoExtras,
            arla: arlaData,
            diaria: diariaData
        },
        custoTotal: custoTotalAvancado
    };

    document.getElementById('custo-km-manutencao').textContent = `R$ ${custoKmManutencaoTotal.toFixed(4)}`; 
    document.getElementById('custo-extras').textContent = `R$ ${custoExtras.toFixed(2)}`;
    document.getElementById('custo-total-av').textContent = `R$ ${custoTotalAvancado.toFixed(2)}`;
}


// ========================================================
// 3. GADGET 2: CALCULADORA DE ENERGIA (Cálculos atualizados para estado)
// ========================================================

function renderEnergia() {
    appContainer.innerHTML = `
        <section id="gadget-energia" class="gadget-screen active">
            <h2>⚡ Calculadora de Gastos de Energia</h2>
            
            <div class="input-group">
                <label for="valor_kwh">Valor do kW/h (R$/kW/h):</label>
                <input type="number" id="valor_kwh" value="0.85" step="0.001" required>
            </div>

            <h3>Equipamentos</h3>
            <div id="equipamentos-list" class="list-container">
                </div>

            <form id="form-novo-equipamento" class="add-form">
                <h4>Adicionar Novo Equipamento</h4>
                <div class="input-group">
                    <label for="nome_equipamento">Nome:</label>
                    <input type="text" id="nome_equipamento" placeholder="Ex: Geladeira, Ar 9000 BTUs" required>
                </div>
                <div class="input-group half-group">
                    <label for="potencia_w">Potência (Watts - W):</label>
                    <input type="number" id="potencia_w" placeholder="100" required>
                </div>
                <div class="input-group half-group">
                    <label>Uso Diário:</label>
                    <div style="display: flex; gap: 10px;">
                         <input type="number" id="tempo_min" placeholder="Min" value="0" min="0" style="width: 50%;">
                         <input type="number" id="tempo_h" placeholder="Horas" value="8" min="0" step="0.5" style="width: 50%;">
                    </div>
                </div>
                <div class="input-group">
                    <label for="dias_uso">Dias no Mês (Máx 31):</label>
                    <input type="number" id="dias_uso" value="30" min="1" max="31" required>
                </div>
                
                <button type="submit" class="cta-button small-button">Adicionar Equipamento</button>
            </form>
            
            <div class="result-box final-result-box">
                <p>Custo Total Mensal Estimado: <span id="custo-total-energia">R$ 0.00</span></p>
            </div>
            <div class="action-buttons-group">
                <button type="button" class="cta-button small-button action-button" onclick="generatePdf('energia')">
                    Baixar Relatório (PDF)
                </button>
                <button type="button" class="cta-button small-button secondary-button" onclick="shareContent('energia')">
                    Compartilhar
                </button>
            </div>
        </section>
    `;
    attachEnergiaListeners();
    renderizarEquipamentos(); 
}

function attachEnergiaListeners() {
    document.getElementById('form-novo-equipamento').addEventListener('submit', adicionarEquipamento);
    // Renderiza e recalcula ao mudar o valor do KWh
    const kwhInput = document.getElementById('valor_kwh');
    if (kwhInput) {
        kwhInput.addEventListener('change', renderizarEquipamentos);
        kwhInput.addEventListener('input', renderizarEquipamentos);
    }
}

function adicionarEquipamento(event) {
    event.preventDefault();

    const nome = document.getElementById('nome_equipamento').value.trim();
    const potencia = parseFloat(document.getElementById('potencia_w').value) || 0;
    const tempoMin = parseFloat(document.getElementById('tempo_min').value) || 0;
    const tempoH = parseFloat(document.getElementById('tempo_h').value) || 0;
    const dias = parseInt(document.getElementById('dias_uso').value) || 0;

    const tempoTotalH = tempoH + (tempoMin / 60);

    if (!nome || potencia <= 0 || (tempoTotalH <= 0 && tempoMin == 0 && tempoH == 0) || dias <= 0) {
        alert("Preencha os campos com valores válidos. O tempo de uso deve ser maior que zero.");
        return;
    }

    const novoEquipamento = {
        id: Date.now(),
        nome: nome,
        potencia: potencia,
        tempoTotalH: tempoTotalH, 
        diasUso: dias
    };

    equipamentos.push(novoEquipamento);
    document.getElementById('form-novo-equipamento').reset();
    document.getElementById('tempo_h').value = 8;
    
    renderizarEquipamentos();
}

function removerEquipamento(id) {
    equipamentos = equipamentos.filter(eq => eq.id !== id);
    renderizarEquipamentos();
}

function calcularCustoEquipamento(potenciaW, tempoTotalH, diasUsoM, valorKWh) {
    const consumoKWh = (potenciaW * tempoTotalH * diasUsoM) / 1000;
    return consumoKWh * valorKWh;
}

function renderizarEquipamentos() {
    const listaContainer = document.getElementById('equipamentos-list');
    const custoTotalSpan = document.getElementById('custo-total-energia');
    const valorKWhInput = document.getElementById('valor_kwh');

    if (!listaContainer || !custoTotalSpan || !valorKWhInput) return; 

    const valorKWh = parseFloat(valorKWhInput.value) || 0;
    let custoTotal = 0;
    let htmlContent = '';
    let equipamentosCalculados = [];

    if (equipamentos.length === 0) {
        htmlContent = '<p class="placeholder-text">Nenhum equipamento adicionado.</p>';
        listaContainer.innerHTML = htmlContent;
        custoTotalSpan.textContent = `R$ 0.00`;
        
        lastEnergiaResults = {
            valorKWh,
            equipamentos: [],
            custoTotal: 0
        };
        return;
    }

    equipamentos.forEach(eq => {
        eq.custo = calcularCustoEquipamento(eq.potencia, eq.tempoTotalH, eq.diasUso, valorKWh);
        custoTotal += eq.custo;

        const horasInteiras = Math.floor(eq.tempoTotalH);
        const minutos = Math.round((eq.tempoTotalH - horasInteiras) * 60);
        const tempoDisplay = `${horasInteiras}h ${minutos}m`;

        htmlContent += `
            <div class="equipamento-item">
                <div class="item-info">
                    <strong>${eq.nome}</strong>
                    <small>${eq.potencia}W | ${tempoDisplay}/dia | ${eq.diasUso} dias</small>
                </div>
                <span class="item-cost">R$ ${eq.custo.toFixed(2)}</span>
                <button class="delete-btn" onclick="removerEquipamento(${eq.id})">
                    <span class="icon">×</span>
                </button>
            </div>
        `;
        equipamentosCalculados.push(eq);
    });

    // Salva o estado para o PDF
    lastEnergiaResults = {
        valorKWh,
        equipamentos: equipamentosCalculados,
        custoTotal: custoTotal
    };

    listaContainer.innerHTML = htmlContent;
    custoTotalSpan.textContent = `R$ ${custoTotal.toFixed(2)}`;
}


// ========================================================
// 4. GADGET 3: CALCULADORA DE PRODUTIVIDADE (Mantido - Salva no estado)
// ========================================================

function renderProdutividade() {
    appContainer.innerHTML = `
        <section id="gadget-produtividade" class="gadget-screen active">
            <h2>📈 Produtividade e Análise de Tempo</h2>
            <form id="form-produtividade">
                
                <h4>Dados Financeiros e Frequência</h4>
                <div class="input-group">
                    <label for="salario_mensal">Salário Mensal (R$):</label>
                    <input type="number" id="salario_mensal" value="5000.00" step="0.01" required>
                </div>
                <div class="input-group">
                    <label for="dias_uteis_semana">Dias Úteis na Semana:</label>
                    <input type="number" id="dias_uteis_semana" value="5" min="1" max="7" required>
                </div>

                <h4>Tempo Gasto por Categoria (Horas Diárias)</h4>
                <div class="input-group">
                    <label for="horas_trabalho">1. Trabalho/Foco (*Remunerado*):</label>
                    <input type="number" id="horas_trabalho" value="6" step="0.1" required>
                </div>
                <div class="input-group">
                    <label for="tempo_estudo">2. Estudo/Desenvolvimento:</label>
                    <input type="number" id="tempo_estudo" value="2" step="0.1" required>
                </div>
                 <div class="input-group">
                    <label for="tempo_lazer">3. Lazer/Pessoal:</label>
                    <input type="number" id="tempo_lazer" value="3" step="0.1" required>
                </div>
                <div class="input-group">
                    <label for="tempo_distracao">4. Distrações (Não-Produtivo):</label>
                    <input type="number" id="tempo_distracao" value="1.5" step="0.1" required>
                </div>
                <div class="input-group">
                    <label for="tempo_deslocamento">5. Deslocamento/Trânsito:</label>
                    <input type="number" id="tempo_deslocamento" value="1" step="0.1" required>
                </div>
                
                <button type="submit" class="cta-button">Analisar Produtividade</button>
                
                <div class="result-box" id="prod-result-box">
                    <p class="section-title">Análise Diária</p>
                    <p>Custo da Hora: <span id="custo-hora">R$ 0.00</span></p>
                    <p>Taxa de Eficiência (Foco/Foco+Distração): <span id="taxa-eficiencia">0%</span></p>
                    <p>Custo Diário da Distração: <span id="custo-distracao">R$ 0.00</span></p>

                    <p class="section-title">Análise Semanal</p>
                    <p>Horas Perdidas na Semana: <span id="horas-perdidas-semana">0.0h</span></p>
                    <p>Custo Semanal da Distração: <span id="custo-distracao-semanal">R$ 0.00</span></p>
                    
                    <p class="insight-text" id="prod-insight">...</p>
                </div>
            </form>
            <div class="action-buttons-group">
                <button type="button" class="cta-button small-button action-button" onclick="generatePdf('produtividade')">
                    Baixar Relatório (PDF)
                </button>
                <button type="button" class="cta-button small-button secondary-button" onclick="shareContent('produtividade')">
                    Compartilhar
                </button>
            </div>
        </section>
    `;
    attachProdutividadeListeners();
}

function attachProdutividadeListeners() {
    document.getElementById('form-produtividade').addEventListener('submit', analisarProdutividade);
}

function analisarProdutividade(event) {
    event.preventDefault();

    // 1. Coleta de Dados
    const salarioMensal = parseFloat(document.getElementById('salario_mensal').value) || 0;
    const diasUteisSemana = parseInt(document.getElementById('dias_uteis_semana').value) || 5;
    const horasTrabalho = parseFloat(document.getElementById('horas_trabalho').value) || 0;
    const tempoEstudo = parseFloat(document.getElementById('tempo_estudo').value) || 0;
    const tempoLazer = parseFloat(document.getElementById('tempo_lazer').value) || 0;
    const tempoDistracao = parseFloat(document.getElementById('tempo_distracao').value) || 0;
    const tempoDeslocamento = parseFloat(document.getElementById('tempo_deslocamento').value) || 0;
    
    // 2. Cálculos de Base
    const horasUteisMes = 4.3 * diasUteisSemana * horasTrabalho; // 4.3 semanas em um mês
    const custoHora = horasUteisMes > 0 ? salarioMensal / horasUteisMes : 0;
    
    // 3. Métricas Diárias
    const horasTotaisFoco = horasTrabalho + tempoEstudo;
    const baseEficiencia = horasTotaisFoco + tempoDistracao;
    const taxaEficiencia = baseEficiencia > 0 ? (horasTotaisFoco / baseEficiencia) * 100 : 0;
    const custoDistracaoDiario = tempoDistracao * custoHora;

    // 4. Métricas Semanais
    const horasPerdidasSemana = tempoDistracao * diasUteisSemana;
    const custoDistracaoSemanal = custoDistracaoDiario * diasUteisSemana;

    // 5. Insights
    let insight = "";
    if (taxaEficiencia >= 75) {
        insight = `Ótimo! Sua eficiência é alta (${taxaEficiencia.toFixed(1)}%). Seu foco está sendo recompensado.`;
    } else if (taxaEficiencia >= 50) {
        insight = `Bom. Sua eficiência está em ${taxaEficiencia.toFixed(1)}%. Tente reduzir as ${tempoDistracao.toFixed(1)} horas de distração para melhorar.`;
    } else {
        insight = `Alerta! Sua eficiência está baixa. O custo semanal de R$ ${custoDistracaoSemanal.toFixed(2)} por distração é significativo. Priorize o Foco.`;
    }

    // 6. Atualiza o DOM
    document.getElementById('custo-hora').textContent = `R$ ${custoHora.toFixed(2)}`;
    document.getElementById('taxa-eficiencia').textContent = `${taxaEficiencia.toFixed(1)}%`;
    document.getElementById('custo-distracao').textContent = `R$ ${custoDistracaoDiario.toFixed(2)}`;
    document.getElementById('horas-perdidas-semana').textContent = `${horasPerdidasSemana.toFixed(1)}h`;
    document.getElementById('custo-distracao-semanal').textContent = `R$ ${custoDistracaoSemanal.toFixed(2)}`;
    document.getElementById('prod-insight').textContent = insight;

    // 7. Salva resultados para o PDF
    lastProdutividadeResults = {
        salarioMensal, diasUteisSemana, horasTrabalho, tempoEstudo, tempoLazer, tempoDistracao, tempoDeslocamento,
        custoHora, taxaEficiencia, custoDistracaoDiario, horasPerdidasSemana, custoDistracaoSemanal, insight
    };
}


// ========================================================
// 5. GADGET 4: GERADOR DE DOCUMENTOS (Cálculos atualizados para estado)
// ========================================================

function renderDocumentos() {
    appContainer.innerHTML = `
        <section id="gadget-documentos" class="gadget-screen active">
            <h2>📄 Gerador de Documentos</h2>
            
            <div class="segment-control" id="doc-type-control">
                <button class="${docType === 'OS' ? 'active' : ''}" onclick="setDocType('OS')">Ordem de Serviço</button>
                <button class="${docType === 'Nota' ? 'active' : ''}" onclick="setDocType('Nota')">Nota de Serviço</button>
                <button class="${docType === 'Orcamento' ? 'active' : ''}" onclick="setDocType('Orcamento')">Orçamento</button>
            </div>
            
            <form id="form-documentos">
                <h3 id="doc-title-display">${getDocTitle(docType)}</h3>

                <h4>Dados do Emissor</h4>
                <div class="input-group">
                    <label for="doc_empresa">Nome da Empresa/Emissor:</label>
                    <input type="text" id="doc_empresa" required>
                </div>
                <div class="input-group half-group">
                    <label for="doc_cnpj">CNPJ/CPF:</label>
                    <input type="text" id="doc_cnpj" placeholder="00.000.000/0000-00" required>
                </div>
                <div class="input-group half-group">
                    <label for="doc_telefone">Telefone:</label>
                    <input type="tel" id="doc_telefone" placeholder="(99) 99999-9999" required>
                </div>
                <div class="input-group">
                    <label for="doc_email">E-mail:</label>
                    <input type="email" id="doc_email" required>
                </div>

                <h4 id="itens-title">${getDocItemsTitle(docType)}</h4>
                <div id="itens-list" class="list-container">
                    </div>
                
                <div class="add-form">
                    <div class="input-group">
                        <label for="item_descricao">Descrição:</label>
                        <input type="text" id="item_descricao" placeholder="Serviço de instalação, Produto X" required>
                    </div>
                    <div class="input-group half-group">
                        <label for="item_quantidade">Qtd:</label>
                        <input type="number" id="item_quantidade" value="1" min="1" required>
                    </div>
                    <div class="input-group half-group">
                        <label for="item_valor">Valor Unitário (R$):</label>
                        <input type="number" id="item_valor" value="0.00" step="0.01" required>
                    </div>
                    <button type="button" class="cta-button small-button" onclick="adicionarItemDoc()">Adicionar Item</button>
                </div>

                <div class="input-group" style="margin-top: 20px;">
                    <label for="doc_info_extra">Informação Extra / Observações:</label>
                    <textarea id="doc_info_extra" rows="3" placeholder="Prazo de pagamento, garantia, etc."></textarea>
                </div>

                <div class="result-box">
                     <p>Valor Total: <span id="doc-valor-total">R$ ${calculateDocTotal().toFixed(2)}</span></p>
                </div>

                <button type="submit" class="cta-button">Gerar Documento</button>
            </form>
            <div class="action-buttons-group">
                <button type="button" class="cta-button small-button action-button" onclick="generatePdf('documentos')">
                    Baixar (PDF)
                </button>
                <button type="button" class="cta-button small-button secondary-button" onclick="shareContent('documentos')">
                    Compartilhar
                </button>
            </div>
        </section>
    `;
    attachDocumentosListeners();
    renderizarItensDoc();
}

function attachDocumentosListeners() {
    const formDocumentos = document.getElementById('form-documentos');
    if (formDocumentos) {
        formDocumentos.addEventListener('submit', gerarDocumento);
    }
}

function getDocTitle(type) {
    if (type === 'Nota') return 'Nota Simples de Serviço';
    if (type === 'Orcamento') return 'Orçamento';
    return 'Ordem de Serviço';
}

function getDocItemsTitle(type) {
    if (type === 'Nota') return 'Itens Faturados';
    if (type === 'Orcamento') return 'Serviços/Produtos Ofertados';
    return 'Serviços Prestados / Itens';
}

function setDocType(type) {
    docType = type;
    renderDocumentos();
}

function adicionarItemDoc() {
    const descricao = document.getElementById('item_descricao').value.trim();
    const quantidade = parseFloat(document.getElementById('item_quantidade').value) || 0;
    const valorUnitario = parseFloat(document.getElementById('item_valor').value) || 0;

    if (!descricao || quantidade <= 0 || valorUnitario < 0) {
        alert("Preencha a descrição, quantidade (maior que zero) e valor unitário do item.");
        return;
    }

    const novoItem = {
        id: Date.now(),
        descricao: descricao,
        quantidade: quantidade,
        valorUnitario: valorUnitario,
        valorTotal: quantidade * valorUnitario
    };

    docItens.push(novoItem);
    renderizarItensDoc();

    document.getElementById('item_descricao').value = '';
    document.getElementById('item_quantidade').value = 1;
    document.getElementById('item_valor').value = 0.00;
}

function removerItemDoc(id) {
    docItens = docItens.filter(item => item.id !== id);
    renderizarItensDoc();
}

function calculateDocTotal() {
    return docItens.reduce((total, item) => total + item.valorTotal, 0);
}

function renderizarItensDoc() {
    const listaContainer = document.getElementById('itens-list');
    const valorTotalSpan = document.getElementById('doc-valor-total');
    if (!listaContainer || !valorTotalSpan) return;

    let valorTotalDoc = 0;
    let htmlContent = '';

    if (docItens.length === 0) {
        htmlContent = '<p class="placeholder-text">Adicione itens abaixo.</p>';
    } else {
        docItens.forEach(item => {
            valorTotalDoc += item.valorTotal;

            htmlContent += `
                <div class="item-servico">
                    <div class="info">
                        <strong>${item.descricao}</strong>
                        <small>Qtd: ${item.quantidade} | R$ ${item.valorUnitario.toFixed(2)} / un.</small>
                    </div>
                    <span class="valor-total">R$ ${item.valorTotal.toFixed(2)}</span>
                    <button class="delete-btn" onclick="removerItemDoc(${item.id})">
                        <span class="icon">×</span>
                    </button>
                </div>
            `;
        });
    }

    // Salva o estado para o PDF
    lastDocumentosData = {
        empresa: document.getElementById('doc_empresa')?.value || '',
        cnpj: document.getElementById('doc_cnpj')?.value || '',
        telefone: document.getElementById('doc_telefone')?.value || '',
        email: document.getElementById('doc_email')?.value || '',
        infoExtra: document.getElementById('doc_info_extra')?.value || '',
        docType: docType,
        itens: docItens,
        valorTotal: valorTotalDoc
    };

    listaContainer.innerHTML = htmlContent;
    valorTotalSpan.textContent = `R$ ${valorTotalDoc.toFixed(2)}`;
}

function gerarDocumento(event) {
    event.preventDefault();

    const empresa = document.getElementById('doc_empresa').value.trim();
    const cnpj = document.getElementById('doc_cnpj').value.trim();
    
    // Atualiza o estado da empresa/emissor, pois eles não são atualizados em renderizarItensDoc()
    lastDocumentosData.empresa = empresa;
    lastDocumentosData.cnpj = cnpj;
    
    if (!empresa || !cnpj || docItens.length === 0) {
        alert(`Por favor, preencha os dados da empresa e adicione pelo menos um item para gerar o(a) ${docType}.`);
        return;
    }

    // Se a validação for OK, gera o PDF de verdade
    generatePdf('documentos');
}


// ========================================================
// 6. FUNÇÕES DE AÇÃO GERAL (PDF/Compartilhar) - GERAÇÃO PROGRAMÁTICA PARA TODOS
// ========================================================

/**
 * Função para gerar PDF (router principal).
 * Chama a função de layout programático específica para cada gadget.
 * @param {string} gadgetId - O ID do gadget.
 */
function generatePdf(gadgetId) {
    switch (gadgetId) {
        case 'viagem':
            generateViagemPdf();
            break;
        case 'energia':
            generateEnergiaPdf();
            break;
        case 'produtividade':
            generateProdutividadePdf();
            break;
        case 'documentos':
            generateDocumentosPdf();
            break;
        default:
            alert("Gadget não encontrado ou sem função de PDF profissional implementada.");
    }
}

// ----------------------------------------------------
// IMPLEMENTAÇÃO DE PDF PROGRAMÁTICO (PRODUTIVIDADE) - Reutilizado
// ----------------------------------------------------

function generateProdutividadePdf() {
    if (!lastProdutividadeResults || Object.keys(lastProdutividadeResults).length === 0) {
        alert("Por favor, clique em 'Analisar Produtividade' antes de gerar o relatório.");
        return;
    }

    const data = lastProdutividadeResults;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4, em milímetros (210x297)

    let y = 20;
    const margin = 15;
    const lineSpacing = 8;
    
    // Título
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text("Relatório de Produtividade e Análise de Valor", margin, y);
    y += 15;

    // Linha Divisória
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, 195, y); 
    y += 10;

    // Informações Chave
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Parâmetros Financeiros", margin, y);
    y += lineSpacing;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Salário Mensal Estimado: R$ ${data.salarioMensal.toFixed(2)}`, margin, y);
    pdf.text(`Dias Úteis/Semana: ${data.diasUteisSemana}`, 110, y);
    y += lineSpacing;
    pdf.text(`Custo Estimado da Hora de Trabalho: R$ ${data.custoHora.toFixed(2)}`, margin, y);
    y += 15;

    // Tabela de Tempo
    pdf.setFont('helvetica', 'bold');
    pdf.text("Distribuição do Tempo Diário (Horas)", margin, y);
    y += lineSpacing;

    const headers = [["Categoria", "Horas Diárias"]];
    const body = [
        ["Trabalho/Foco (Produtivo)", `${data.horasTrabalho.toFixed(1)}h`],
        ["Estudo/Desenvolvimento (Produtivo)", `${data.tempoEstudo.toFixed(1)}h`],
        ["Lazer/Pessoal (Essencial)", `${data.tempoLazer.toFixed(1)}h`],
        ["Deslocamento/Trânsito (Necessário)", `${data.tempoDeslocamento.toFixed(1)}h`],
        ["Distrações (Não-Produtivo)", `${data.tempoDistracao.toFixed(1)}h`],
    ];

    pdf.autoTable({
        startY: y,
        head: headers,
        body: body,
        theme: 'striped',
        styles: { fontSize: 10, font: 'helvetica' },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 }, 
        margin: { left: margin, right: 15 }
    });

    y = pdf.autoTable.previous.finalY + 10; 

    // Resultados da Análise
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text("Análise de Produtividade e Impacto Financeiro", margin, y);
    y += lineSpacing;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Taxa de Eficiência (Diária): ${data.taxaEficiencia.toFixed(1)}%`, margin, y);
    y += lineSpacing;
    pdf.text(`Horas Perdidas na Semana por Distração: ${data.horasPerdidasSemana.toFixed(1)}h`, margin, y);
    y += lineSpacing;
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(192, 57, 43); 
    pdf.text(`Custo Semanal da Distração: R$ ${data.custoDistracaoSemanal.toFixed(2)}`, margin, y);
    pdf.setTextColor(0); 
    y += lineSpacing + 5;

    // Insight
    pdf.setFont('helvetica', 'bold');
    pdf.text("Insight:", margin, y);
    pdf.setFont('helvetica', 'normal');
    y += lineSpacing;
    pdf.text(pdf.splitTextToSize(data.insight, 170), margin, y); 

    // Rodapé
    pdf.setFontSize(8);
    pdf.text("Gerado por Smart Hub - Dev Web em " + new Date().toLocaleDateString('pt-BR'), 10, 290);
    
    pdf.save("Relatorio_Produtividade_Profissional.pdf");
}


// ----------------------------------------------------
// IMPLEMENTAÇÃO DE PDF PROGRAMÁTICO (VIAGEM) - NOVO
// ----------------------------------------------------

function generateViagemPdf() {
    if (!lastViagemResults || Object.keys(lastViagemResults).length === 0) {
        alert("Por favor, calcule os custos de viagem antes de gerar o relatório.");
        return;
    }
    const data = lastViagemResults;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    let y = 20;
    const margin = 15;
    const lineSpacing = 8;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    const title = data.model === 'avancado' ? "Relatório TCO (Custo Total de Propriedade) da Viagem" : "Relatório Básico de Custo de Viagem";
    pdf.text(title, margin, y);
    y += 15;
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, 195, y); 
    y += 10;

    // Dados Principais
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Dados da Viagem", margin, y);
    y += lineSpacing;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Distância: ${data.distancia.toFixed(0)} Km`, margin, y);
    pdf.text(`Consumo Médio: ${data.consumoMedio.toFixed(2)} Km/L`, 110, y);
    y += lineSpacing;
    pdf.text(`Preço do Combustível: R$ ${data.precoCombustivel.toFixed(2)}/L`, margin, y);
    y += 15;

    // Resultados de Combustível
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text("Cálculo de Combustível", margin, y);
    y += lineSpacing;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    const bodyCombustivel = [
        ["Litros Gastos", `${data.litrosGasto.toFixed(2)} L`],
        ["Custo Total do Combustível", `R$ ${data.custoTotalCombustivel ? data.custoTotalCombustivel.toFixed(2) : data.custoTotal.toFixed(2)}`],
    ];
    
    pdf.autoTable({
        startY: y,
        head: [['Métrica', 'Valor']],
        body: bodyCombustivel,
        theme: 'grid',
        styles: { fontSize: 10, font: 'helvetica' },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        margin: { left: margin, right: 15 }
    });
    y = pdf.autoTable.previous.finalY + 10;
    
    // Modelo Avançado (TCO)
    if (data.model === 'avancado') {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text("Cálculo de TCO (Custos Adicionais)", margin, y);
        y += lineSpacing;

        const bodyTCO = [];
        bodyTCO.push(["Pedágios/Taxas", `R$ ${data.pedagios.toFixed(2)}`]);
        bodyTCO.push(["Custo de Manutenção (Óleo/Pneu)", `R$ ${data.custoManutencao.custoTotalManutencaoViagem.toFixed(2)}`]);
        
        if (data.custoExtras.diaria) {
            bodyTCO.push(["Diárias/Alimentação", `R$ ${data.custoExtras.diaria.custo.toFixed(2)}`]);
        }
        if (data.custoExtras.arla) {
            bodyTCO.push(["Custo ARLA 32", `R$ ${data.custoExtras.arla.custo.toFixed(2)}`]);
        }

        pdf.autoTable({
            startY: y,
            head: [['Descrição', 'Custo']],
            body: bodyTCO,
            theme: 'striped',
            styles: { fontSize: 10, font: 'helvetica' },
            headStyles: { fillColor: [243, 156, 18], textColor: 0 }, // Laranja
            margin: { left: margin, right: 15 }
        });
        y = pdf.autoTable.previous.finalY + 10;
    }

    // Custo Total Final
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text("CUSTO TOTAL DA VIAGEM:", margin, y);
    pdf.setTextColor(46, 204, 113); // Verde
    pdf.text(`R$ ${data.custoTotal.toFixed(2)}`, 110, y);
    pdf.setTextColor(0); // Volta ao preto
    y += lineSpacing;
    
    // Rodapé
    pdf.setFontSize(8);
    pdf.text("Gerado por Smart Hub - Dev Web em " + new Date().toLocaleDateString('pt-BR'), 10, 290);

    pdf.save(`Relatorio_Viagem_${data.model.toUpperCase()}.pdf`);
}


// ----------------------------------------------------
// IMPLEMENTAÇÃO DE PDF PROGRAMÁTICO (ENERGIA) - NOVO
// ----------------------------------------------------

function generateEnergiaPdf() {
    if (!lastEnergiaResults || lastEnergiaResults.equipamentos?.length === 0) {
        alert("Por favor, adicione e calcule o custo de pelo menos um equipamento.");
        return;
    }
    const data = lastEnergiaResults;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    let y = 20;
    const margin = 15;
    const lineSpacing = 8;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text("Relatório de Consumo de Energia Mensal", margin, y);
    y += 15;
    pdf.setLineWidth(0.5);
    pdf.line(margin, y, 195, y); 
    y += 10;

    // Dados de Entrada
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text("Parâmetros", margin, y);
    y += lineSpacing;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.text(`Valor do kW/h: R$ ${data.valorKWh.toFixed(3)}`, margin, y);
    y += 10;
    
    // Tabela de Equipamentos
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text("Detalhamento por Equipamento", margin, y);
    y += lineSpacing;

    const headers = [["Equipamento", "Potência (W)", "Uso Diário (h)", "Dias/Mês", "Custo Mensal (R$)"]];
    const body = data.equipamentos.map(eq => {
        return [
            eq.nome,
            `${eq.potencia} W`,
            `${eq.tempoTotalH.toFixed(1)} h`,
            `${eq.diasUso}`,
            `R$ ${eq.custo.toFixed(2)}`
        ];
    });

    pdf.autoTable({
        startY: y,
        head: headers,
        body: body,
        theme: 'striped',
        styles: { fontSize: 10, font: 'helvetica', cellWidth: 'wrap' },
        headStyles: { fillColor: [52, 152, 219], textColor: 255 }, // Azul
        margin: { left: margin, right: 15 }
    });
    y = pdf.autoTable.previous.finalY + 10;

    // Custo Total Final
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text("CUSTO TOTAL MENSAL ESTIMADO:", margin, y);
    pdf.setTextColor(46, 204, 113); // Verde
    pdf.text(`R$ ${data.custoTotal.toFixed(2)}`, 110, y);
    pdf.setTextColor(0); // Volta ao preto
    y += lineSpacing;
    
    // Rodapé
    pdf.setFontSize(8);
    pdf.text("Gerado por Smart Hub - Dev Web em " + new Date().toLocaleDateString('pt-BR'), 10, 290);

    pdf.save("Relatorio_Consumo_Energia.pdf");
}


// ----------------------------------------------------
// IMPLEMENTAÇÃO DE PDF PROGRAMÁTICO (DOCUMENTOS) - NOVO
// ----------------------------------------------------

function generateDocumentosPdf() {
    if (!lastDocumentosData || lastDocumentosData.itens?.length === 0) {
        alert("Preencha os dados da empresa e adicione pelo menos um item para gerar o documento.");
        return;
    }
    const data = lastDocumentosData;
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');

    let y = 20;
    const margin = 15;
    const lineSpacing = 7;
    
    // Título Principal (OS, Orçamento ou Nota)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(44, 62, 80);
    pdf.text(getDocTitle(data.docType).toUpperCase(), margin, y);
    y += 10;

    // Dados do Emissor (Caixa de Informações)
    pdf.setLineWidth(0.2);
    pdf.rect(margin, y, 180, 25); // Desenha a caixa
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(0);
    pdf.text("EMITENTE:", margin + 2, y + 4);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Empresa: ${data.empresa}`, margin + 2, y + 8);
    pdf.text(`CNPJ/CPF: ${data.cnpj}`, margin + 2, y + 12);
    pdf.text(`Tel: ${data.telefone}`, margin + 2, y + 16);
    pdf.text(`Email: ${data.email}`, margin + 2, y + 20);
    y += 35;

    // Tabela de Itens
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text(getDocItemsTitle(data.docType), margin, y);
    y += lineSpacing;

    const headers = [["Descrição", "Qtd", "V. Unitário (R$)", "V. Total (R$)"]];
    const body = data.itens.map(item => {
        return [
            item.descricao,
            `${item.quantidade}`,
            `R$ ${item.valorUnitario.toFixed(2)}`,
            `R$ ${item.valorTotal.toFixed(2)}`
        ];
    });

    pdf.autoTable({
        startY: y,
        head: headers,
        body: body,
        theme: 'grid',
        styles: { fontSize: 10, font: 'helvetica', cellWidth: 'wrap' },
        headStyles: { fillColor: [44, 62, 80], textColor: 255 },
        margin: { left: margin, right: 15 }
    });
    y = pdf.autoTable.previous.finalY + 10;
    
    // Valor Total
    pdf.setDrawColor(46, 204, 113); // Borda verde
    pdf.setLineWidth(0.8);
    pdf.rect(140, y, 55, 10);
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text("VALOR TOTAL:", 142, y + 7);
    pdf.setTextColor(46, 204, 113); // Verde
    pdf.text(`R$ ${data.valorTotal.toFixed(2)}`, 180, y + 7, { align: "right" });
    pdf.setTextColor(0);
    y += 15;

    // Observações
    if (data.infoExtra) {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text("Observações/Condições:", margin, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        y += lineSpacing;
        const textLines = pdf.splitTextToSize(data.infoExtra, 180);
        pdf.text(textLines, margin, y);
        y += textLines.length * 4 + 10;
    }
    
    // Assinaturas (Simulação)
    pdf.line(margin + 5, 270, 95, 270);
    pdf.text("Assinatura do Emissor", margin + 10, 274);
    
    pdf.line(115, 270, 185, 270);
    pdf.text("Assinatura do Cliente", 125, 274);
    
    // Rodapé
    pdf.setFontSize(8);
    pdf.text("Documento gerado por Smart Hub - Dev Web em " + new Date().toLocaleDateString('pt-BR'), 10, 290);

    pdf.save(`${getDocTitle(data.docType).replace(/\s/g, '_')}_${Date.now()}.pdf`);
}


// ----------------------------------------------------
// FUNÇÃO DE COMPARTILHAMENTO (Mantido)
// ----------------------------------------------------

function shareContent(gadgetId) {
    const titleMap = {
        'viagem': 'Relatório de Custo de Viagem',
        'energia': 'Relatório de Consumo de Energia',
        'produtividade': 'Relatório de Produtividade e Foco',
        'documentos': getDocTitle(docType)
    };
    
    const title = titleMap[gadgetId] || 'Relatório Smart Hub';
    
    if (navigator.share) {
        navigator.share({
            title: title,
            text: `Confira a análise gerada pelo Smart Hub: ${title}.`,
            url: window.location.href 
        }).catch((error) => {
            alert(`[Ação Simulado] Compartilhamento de ${title} pronto! Use a função nativa do seu dispositivo.`);
        });
    } else {
        alert(`[Ação Simulado] Compartilhamento de ${title} pronto! (URL: ${window.location.href}). Clique em Baixar para obter o PDF.`);
    }
}


// ========================================================
// 7. INICIALIZAÇÃO DA APLICAÇÃO (Mantido)
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.app-nav .nav-item').forEach(button => {
        button.addEventListener('click', () => {
            showGadget(button.getAttribute('data-gadget-id'));
        });
    });

    showGadget('viagem');
});