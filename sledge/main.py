import socketio
import json
import sqlite3 as sql
from aiohttp import web

sio = socketio.AsyncServer(async_mode='aiohttp')
app = web.Application()
sio.attach(app)

tokens = ['test'] #for now

# quick and useless tests
@sio.on('connect')
async def do_connect(sid, env):
    print(sid, "has connected")
    query = dict(tuple(i.split('=')) for i in env['QUERY_STRING'].split('&'))
    #security, y'all
    if 'admin' not in query or query['admin'] != 'true':
        return 'tok' in query and query['tok'] in tokens
    else:
        return 'tok' in query and query['tok'] == 'the-hash-admin-password'

@sio.on('test')
async def run_test(sid, data):
    print(sid, "sent", data)
    


sio.on('disconnect')(lambda sid: print("Disconnected:", sid))

if __name__ == "__main__":
    web.run_app(app)
