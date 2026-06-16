from flask import Blueprint, request, jsonify
from models import db, Historico

cashback_bp = Blueprint('cashback', __name__)

def calcular_cashback(valor_original, desconto_percentual, is_vip):
    #Aplica o desconto do cupom
    valor_final = valor_original * (1 - (desconto_percentual / 100))
    
    #Calcula base de 5% sobre o valor final
    cashback = valor_final * 0.05
    
    #Adiciona bônus de 10% em cima da base para VIPs
    if is_vip:
        cashback += (cashback * 0.10)
        
    #Dobra o cashback se a compra final ultrapassar R$ 500
    if valor_final > 500:
        cashback *= 2
        
    return cashback, valor_final

def capturar_ip(req):
    #Pega o IP
    if req.headers.getlist("X-Forwarded-For"):
        return req.headers.getlist("X-Forwarded-For")[0].split(',')[0]
    return req.remote_addr

@cashback_bp.route('/api/cashback', methods=['POST'])
def processar_cashback():
    dados = request.json
    valor_original = float(dados.get('valor', 0))
    desconto = float(dados.get('cupom', 0))
    tipo_cliente = dados.get('tipo_cliente', 'Normal')
    is_vip = (tipo_cliente == 'VIP')
    
    cashback, valor_final = calcular_cashback(valor_original, desconto, is_vip)
    ip = capturar_ip(request)
    
    novo_registro = Historico(
        ip_usuario=ip,
        tipo_cliente=tipo_cliente,
        valor_compra=valor_final,
        valor_cashback=cashback
    )
    db.session.add(novo_registro)
    db.session.commit()
    
    return jsonify({
        'valor_final': valor_final,
        'cashback': cashback
    })

@cashback_bp.route('/api/historico', methods=['GET'])
def buscar_historico():
    ip = capturar_ip(request)
    registros = Historico.query.filter_by(ip_usuario=ip).order_by(Historico.id.desc()).all()
    
    resultado = [{
        'tipo_cliente': r.tipo_cliente,
        'valor_compra': float(r.valor_compra),
        'valor_cashback': float(r.valor_cashback)
    } for r in registros]
    
    return jsonify(resultado)