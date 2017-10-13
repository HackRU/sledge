from models import Model, metadata, Prize
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Text
from sqlalchemy.orm import relation

class Hack(Model):
    __tablename__ = 'hacks'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(Text, nullable=False)
    location = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    views = Column(Integer)

hack_prize = Table('hack_prize', Model.metadata,
        Column('hack_id', Integer, ForeignKey(Hack.id)),
        Column('prize_id', Integer, ForeignKey(Prize.id))
)

Hack.prizes = relation('Prize', secondary = hack_prize)
