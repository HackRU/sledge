import aiohttp
import requests
import json

from . import db

def init():
    pass

async def handle_login(req):
    req_json = await req.json()
    res = requests.post('https://m7cwj1fy7c.execute-api.us-west-2.amazonaws.com/test/authorize', json=req_json)
    res_json = res.json()
    if res_json.get('statusCode') != 200:
        return aiohttp.web.json_response({
            'success': False,
            'message': res_json.get('body')
            })
    secret = json.loads(res_json.get('body')).get('auth').get('token')
    judgeid = db.find_judge_id({'email': req_json.get('email')})
    if judgeid is None:
        return aiohttp.web.json_response({
            'success': False,
            'message': 'Email entered is not a judge'
            })
    db.add_token({
        'judgeId': judgeid,
        'secret': secret
        })
    return aiohttp.web.json_response({
        'success': True,
        'message': 'Success',
        'judgeId': judgeid,
        'token': secret
        })
