#!/usr/bin/env python3.6
import aiohttp.web
import os
import socketio
import sqlite3

staticdir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        'static' )

datadir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        'data' )

sio = None
app = None
sql = None

def init():
    print('Static Directory: '+staticdir)
    print('Data Directory: '+datadir)
    initdb()
    sio = socketio.AsyncServer()
    app = aiohttp.web.Application()
    app.router.add_static('/', path=staticdir) # In prod, use nginx
    sio.attach(app)
    aiohttp.web.run_app(app)

def initdb():
    os.makedirs(datadir, exist_ok=True)
    sql = sqlite3.connect(os.path.join(datadir, 'sledge.db'))
    c = sql.cursor()
    c.execute('CREATE TABLE IF NOT EXISTS judges'
                '(id INTEGER PRIMARY KEY ASC)')
    sql.commit()

if __name__ == "__main__":
    init()
