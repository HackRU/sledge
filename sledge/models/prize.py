from sledge.models import db

class Prize(db.model):
    id = db.Column(db.Integer, primary_key=True, nullable=False)
    name = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_best_overall = db.Column(db.Integer)
