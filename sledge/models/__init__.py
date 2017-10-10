from sqlalchemy import create_engine, MetaData, Table, Column, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

db = create_engine('sqlite:///sledge.db', echo=True)
metadata = MetaData()
Model = declarative_base(metadata = metadata)

from models.prize import Prize
from models.hack import Hack, hack_prize
from models.judge import Judge

judge_hack_prize = Table('judge_hack_prize', metadata,
        Column('hack_1', Integer, ForeignKey('hacks.id')),
        Column('hack_2', Integer, ForeignKey('hacks.id')),
        Column('prize_id', Integer, ForeignKey('prizes.id')),
        Column('judge_id', Integer, ForeignKey('judges.id'))
)

ratings = Table('ratings', metadata,
        Column('rating', Integer),
        Column('hack_id', Integer, ForeignKey('hacks.id')),
        Column('judge_id', Integer, ForeignKey('judges.id')),
        Column('id', Integer, primary_key=True)
)
