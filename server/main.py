import aiohttp.web
import os
import socketio
import urllib.parse
import random

from . import devpost
from . import db

staticdir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        '../static' )

datadir = os.path.join(
        os.path.dirname(os.path.realpath(__file__)),
        '../data' )
os.makedirs(datadir, exist_ok=True)

sio = socketio.AsyncServer()
app = aiohttp.web.Application()

# Map of sid to judge id
auth = dict()

@sio.on('connect')
async def do_connect(sid, env):
    query = urllib.parse.parse_qs(env.get('QUERY_STRING'))
    secret = query.get('secret')
    if secret == None:
        return False
    if len(secret) != 1:
        return

    judgeid = db.find_judge({'secret': secret[0]})
    if judgeid == None:
        return False
    auth[sid] = judgeid

    await sio.emit('update-full', data=get_serialized_full(), room=sid)
    return True

@sio.on('devpost-scrape')
async def do_devpost_scrape(sid, data):
    url = data.get('url')
    force = data.get('force')

    if not force and db.are_hacks_populated():
        await sio.emit(
                'devpost-scrape-response',
                data = { 'success': False,
                         'message': 'Hacks already present' },
                room = sid )

    for hack in get_hack_data(url):
        db.add_hack(hack)

    await send_full_response()
    await sio.emit(
            'devpost-scrape-response',
            data = { 'success': True },
            room = sid )

@sio.on('rank-superlative')
async def do_rank_superlative(sid, data):
    try:
        db.add_superlative_ranking(data)
    except ValueError as e:
        await sio.emit(
                'rank-superlative-response',
                data = { 'success': False,
                         'message': 'ValueError: %s' % str(e) },
                room = sid )
        return

    await send_full_response()
    await sio.emit(
            'rank-superlative-response',
            data = { 'success': True },
            room = sid )

@sio.on('add-judge')
async def do_add_judge(sid, data):
    try:
        db.add_judge(data)
    except ValueError as e:
        await sio.emit(
                'add-judge-response',
                data = { 'success': False,
                         'message': 'ValueError: %s' % str(e) },
                room = sid )
        return

    await send_full_response()
    await sio.emit(
            'add-judge-response',
            data = { 'success': True },
            room = sid )

@sio.on('rate-hack')
async def do_rate_hack(sid, data):
    try:
        db.add_rating(data)
    except ValueError as e:
        await sio.emit(
                'rate-hack-response',
                data = { 'success': False,
                         'message': 'ValueError: %s' % str(e) },
                room = sid )
        return

    await send_full_response()
    await sio.emit(
            'rate-hack-response',
            data = { 'success': True },
            room = sid )

@sio.on('add-superlative')
async def do_add_superlative(sid, data):
    try:
        db.add_superlative(data)
    except ValueError as e:
        await sio.emit(
                'add-superlative-response',
                data = { 'success': False,
                         'message': 'ValueError: %s' % str(e) },
                room = sid )
        return

    await send_full_response()
    await sio.emit(
            'add-superlative-response',
            data = { 'success': True },
            room = sid )

@sio.on('add-token')
async def do_add_token(sid, data):
    try:
        db.add_token(data)
    except ValueError as e:
        await sio.emit(
                'add-token-response',
                data = { 'success': False,
                         'message': 'ValueError: %s' % str(e) },
                room = sid )
        return

    await sio.emit(
            'add-token-response',
            data = { 'success': True },
            room = sid )

def get_serialized_full():
    return {
        'hacks': db.serialize_hacks(),
        'judges': db.serialize_judges(),
        'judgeHacks': db.serialize_judge_hacks(),
        'superlatives': db.serialize_superlatives(),
        'superlativePlacements': db.serialize_superlative_placements(),
        'ratings': db.serialize_ratings()
    }

async def send_full_response():
    await sio.emit('update-full', data=get_serialized_full())

def init():
    print('Static Directory: '+staticdir)
    print('Data Directory: '+datadir)
    db.initdb(datadir)
    sio.attach(app)
    app.router.add_static('/', path=staticdir) # In prod, use nginx

    if not db.are_tokens_populated():
        print('No tokens found. Generating first admin token...')
        secret = ''.join(
            random.choice('0123456789ABCDEFG') for _ in range(6))
        #TODO: This could be done better
        db.add_token({'judgeId': 0, 'secret': 'test'})
        db.add_token({'judgeId': 0, 'secret': secret})
        print('ADMIN SECRET: ', secret)

    aiohttp.web.run_app(app)


if __name__ == "__main__":
    init()
