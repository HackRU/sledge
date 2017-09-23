from sledge.models import db

class Hack(db.model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.Text, nullable=False)
    location = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    views = db.Column(db.Integer)

hack_prize = db.Table('hack_prize',
        db.Column('hack_id', db.Integer, db.ForeignKey('hack.id')),
        db.Column('prize_id', db.Integer, db.ForeignKey('prize.id'))
)
