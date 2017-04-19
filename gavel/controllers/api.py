from gavel import app
from gavel.models import *
import gavel.utils as utils
from flask import Response

@app.route('/api/items.csv')
@utils.requires_auth
def item_dump():
    items = Item.query.order_by(desc(Item.mu)).all()
    data = [['Mu', 'Sigma Squared', 'Name', 'Location', 'Description', 'Active']]
    data += [[
        str(item.mu),
        str(item.sigma_sq),
        item.name,
        item.location,
        item.description,
        item.active
    ] for item in items]
    return Response(utils.data_to_csv_string(data), mimetype='text/csv')

@app.route('/api/annotators.csv')
@utils.requires_auth
def annotator_dump():
    annotators = Annotator.query.all()
    data = [['Name', 'Email', 'Description', 'Secret']]
    data += [[
        str(a.name),
        a.email,
        a.description,
        a.secret
    ] for a in annotators]
    return Response(utils.data_to_csv_string(data), mimetype='text/csv')

def get_seen_ct(item_id):
    return sum(1 if d.loser_id == item_id or d.winner_id == item_id else 0\
               for d in Decision.query.all())

@app.route('/api/decisions.csv')
@utils.requires_auth
def decisions_dump():
    decisions = Decision.query.all()
    data = [['Annotator ID', 'Winner ID', 'Loser ID', 'Time']]
    data += [[
        str(d.annotator.id),
        str(d.winner.id),
        str(d.loser.id),
        str(d.time)
    ] for d in decisions]
    return Response(utils.data_to_csv_string(data), mimetype='text/csv')

@app.route('/api/hackerquery/')
def get_hack_by_name():
    who = request.args.get('name')
    q = Items.query.filter(Item.name == who).all()
    data = [['Name', 'Location', 'Prize', 'Times Seen']] +\
           [[str(d.name), str(d.location), str(d.prize), get_seen_ct(d.id)] for d in q]
    return Response(utils.data_to_csv_string(data), mimetype='text/csv')
