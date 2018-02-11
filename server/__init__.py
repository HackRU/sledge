import aiohttp.web
import os
import socketio
import random

from . import db
from . import socket
from . import auth

staticdir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        '../static' )

datadir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        '../data' )
os.makedirs(datadir, exist_ok=True)

app = aiohttp.web.Application()

def init():
    print('Static Directory: '+staticdir)
    print('Data Directory: '+datadir)

    db.init(datadir)
    auth.init()
    socket.init()

    socket.sio.attach(app)
    app.router.add_static('/', path=staticdir) # In prod, use nginx
    aiohttp.web.run_app(app)


if __name__ == "__main__":
    init()
