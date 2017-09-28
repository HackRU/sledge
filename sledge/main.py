import socketio
import json
from sqlalchemy.orm import sessionmaker
from aiohttp import web
from models import Hack, Judge, Prize, db

sio = socketio.AsyncServer(async_mode='aiohttp')
app = web.Application()
Sesh = sessionmaker(bind=db)
sio.attach(app)

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

@sio.on('add-hacks')
async def run_test(sid, data):
    print(sid, "sent", data)

@sio.on('list-judges')
async def list_judges(sid, data = None):
    venugopal = Sesh()

    query = venugopal.query(Judge) #don't query A_IN_112, venugopal Seshions don't support that.
    data = []
    for judge in query:
        data.append({
            'name': judge.name,
            'email': judge.email,
            'start_loc': judge.start_loc,
            'curr_loc': judge.curr_loc,
            'end_loc': judge.end_loc
        })
    venugopal.close()
    print('Emiting judge data')
    await sio.emit('judges-list', json.dumps(data))

@sio.on('add-judge')
async def add_judge(sid, data):
    session = Sesh()
    num_hacks = session.query(Hack).count()
    judge_json = data
    judge = Judge(name = judge_json['name'], email = judge_json['email'])
    session.add(judge)
    session.commit()
    session.flush()
    session.close()
    await list_judges(sid)

sio.on('disconnect')(lambda sid: print("Disconnected:", sid))

if __name__ == "__main__":
    web.run_app(app)
