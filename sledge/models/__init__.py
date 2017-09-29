from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base

db = create_engine('sqlite:///sledge.db', echo=True)
Model = declarative_base()
metadata = MetaData()

from models.judge import Judge, judge_hack_prize
from models.prize import Prize
from models.hack import Hack, hack_prize
