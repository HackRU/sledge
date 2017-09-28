from sledge.models import Model
from sqlalchemy import Column, Integer, String, ForeignKey, Text

class Prize(Model):
    __tablename__ = "prizes"
    id = Column(Integer, primary_key=True, nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False)
    is_best_overall = Column(Integer)
