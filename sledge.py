#!/usr/bin/env python3
import aiohttp.web
import os
import socketio
import sqlite3

staticdir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        'static' )

sio = None
app = None
sql = None

def init():
    sio = socketio.AsyncServer()
    app = aiohttp.web.Application()
    app.router.add_static('/', path=staticdir) # In prod, use nginx
    sio.attach(app)
    aiohttp.web.run_app(app)

if __name__ == "__main__":
    init()
