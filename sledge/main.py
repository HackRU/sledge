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
sio.attach(app)

staticdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')

tokens = ['test'] #for now

@sio.on('connect')
async def do_connect(sid, env):
    print(sid, "has connected")
    query = dict(tuple(i.split('=')) for i in env['QUERY_STRING'].split('&'))
    #security, y'all
    if 'admin' not in query or query['admin'] != 'true':
        return 'tok' in query and query['tok'] in tokens
    else:
        return 'tok' in query and query['tok'] == 'the-hash-admin-password'

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
    conn = sqlite3.connect('sledge.db')
    c = conn.cursor()
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

    for super_rating in data.get('superlatives'):
        r = c.execute(
                'INSERT OR REPLACE INTO judge_hack_prize (id, judge_id, prize_id, hack_1, hack_2)'
                'VALUES ('
                '(SELECT id FROM judge_hack_prize WHERE judge_id:=judge_id AND prize_id:=prize_id),'
                ':judge_id, :prize_id :hack_1, :hack_2);',
            {
                'judge_id': data.get('judge_id'),
                'prize_id': super_rating.get('prize_id'),
                'hack_1': super_rating.get('hacks')[0],
                'hack_2': super_rating.get('hacks')[1]
            })

    

    conn.commit()
    conn.close()
    await list_ratings(sid)

@sio.on('list-superlatives')
async def list_supers(sid, data):
    #Fuck sqlalchemy
    conn = sqlite3.connect('sledge.db')
    c = conn.cursor()
    supers = c.execute('SELECT * FROM judge_hack_prize')
    supers = map(dict, supers)
    conn.commit()
    conn.close()
    await sio.emit('superlatives-list', supers)

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
    valid_hacks = session.execute(
            sqlalchemy.text("SELECT * FROM hacks WHERE id BETWEEN :low AND :high"),
            {"high": endl, "low": startl} )
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

if __name__ == "__main__":
    if os.environ.get('DEBUG') == 'true':
        # In production, use nginx
        app.router.add_get('/', lambda req: web.HTTPFound('/index.html'))
        app.router.add_static('/', path=staticdir)
    web.run_app(app)
