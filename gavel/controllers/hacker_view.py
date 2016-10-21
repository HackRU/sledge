from gavel import app
from gavel.models import *
from flask import (
    redirect,
    render_template,
    request,
    url_for,
)

@app.route('/submissions/')
def hacker_view():
    items = Item.query.order_by(Item.id).all()
    item_counts = dict()
    for dec in Decision.query.all():
        item_counts[dec.winner_id] = item_counts.get(dec.winner_id, 0) + 1
        item_counts[dec.loser_id] = item_counts.get(dec.loser_id, 0) + 1
    return render_template('hacker_view.html', items = items, item_counts = item_counts)
