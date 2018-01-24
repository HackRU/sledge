import aiohttp.web
import os
import socketio
import sqlite3

from . import devpost

staticdir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        '../static' )

datadir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        '../data' )
os.makedirs(datadir, exist_ok=True)

sio = socketio.AsyncServer()
app = aiohttp.web.Application()
sql = sqlite3.connect(os.path.join(datadir, 'sledge.db'))

#TODO: Each of these handlers needs an auth check

@sio.on('connect')
async def do_connect(sid, env):
    print('Client connected', sid)
    await sio.emit('update-full', data=get_serialized_full(), room=sid)

@sio.on('devpost-scrape')
async def do_devpost_scrape(sid, data):
    url = data.get('url')
    force = data.get('force')
    c = sql.cursor()

    # Refuse if hacks are already present
    if not force:
        c.execute('SELECT * FROM hacks')
        if c.fetchone() != None:
            print('Hacks present, refusing scrape')
            await sio.emit(
                    'devpost-scrape-response',
                    data = { 'success': False,
                             'message': 'Hacks already present' },
                    room = sid )
            return
    try:
        devpost.scrape_to_database(sql, url)
    except ValueError as e:
        print('BAD VALUES FROM CLIENT!', e)
        await sio.emit(
                'devpost-scrape-response',
                data = { 'success': False,
                         'message': 'Bad Values: %s' % str(e) },
                room = sid )
        return
    await sio.emit(
            'devpost-scrape-response',
            data = { 'success': True },
            room = sid )

@sio.on('add-judge')
async def do_add_judge(sid, data):
    name = data.get('name')
    email = data.get('email')
    c = sql.cursor()

    c.execute(
        'INSERT INTO judges ('
            'name, email)'
        'VALUES (?,?)',
        [name, email])
    sql.commit()

    # TODO: Only create a partial response
    await send_full_response()

    await sio.emit(
            'add-judge-response',
            data = { 'success': True },
            room = sid )

@sio.on('add-superlative')
async def do_add_superlative(sid, data):
    name = data.get('name')
    c = sql.cursor()

    c.execute(
        'INSERT INTO superlatives ('
            'name)'
        'VALUES (?)',
        [name])
    sql.commit()

    await send_full_response()

    await sio.emit(
            'add-superlative-response',
            data = { 'success': True },
            room = sid )

def get_serialized_full():
    c = sql.cursor()

    hacks = []
    c.execute('SELECT id,name,description,location FROM hacks;')
    for hack in c.fetchall():
        hacks.append({
            'id': hack[0],
            'name': hack[1],
            'description': hack[2],
            'location': hack[3] })

    judges = []
    c.execute('SELECT id,name,email FROM judges;')
    for judge in c.fetchall():
        judges.append({
            'id': judge[0],
            'name': judge[1],
            'email': judge[2] })

    judge_hacks = []
    c.execute('SELECT id,judge_id,hack_id FROM judge_hacks;')
    for judge_hack in c.fetchall():
        judge_hacks.append({
            'id': judge_hack[0],
            'judge_id': judge_hack[1],
            'hack_id': judge_hack[2] })

    superlatives = []
    c.execute('SELECT id,name FROM superlatives;')
    for superlative in c.fetchall():
        superlatives.append({
            'id': superlative[0],
            'name': superlative[1] })

    superlative_placements = []
    c.execute('SELECT id,judge_id,first_choice,second_choice FROM superlative_placements;')
    for superlatives_placement in c.fetchall():
        superlative_placements.append({
            'id': superlative_placement[0],
            'judge_id': superlative_placement[1],
            'first_choice': superlative_placement[2],
            'second_choice': superlative_placement[3] })

    ratings = []
    c.execute('SELECT id,judge_id,hack_id,rating FROM ratings;')
    for rating in c.fetchall():
        ratings.append({
            'id': rating[0],
            'judge_id': rating[1],
            'hack_id': rating[2],
            'rating': rating[3] })

    return {
        'hacks': hacks,
        'judges': judges,
        'judge_hacks': judge_hacks,
        'superlatives': superlatives,
        'superlativePlacements': superlative_placements,
        'ratings': ratings
    }

async def send_full_response():
    await sio.emit('update-full', data=get_serialized_full())

def init():
    print('Static Directory: '+staticdir)
    print('Data Directory: '+datadir)
    initdb()
    sio.attach(app)
    app.router.add_static('/', path=staticdir) # In prod, use nginx
    aiohttp.web.run_app(app)

def initdb():
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
