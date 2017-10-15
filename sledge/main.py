import socketio
import json
import os
import sqlalchemy
import sqlite3
from sqlalchemy.orm import sessionmaker
from aiohttp import web
from models import *
import utils

sio = socketio.AsyncServer(async_mode='aiohttp')
app = web.Application()
Sesh = sessionmaker(bind=db)
sconn = sqlite3.connect('sledge.db')
sio.attach(app)

staticdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')

tokens = []
admin_pass = 'the-hash-admin-password'

@sio.on('connect')
async def do_connect(sid, env):
    print(sid, "has connected")
    query = dict(tuple(i.split('=')) for i in env['QUERY_STRING'].split('&'))
    #security, y'all
    if 'admin' not in query or query['admin'] != 'true':
        return 'tok' in query and query['tok'] in tokens
    else:
        return 'tok' in query and query['tok'] == admin_pass

#HELPERS
async def list_all(db_obj, transformer, emit_event):
    venugopal = Sesh()
    query = venugopal.query(db_obj) #don't query A_IN_112, venugopal Seshions don't support that.
    data = []
    for obj in query:
        data.append(transformer(obj))
    venugopal.close()
    await sio.emit(emit_event, json.dumps(data))


###Lists
@sio.on('list-judges')
async def list_judges(sid, data = None):
    await list_all(Judge, lambda judge: {
            'id': judge.id,
            'name': judge.name,
            'email': judge.email,
            'start_loc': judge.start_loc,
            'curr_loc': judge.curr_loc,
            'end_loc': judge.end_loc,
            'id': judge.id
        }, 'judges-list')

@sio.on('list-prizes')
async def list_prizes(sid, data = None):
    await list_all(Prize, lambda prize: {
            'id': prize.id,
            'name': prize.name,
            'description': prize.description,
            'is_best_overall': prize.is_best_overall
        }, 'prizes-list')

@sio.on('list-ratings')
async def list_ratings(sid, data = None):
    session = Sesh()
    ratings = session.execute(sqlalchemy.text("SELECT * FROM ratings"))
    ratings_dict = [dict(x) for x in list(ratings)]
    await sio.emit('ratings-list', json.dumps(ratings_dict))

@sio.on('add-rating')
async def add_rating(sid, data):
    # I don't get sqlalchemy and sqlalchemy doesn't get me
    c = sconn.cursor()
    # TODO: Is there an equivelent query that works in sqlalchemy?
    r = c.execute(
        'INSERT OR REPLACE INTO ratings (id, judge_id, hack_id, rating) '
        'VALUES ('
            '(SELECT id FROM ratings WHERE judge_id=:judge_id AND hack_id=:hack_id),'
            ':judge_id, :hack_id, :rating);',
        {   'judge_id': data.get('judge_id'),
            'hack_id': data.get('hack_id'),
            'rating': data.get('rating') }
    )
    sconn.commit()

@sio.on('add-superlative')
async def add_superlative(sid, data):
    c = sconn.cursor()
    c.execute(
            'INSERT OR REPLACE INTO judge_hack_prize (id, judge_id, prize_id, hack_1, hack_2)'
            'VALUES ('
            '(SELECT id FROM judge_hack_prize WHERE judge_id=:judge_id AND prize_id=:prize_id),'
            ':judge_id, :prize_id, :hack_1, :hack_2);',
        {
            'judge_id': data.get('judge_id'),
            'prize_id': data.get('prize_id'),
            'hack_1': data.get('hack1'),
            'hack_2': data.get('hack2')
        })
    sconn.commit();

@sio.on('list-superlatives')
async def list_supers(sid):
    #Fuck sqlalchemy
    c = sconn.cursor()
    r = c.execute('SELECT judge_id, prize_id, hack_1, hack_2 FROM judge_hack_prize')
    supers = map(lambda jhp: {
        'judge_id': jhp[0],
        'prize_id': jhp[1],
        'hack1': jhp[2],
        'hack2': jhp[3]
        }, r)
    sconn.commit()
    await sio.emit('superlatives-list', list(supers))

@sio.on('list-hacks')
async def list_hacks(sid, data = None):
    await list_all(Hack, lambda hack: {
            'name': hack.name,
            'description': hack.description,
            'location': hack.location,
            'id': hack.id,
            'prizes': [p.id for p in hack.prizes]
        }, 'hacks-list')
##Judge Stuff
@sio.on('add-judge')
async def add_judge(sid, judge_json):
    session = Sesh()
    new_start, new_curr, new_end = await utils.allocate_judges(session)
    judge = Judge(name = judge_json['name'],
            email = judge_json['email'],
            start_loc = new_start,
            curr_loc = new_curr,
            end_loc = new_end)
    await utils.set_secret(judge)
    session.add(judge)
    session.commit()
    session.flush()
    session.close()
    await list_judges(sid)

@sio.on('view-hacks')
async def view_hacks(sid, judge_data):
    session = Sesh()
    j = session.query(Judge).get(judge_data.get('judge_id'))
    startl = j.start_loc
    endl = j.end_loc
    if(startl > endl):
        exText = "SELECT * FROM hacks WHERE (id > :start) OR (id < :end)"
    else: 
        exText = "SELECT * FROM hacks WHERE (id BETWEEN :start AND :end)"
    valid_hacks = session.execute(
            sqlalchemy.text(exText),
            {"start": startl, "end": endl} )
    jPrizes = session.query(judge_hack_prize).filter_by(judge_id=judge_data.get('judge_id'))
    hacks_for_judge = {	"judge_id":judge_data.get('judge_id'),
                "hacks": [dict(x) for x in valid_hacks],
                "superlatives": [dict(x) for x in jPrizes] }
    await sio.emit('hacks-for-judge', json.dumps(hacks_for_judge))

@sio.on('devpost-scrape')
async def scrape_devpost(sid, data):
    session = Sesh()
    await utils.devpost_to_db(session, data)
    await list_hacks(sid)
    await list_prizes(sid)

def serve_hacks_table(req):
    c = sconn.cursor()
    c.execute('SELECT name,location FROM hacks')
    hs = []
    for h in c.fetchall():
        hs.append({
            "name": h[0],
            "location": h[1]
            })
    return web.Response(text=json.dumps(hs))

if __name__ == "__main__":
    app.router.add_get('/hacks.json', serve_hacks_table)
    if os.environ.get('DEBUG') == 'true':
        # In production, use nginx
        app.router.add_get('/', lambda req: web.HTTPFound('/index.html'))
        app.router.add_static('/', path=staticdir)
    if os.environ.get('ADMIN_PASS') is not None:
        admin_pass = os.environ.get('ADMIN_PASS')
    if os.environ.get('JUDGE_TOKEN') is not None:
        tokens.append(os.environ.get('JUDGE_TOKEN'))
    else:
        tokens.append('test')
    web.run_app(app)
