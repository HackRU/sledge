import secrets

from . import db

# Maps session ids to judge ids
# Session IDs provided by socketio
sessions = dict()

def init():
    if not db.are_tokens_populated():
        print('No Tokens Found! Generating Admin Token.')
        admin_secret = secrets.token_hex(8)
        db.add_token({'judgeId': 0, 'secret': admin_secret})
        print('ADMIN SECRET: ', secret)

        # TODO: This should be removed in prod
        print('ADDING TEST TOKEN FOR CONVIENENCE!!!')
        db.add_token({'judgeId': 0, 'secret': 'test'})

def login_session(sid, secret):
    judgeid = db.find_judge({'secret': secret})
    if judgeid == None:
        return None
    sessions[sid] = judgeid
    return judgeid

def whois(sid):
    return sessions.get(sid)

def trusted(sid, jid):
    judgeid = whois(sid)
    return judgeid != None and (judgeid == 0 or judgeid == jid)
