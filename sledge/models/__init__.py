from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base

db = create_engine('sqlite:///../../sledge.db')
Model = declarative_base()
metadata = MetaData()

from sledge.models.judge import Judge, judge_hack_prize
from sledge.models.hack import Hack, hack_prize
from sledge.models.prize import Prize
