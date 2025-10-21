// ========================================================
// RECURSOS GLOBAIS
// ========================================================

const appContainer = document.getElementById('app-content-container');
let equipamentos = []; // Estado global para o gadget de Energia
let docItens = [];     // Estado global para o gadget de Documentos
let docType = 'OS';    // Estado global para o tipo de Documento

// ========================================================
// 1. O ROUTER E NAVEGAÇÃO
// ========================================================

/**
 * Funções de renderização para cada gadget (definidas abaixo)
 */
const gadgetRenderers = {
    'viagem': renderViagem,
    'energia': renderEnergia,
    'produtividade': renderProdutividade,
    'documentos': renderDocumentos
};

/**
 * Função principal de navegação (Substitui showGadget)
 * @param {string} gadgetId - O ID do gadget a ser renderizado.
 */
function showGadget(gadgetId) {
    // 1. Limpa o container principal
    appContainer.innerHTML = '';
    
    // 2. Renderiza o HTML do gadget
    if (gadgetRenderers[gadgetId]) {
        gadgetRenderers[gadgetId]();
    } else {
        appContainer.innerHTML = `<section class="gadget-screen"><h2>Em Desenvolvimento</h2><p>O gadget ${gadgetId} está sendo construído!</p></section>`;
    }

    // 3. Atualiza o estado 'active' na barra de navegação
    document.querySelectorAll('.app-nav .nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-gadget-id') === gadgetId) {
            item.classList.add('active');
        }
    });

    // 4. Se o gadget for 'viagem', garante que o modelo básico seja inicializado
    if (gadgetId === 'viagem') {
        showViagemModel('basico');
    }
}

// ========================================================
// 2. GADGET 1: CALCULADORA DE VIAGEM (RENDERIZAÇÃO)
// ========================================================

function renderViagem() {
    appContainer.innerHTML = `
        <section id="gadget-viagem" class="gadget-screen active">
            <h2>🚗 Calculadora de Viagem</h2>
            <div class="segment-control">
                <button class="active" onclick="showViagemModel('basico')">Básico</button>
                <button onclick="showViagemModel('avancado')">Avançado</button>
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
                        <input type="checkbox" id="check_pesado" onchange="toggleHeavyVehicleFields()">
                        <label for="check_pesado">Veículo Pesado (Adicionar Arla)</label>
                    </div>
                    <div class="checkbox-group">
                        <input type="checkbox" id="check_diarias" onchange="toggleDriverDailyFields()">
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
                     <button type="button" class="cta-button small-button action-button" onclick="sharePdf('viagem')">
                        Baixar/Compartilhar Relatório (PDF)
                    </button>
                </form>
            </div>
        </section>
    `;
    // Anexa os Listeners após a injeção do HTML
    attachViagemListeners();
}


// --------------------------------------------------------
// Lógica de Viagem (Mantida)
// --------------------------------------------------------

function attachViagemListeners() {
    document.getElementById('form-viagem-basico').addEventListener('submit', calcularViagemBasico);
    document.getElementById('form-viagem-avancado').addEventListener('submit', calcularViagemAvancado);
}

function calcularViagemBasico(event) {
    event.preventDefault(); 
    // Lógica BÁSICA
    const precoCombustivel = parseFloat(document.getElementById('combustivel').value);
    const consumoMedio = parseFloat(document.getElementById('consumo').value);
    const distancia = parseFloat(document.getElementById('distancia').value);

    if (isNaN(precoCombustivel) || isNaN(consumoMedio) || isNaN(distancia) || consumoMedio <= 0) {
        alert("Preencha todos os campos do modelo Básico com valores válidos.");
        return;
    }

    const litrosGasto = distancia / consumoMedio;
    const custoTotal = litrosGasto * precoCombustivel;

    document.getElementById('litros-gasto').textContent = litrosGasto.toFixed(2);
    document.getElementById('custo-total').textContent = `R$ ${custoTotal.toFixed(2)}`;
}

