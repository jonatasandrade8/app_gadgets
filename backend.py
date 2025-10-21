import json
from flask import Flask, request, send_file, jsonify
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from io import BytesIO

app = Flask(__name__)

# Funções de Geração de Relatório (Delegadas ao Backend)

def generate_produtividade_report(data):
    """Gera um PDF profissional para o gadget de Produtividade usando ReportLab."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, 
                            title="Relatório de Produtividade e Valor")
    styles = getSampleStyleSheet()
    elements = []

    # Título Principal
    elements.append(Paragraph("<b>Relatório de Produtividade e Análise de Valor</b>", styles['h1']))
    elements.append(Paragraph(f"<i>Gerado em: {request.date}</i>", styles['Normal']))
    
    # Parâmetros Financeiros
    elements.append(Paragraph("<br/><b>Parâmetros Financeiros</b>", styles['h2']))
    elements.append(Paragraph(f"Salário Mensal Estimado: R$ {data['salarioMensal']:.2f}", styles['Normal']))
    elements.append(Paragraph(f"Custo Estimado da Hora de Trabalho: <b>R$ {data['custoHora']:.2f}</b>", styles['Normal']))
    
    # Tabela de Tempo
    elements.append(Paragraph("<br/><b>Distribuição do Tempo Diário (Horas)</b>", styles['h2']))
    table_data = [
        ['Categoria', 'Horas Diárias'],
        ['Trabalho/Foco (Produtivo)', f"{data['horasTrabalho']:.1f}h"],
        ['Estudo/Desenvolvimento (Produtivo)', f"{data['tempoEstudo']:.1f}h"],
        ['Lazer/Pessoal (Essencial)', f"{data['tempoLazer']:.1f}h"],
        ['Deslocamento/Trânsito (Necessário)', f"{data['tempoDeslocamento']:.1f}h"],
        ['Distrações (Não-Produtivo)', f"{data['tempoDistracao']:.1f}h"],
    ]
    
    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2C3E50')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ])
    
    table = Table(table_data)
    table.setStyle(table_style)
    elements.append(table)
    
    # Análise de Impacto
    elements.append(Paragraph("<br/><b>Análise de Impacto Financeiro</b>", styles['h2']))
    elements.append(Paragraph(f"Taxa de Eficiência: {data['taxaEficiencia']:.1f}%", styles['Normal']))
    elements.append(Paragraph(f"Horas Perdidas na Semana: {data['horasPerdidasSemana']:.1f}h", styles['Normal']))
    
    # Destaque do Custo
    alert_style = styles['Normal']
    alert_style.textColor = colors.HexColor('#C0392B') # Vermelho
    elements.append(Paragraph(f"<br/><b>Custo Semanal da Distração: R$ {data['custoDistracaoSemanal']:.2f}</b>", alert_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer

# ... Outras funções de geração (generate_viagem_report, generate_energia_report, etc.) seriam implementadas aqui.

@app.route('/api/generate_pdf/<gadget_id>', methods=['POST'])
def generate_pdf_api(gadget_id):
    """API que recebe os dados e retorna o PDF como download."""
    
    if not request.is_json:
        return jsonify({"error": "Missing JSON in request"}), 400
    
    data = request.get_json()
    
    if gadget_id == 'produtividade':
        pdf_buffer = generate_produtividade_report(data)
        filename = "Relatorio_Produtividade.pdf"
    # elif gadget_id == 'viagem':
    #     pdf_buffer = generate_viagem_report(data)
    #     filename = "Custo_Viagem.pdf"
    # ... outros gadgets ...
    else:
        # Fallback para gadgets ainda não implementados no backend
        return jsonify({"message": f"Dados de {gadget_id} recebidos com sucesso. A geração real do PDF profissional para este gadget seria feita aqui."}), 200

    # Simulação do retorno de arquivo para download
    # return send_file(
    #     pdf_buffer,
    #     mimetype='application/pdf',
    #     as_attachment=True,
    #     download_name=filename
    # )
    
    return jsonify({"message": f"Sucesso na simulação de geração do PDF: {filename}. Role para ver o código Python que faria isso."}), 200


if __name__ == '__main__':
    # A data do request é simulada para o ReportLab
    import datetime
    request.date = datetime.date.today().strftime('%d/%m/%Y')
    
    # Apenas simulando o código. Não rode este arquivo aqui, ele serve apenas como explicação.
    pass