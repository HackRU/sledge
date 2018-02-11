import socketio
import urllib.parse
import functools

from . import devpost
from . import db
from . import auth

sio = None

def init():
    global sio
    sio = socketio.AsyncServer()

    sio.on('connect', handler=do_connect)

    add_handler(
            'devpost-scrape',
            'devpost-scrape-response',
            do_devpost_scrape )
    add_handler(
            'rank-superlative',
            'rank-superlative-response',
            do_rank_superlative )
    add_handler(
            'add-judge',
            'add-judge-response',
            do_add_judge )
    add_handler(
            'rate-hack',
            'rate-hack-response',
            do_rate_hack )
    add_handler(
            'add-superlative',
            'add-superlative-response',
            do_add_superlative )
    add_handler(
            'add-token',
            'add_token-response',
            do_add_token )

async def do_connect(sid, env):
    query = urllib.parse.parse_qs(env.get('QUERY_STRING'))
    secret = query.get('secret')
    if secret == None:
        return False
    if len(secret) != 1:
        return

    judgeid = auth.login_session(sid, secret[0])
    if judgeid == None:
        return False

    await sio.emit('update-full', data=get_serialized_full(), room=sid)
    return True

# Removes some gruntwork since most handlers are mostly the same
def add_handler(req_name, res_name, logic):
    async def handler(sid, env):
        try:
            msg = await logic(sid, env)
        except ValueError as e:
            await sio.emit(
                    res_name,
                    data = { 'success': False,
                             'message': 'ValueError: %s' % str(e) },
                    room = sid )
            return

        if msg is None:
            await sio.emit(
                    res_name,
                    data = { 'success': True },
                    room = sid )
        else:
            await sio.emit(
                    res_name,
                    res_name = { 'success': False,
                                 'message': msg },
                    room = sid )
    sio.on(req_name, handler=handler)
    return logic

async def do_devpost_scrape(sid, data):
    url = data.get('url')
    force = data.get('force')

    for hack in get_hack_data(url):
        db.add_hack(hack)

    await send_full_response()

    return None

async def do_rank_superlative(sid, data):
    db.add_superlative_ranking(data)
    await send_full_response()
    return None

async def do_add_judge(sid, data):
    db.add_judge(data)
    await send_full_response()
    return None

async def do_rate_hack(sid, data):
    db.add_rating(data)
    await send_full_response()
    return None

async def do_add_superlative(sid, data):
    db.add_superlative(data)
    await send_full_response()
    return None

async def do_add_token(sid, data):
    db.add_token(data)
    return None

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
