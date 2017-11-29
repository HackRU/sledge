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

    @sio.on('connect')
    def do_connect(sid, env):
        print('Client connected', sid)
        sio.emit('fulldump', data={}, room=sid)

def initdb():
    os.makedirs(datadir, exist_ok=True)
    sql = sqlite3.connect(os.path.join(datadir, 'sledge.db'))
    c = sql.cursor()
    c.execute(
        # The hacks table is a all the hacks and the info needed to judge them
        'CREATE TABLE IF NOT EXISTS hacks ('
            'id INTEGER NOT NULL,'
            'name TEXT NOT NULL,'
            'description TEXT NOT NULL,'
            'location INTEGER NOT NULL,'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The judges table is all the judges, what they need to authenticate,
        # and how to contact them.
        'CREATE TABLE IF NOT EXISTS judges ('
            'id INTEGER NOT NULL,'
            'name TEXT NOT NULL,'
            'email TEXT NOT NULL,'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The judge_hacks table records all hacks assigned to a judge
        'CREATE TABLE IF NOT EXISTS judge_hacks ('
            'id INTEGER NOT NULL,'
            'judge_id INTEGER NOT NULL,'
            'hack_id INTEGER NOT NULL,'
            'FOREIGN KEY(judge_id) REFERENCES judges(id),'
            'FOREIGN KEY(hack_id) REFERENCES hacks(id),'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The superlatives table is all the superlatives
        'CREATE TABLE IF NOT EXISTS superlatives ('
            'id INTEGER NOT NULL,'
            'name TEXT NOT NULL,'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The superlative_placements is the first and second choice of
        # each judge for each superlative
        'CREATE TABLE IF NOT EXISTS superlative_placements ('
            'id INTEGER NOT NULL,'
            'judge_id INTEGER NOT NULL,'
            'first_choice INTEGER NOT NULL,'
            'second_choice INTEGER NOT NULL,'
            'FOREIGN KEY(judge_id) REFERENCES judges(id),'
            'FOREIGN KEY(first_choice) REFERENCES hacks(id),'
            'FOREIGN KEY(second_choice) REFERENCES hacks(id),'
            'PRIMARY KEY(id)'
        ');')
    c.execute(
        # The ratings table is the score given by each judge on a 0-20 scale
        'CREATE TABLE IF NOT EXISTS ratings ('
            'id INTEGER NOT NULL,'
            'judge_id INTEGER NOT NULL,'
            'hack_id INTEGER NOT NULL,'
            'rating INTEGER NOT NULL,'
            'FOREIGN KEY(judge_id) REFERENCES judges(id),'
            'FOREIGN KEY(hack_id) REFERENCES hacks(id),'
            'PRIMARY KEY(id)'
        ');')
    sql.commit()

if __name__ == "__main__":
    init()
