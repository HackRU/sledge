import socketio
from aiohttp import web

sio = socketio.AsyncServer(async_mode='aiohttp')
app = web.Application()
sio.attach(app)

async def index(request):
    return web.Response(text="Invalid URL", content_type="text/plain")


# quick and useless tests
sio.on('connect', namespace="/judge")
def do_connect(sid, env):
    print(sid, "has connected")
    print(env, "is env")
    return True

sio.on('disconnect', namespace="/judge")(lambda sid: print("Disconnected:", sid))

@sio.on('try-judge', namespace="/judge")
async def message(sid, payload):
    print("Judge from", sid, "is", payload)

app.router.add_get('/', index)

if __name__ == "__main__":
    web.run_app(app)