function calcularViagemAvancado(event) {
    event.preventDefault(); 

    const precoCombustivel = parseFloat(document.getElementById('combustivel_av').value);
    const consumoMedio = parseFloat(document.getElementById('consumo_av').value);
    const distancia = parseFloat(document.getElementById('distancia_av').value);
    const pedagios = parseFloat(document.getElementById('pedagios').value);
    const custoPneu = parseFloat(document.getElementById('custo_pneu').value);
    const kmPneu = parseFloat(document.getElementById('km_pneu').value);
    const custoOleo = parseFloat(document.getElementById('custo_oleo').value);
    const kmOleo = parseFloat(document.getElementById('km_oleo').value);

    if (isNaN(distancia) || consumoMedio <= 0 || kmPneu <= 0 || kmOleo <= 0) {
         alert("Distância, Consumo, Km Pneu e Km Óleo devem ser maiores que zero.");
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

    // ARLA
    if (document.getElementById('check_pesado') && document.getElementById('check_pesado').checked) {
        const consumoArla = parseFloat(document.getElementById('consumo_arla').value);
        const precoArla = parseFloat(document.getElementById('preco_arla').value);

        if (!isNaN(consumoArla) && !isNaN(precoArla) && distancia > 0) {
            const litrosArla = (distancia / 100) * consumoArla;
            custoExtras += litrosArla * precoArla;
        }
    }

    // DIÁRIAS
    if (document.getElementById('check_diarias') && document.getElementById('check_diarias').checked) {
        const diasViagem = parseFloat(document.getElementById('dias_viagem').value);
        const custoDiaria = parseFloat(document.getElementById('custo_diaria').value);
        
        if (!isNaN(diasViagem) && !isNaN(custoDiaria)) {
            custoExtras += diasViagem * custoDiaria;
        }
    }

    // CUSTO FINAL (TCO)
    const custoTotalAvancado = custoTotalCombustivel + custoTotalManutencaoViagem + pedagios + custoExtras;

    document.getElementById('custo-km-manutencao').textContent = `R$ ${custoKmManutencaoTotal.toFixed(4)}`; 
    document.getElementById('custo-extras').textContent = `R$ ${custoExtras.toFixed(2)}`;
    document.getElementById('litros-gasto-av').textContent = litrosGasto.toFixed(2);
    document.getElementById('custo-total-av').textContent = `R$ ${custoTotalAvancado.toFixed(2)}`;
}

// ========================================================
// 3. GADGET 2: CALCULADORA DE ENERGIA (RENDERIZAÇÃO)
// ========================================================

function renderEnergia() {
    // Nota: O estado 'equipamentos' é global e persistirá entre as trocas de gadget.
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
            <button type="button" class="cta-button small-button action-button" onclick="sharePdf('energia')">
                Baixar/Compartilhar Relatório (PDF)
            </button>
        </section>
    `;
    // Anexa Listeners e renderiza a lista inicial
    attachEnergiaListeners();
    renderizarEquipamentos(); 
}

// --------------------------------------------------------
// Lógica de Energia (Mantida e Ajustada para renderização dinâmica)
// --------------------------------------------------------

function attachEnergiaListeners() {
    document.getElementById('form-novo-equipamento').addEventListener('submit', adicionarEquipamento);
    document.getElementById('valor_kwh').addEventListener('change', renderizarEquipamentos);
    document.getElementById('valor_kwh').addEventListener('input', renderizarEquipamentos); 
}

function adicionarEquipamento(event) {
    event.preventDefault();

    const nome = document.getElementById('nome_equipamento').value.trim();
    const potencia = parseFloat(document.getElementById('potencia_w').value);
    const tempoMin = parseFloat(document.getElementById('tempo_min').value) || 0;
    const tempoH = parseFloat(document.getElementById('tempo_h').value) || 0;
    const dias = parseInt(document.getElementById('dias_uso').value);

    const tempoTotalH = tempoH + (tempoMin / 60);

    if (!nome || isNaN(potencia) || isNaN(tempoTotalH) || isNaN(dias) || potencia <= 0 || tempoTotalH <= 0 || dias <= 0) {
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

// A função renderizarEquipamentos deve ser global para ser chamada pelo JS
function renderizarEquipamentos() {
    const listaContainer = document.getElementById('equipamentos-list');
    if (!listaContainer) return; // Garante que estamos na tela correta

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
    });

    listaContainer.innerHTML = htmlContent;
    document.getElementById('custo-total-energia').textContent = `R$ ${custoTotal.toFixed(2)}`;
}

// ========================================================
// 4. GADGET 3: CALCULADORA DE PRODUTIVIDADE (RENDERIZAÇÃO)
// ========================================================

function renderProdutividade() {
    appContainer.innerHTML = `
        <section id="gadget-produtividade" class="gadget-screen active">
            <h2>📈 Produtividade Pessoal & Balance Score</h2>
            <form id="form-produtividade">
                <h4>Tempo Gasto por Categoria (Horas Diárias)</h4>
                <div class="input-group">
                    <label for="horas_trabalho">1. Trabalho/Foco:</label>
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
                    <label for="tempo_distracao">4. Distrações (Não-Planejado):</label>
                    <input type="number" id="tempo_distracao" value="1.5" step="0.1" required>
                </div>
                <div class="input-group">
                    <label for="tempo_deslocamento">5. Deslocamento/Trânsito:</label>
                    <input type="number" id="tempo_deslocamento" value="1" step="0.1" required>
                </div>
                
                <div class="input-group">
                    <label for="salario_hora">Valor da Hora (R$/h - Opcional):</label>
                    <input type="number" id="salario_hora" placeholder="Ex: 25.00" step="0.01">
                </div>
                <button type="submit" class="cta-button">Analisar Produtividade</button>
                
                <div class="result-box">
                    <p>Produtividade Essencial (Trabalho/Estudo): <span id="taxa-eficiencia">0%</span></p>
                    <p>Horas Perdidas com Distração: <span id="horas-perdidas">0.0h</span></p>
                    <p>Custo da Distração Diária: <span id="custo-distracao">R$ 0.00</span></p>
                    <p class="insight-text" id="prod-insight">...</p>
                </div>
            </form>
        </section>
    `;
    attachProdutividadeListeners();
}

// --------------------------------------------------------
// Lógica de Produtividade
// --------------------------------------------------------

function attachProdutividadeListeners() {
    document.getElementById('form-produtividade').addEventListener('submit', analisarProdutividade);
}

function analisarProdutividade(event) {
    event.preventDefault();

    const horasTrabalho = parseFloat(document.getElementById('horas_trabalho').value) || 0;
    const tempoEstudo = parseFloat(document.getElementById('tempo_estudo').value) || 0;
    const tempoLazer = parseFloat(document.getElementById('tempo_lazer').value) || 0;
    const tempoDistracao = parseFloat(document.getElementById('tempo_distracao').value) || 0;
    const tempoDeslocamento = parseFloat(document.getElementById('tempo_deslocamento').value) || 0;
    const salarioHora = parseFloat(document.getElementById('salario_hora').value) || 0;

    const horasTotaisFoco = horasTrabalho + tempoEstudo;
    const horasTotaisDia = horasTrabalho + tempoEstudo + tempoLazer + tempoDistracao + tempoDeslocamento;

    if (horasTotaisDia === 0 || horasTotaisFoco + tempoDistracao === 0) {
        document.getElementById('prod-insight').textContent = "Insira valores de tempo válidos para análise.";
        return;
    }

    const taxaEficiencia = (horasTotaisFoco / (horasTotaisFoco + tempoDistracao)) * 100;
    const custoDistracao = tempoDistracao * salarioHora;

    let insight = "";
    if (taxaEficiencia >= 70) {
        insight = `Ótimo! Sua eficiência é alta (${taxaEficiencia.toFixed(1)}%). Acima de 70% eleva suas chances de sucesso a longo prazo.`;
    } else if (taxaEficiencia >= 50) {
        insight = `Bom. Sua eficiência está em ${taxaEficiencia.toFixed(1)}%. Com menos ${tempoDistracao.toFixed(1)} horas de distração você pode atingir o nível ótimo.`;
    } else {
        insight = `Atenção. Sua eficiência está abaixo de 50%. Foque em reduzir as ${tempoDistracao.toFixed(1)} horas de distração para melhorar seus resultados.`;
    }

    document.getElementById('taxa-eficiencia').textContent = `${taxaEficiencia.toFixed(1)}%`;
    document.getElementById('horas-perdidas').textContent = `${tempoDistracao.toFixed(1)}h`;
    document.getElementById('custo-distracao').textContent = `R$ ${custoDistracao.toFixed(2)}`;
    document.getElementById('prod-insight').textContent = insight;
}

// ========================================================
// 5. GADGET 4: GERADOR DE DOCUMENTOS (RENDERIZAÇÃO)
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
                <button type="button" class="cta-button small-button action-button" onclick="sharePdf('documentos')">
                    Baixar/Compartilhar (PDF)
                </button>
            </form>
        </section>
    `;
    attachDocumentosListeners();
    renderizarItensDoc();
}

// --------------------------------------------------------
// Lógica de Documentos
// --------------------------------------------------------

function attachDocumentosListeners() {
    document.getElementById('form-documentos').addEventListener('submit', gerarDocumento);
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
    // Re-renderiza o gadget para atualizar títulos e botões
    renderDocumentos();
}

function adicionarItemDoc() {
    // ... (lógica de adicionar item - mantida)
    const descricao = document.getElementById('item_descricao').value.trim();
    const quantidade = parseInt(document.getElementById('item_quantidade').value);
    const valorUnitario = parseFloat(document.getElementById('item_valor').value);

    if (!descricao || isNaN(quantidade) || isNaN(valorUnitario) || quantidade <= 0 || valorUnitario < 0) {
        alert("Preencha a descrição, quantidade e valor unitário do item.");
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
    if (!listaContainer) return;

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

    listaContainer.innerHTML = htmlContent;
    document.getElementById('doc-valor-total').textContent = `R$ ${valorTotalDoc.toFixed(2)}`;
}

function gerarDocumento(event) {
    event.preventDefault();

    const empresa = document.getElementById('doc_empresa').value.trim();
    const cnpj = document.getElementById('doc_cnpj').value.trim();
    
    if (!empresa || !cnpj || docItens.length === 0) {
        alert(`Por favor, preencha os dados da empresa e adicione pelo menos um item para gerar o(a) ${docType}.`);
        return;
    }

    alert(`[Ação Simulada] Documento (${getDocTitle(docType)}) pronto para ser compartilhado!\nTotal: ${document.getElementById('doc-valor-total').textContent}`);
}


// ========================================================
// 6. FUNÇÕES DE AÇÃO GERAL (PDF/Compartilhar)
// ========================================================

function sharePdf(gadgetId) {
    const docTitle = {
        'viagem': 'Relatório de Custo de Viagem',
        'energia': 'Relatório de Consumo de Energia',
        'documentos': getDocTitle(docType)
    };
    
    alert(`[Ação Simulada]\nPreparando "${docTitle[gadgetId] || 'Relatório'}" para Download/Compartilhamento em PDF.`);
}

// ========================================================
// 7. INICIALIZAÇÃO DA APLICAÇÃO
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Adiciona listener nos botões de navegação para chamar o Router
    document.querySelectorAll('.app-nav .nav-item').forEach(button => {
        button.addEventListener('click', () => {
            showGadget(button.getAttribute('data-gadget-id'));
        });
    });

    // Inicia a aplicação no primeiro gadget ('viagem')
    showGadget('viagem');
});