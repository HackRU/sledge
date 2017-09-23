from sledge.models import db

class Judge(db.model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    secret = db.Column(db.String(32), unique=True, nullable=False)
    start_loc = db.Column(db.Integer)
    end_loc = db.Column(db.Integer)
    curr_loc = db.Column(db.Integer)

judge_hack_prize = db.Table('judge_hack_prize',
        db.Column('hack_1', db.Integer, db.ForeignKey('hack.id')),
        db.Column('hack_2', db.Integer, db.ForeignKey('hack.id')),
        db.Column('prize_id', db.Integer, db.ForeignKey('prize.id')),
        db.Column('judge_id', db.Integer, db.ForeignKey('judge.id'))
)
