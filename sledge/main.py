import socketio
from aiohttp import web

sio = socketio.AsyncServer(async_mode='aiohttp')
app = web.Application()
sio.attach(app)

# quick and useless tests
@sio.on('connect')
async def do_connect(sid, env):
    print(sid, "has connected")
    query = dict(tuple(i.split('=')) for i in env['QUERY_STRING'].split('&'))
    #security, y'all
    return 'tok' in query and query['tok'] == 'tik'

sio.on('disconnect', namespace="/judge")(lambda sid: print("Disconnected:", sid))

@sio.on('try-judge', namespace="/judge")
async def message(sid, payload):
    print("Judge from", sid, "is", payload)

if __name__ == "__main__":
    web.run_app(app)
