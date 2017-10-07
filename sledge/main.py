import socketio
import json
import os
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
            'name': prize.name,
            'description': prize.description,
            'is_best_overall': prize.is_best_overall
        }, 'prizes-list')

@sio.on('list-hacks')
async def list_hacks(sid, data = None):
    await list_all(Hack, lambda hack: {
            'name': hack.name,
            'description': hack.description,
            'location': hack.location,
            'id': hack.id
        }, 'hacks-list')
###Judge Stuff
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

@sio.on('judge')
async def judge(sid, current_hack):
    pass

@sio.on('view-hacks')
async def view_hacks(sid, judge_data):
    session = Sesh()
    j = session.query(Judge).get(judge_data.judge_id)
    startl = j.start_loc
    endl = j.end_loc
    valid_hacks = []
    if(end_loc > start_loc):
        valid_hacks = session.query(Hack).filter_by(location > startl and location < endl)
    else:
        valid_hacks = session.query(Hack).filter_by(location < startl or location > endl)
    jPrizes = session.query(judge_hack_prize).filter_by(judge_id)
    hacks_for_judge = {	"judge_id":judge_data.judge_id,
                "overall_total":length(valid_hacks),
                "hacks":valid_hacks,
                "superlatives":jPrizes }
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
