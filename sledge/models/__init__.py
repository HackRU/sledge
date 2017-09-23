from flask_sqlalchemy import SQLAlchemy

class SerializableAlchemy(SQLAlchemy):
    def apply_driver_hacks(self, app, info, options):
        if not 'isolation_level' in options:
            # XXX is this slow? are there better ways?
            options['isolation_level'] = 'SERIALIZABLE'
        return super(SerializableAlchemy, self).apply_driver_hacks(app, info, options)
db = SerializableAlchemy()

from sledge.models.judge import Annotator, ignore_table
from sledge.models.hack import Item, view_table
from sledge.models.prize import Decision

from sqlalchemy.exc import IntegrityError
from sqlalchemy.sql.expression import desc
