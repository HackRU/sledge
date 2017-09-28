from sledge.models import Model, metadata
from sqlalchemy import Column, Integer, String, ForeignKey, Table, Text

class Hack(Model):
    __tablename__ = 'hacks'

    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(Text, nullable=False)
    location = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    views = Column(Integer)

hack_prize = Table('hack_prize', metadata,
        Column('hack_id', Integer, ForeignKey('hack.id')),
        Column('prize_id', Integer, ForeignKey('prize.id'))
)
