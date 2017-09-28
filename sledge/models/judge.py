from sledge.models import Model, metadata
from sqlalchemy import Column, Integer, String, ForeignKey, Table

class Judge(Model):
    __tablename__ = "judges"
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(String(120), nullable=False)
    email = Column(String(120), nullable=False)
    secret = Column(String(32), unique=True, nullable=False)
    start_loc = Column(Integer)
    end_loc = Column(Integer)
    curr_loc = Column(Integer)

judge_hack_prize = Table('judge_hack_prize', metadata,
        Column('hack_1', Integer, ForeignKey('hack.id')),
        Column('hack_2', Integer, ForeignKey('hack.id')),
        Column('prize_id', Integer, ForeignKey('prize.id')),
        Column('judge_id', Integer, ForeignKey('judge.id'))
)
