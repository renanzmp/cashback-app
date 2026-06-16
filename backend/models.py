from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Historico(db.Model):
    __tablename__ = 'historico_cashback'
    id = db.Column(db.Integer, primary_key=True)
    ip_usuario = db.Column(db.String(45), nullable=False)
    tipo_cliente = db.Column(db.String(20), nullable=False)
    valor_compra = db.Column(db.Numeric(10, 2), nullable=False)
    valor_cashback = db.Column(db.Numeric(10, 2), nullable=False)