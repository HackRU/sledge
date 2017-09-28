from sledge.models import Model, db
from sqlalchemy.orm import sessionmaker

DBSess = sessionmaker(bind=db)
sesh = DBSess() # ruining us by having midterms on the wrong weekend

Model.metadata.create_all(bind = db)

sesh.commit()
