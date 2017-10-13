from models import Model, metadata
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
