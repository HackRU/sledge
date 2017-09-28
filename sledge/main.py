import socketio
import json
from sqlalchemy.orm import sessionmaker
from aiohttp import web
from models import Hack, Judge, Prize

sio = socketio.AsyncServer(async_mode='aiohttp')
app = web.Application()
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
    


sio.on('disconnect')(lambda sid: print("Disconnected:", sid))

if __name__ == "__main__":
    web.run_app(app)
