import json
from urllib import request

login_url = 'http://127.0.0.1:5000/api/login'
login_data = {'username': 'admin', 'password': 'AdminSecure2024!', 'role': 'admin'}
req = request.Request(login_url, data=json.dumps(login_data).encode('utf-8'), headers={'Content-Type': 'application/json'})
with request.urlopen(req) as resp:
    body = resp.read().decode()
    print('login', resp.status, body)
    token = json.loads(body)['access_token']

headers = {'Content-Type': 'application/json', 'Authorization': f'Bearer {token}'}
req2 = request.Request('http://127.0.0.1:5000/api/pending-requests', headers=headers)
with request.urlopen(req2) as resp2:
    pending = json.loads(resp2.read().decode())
    print('pending', len(pending))
    if pending:
        print(pending[0])
        booking_id = pending[0]['id']
        req3 = request.Request('http://127.0.0.1:5000/api/approve-request', data=json.dumps({'booking_id': booking_id}).encode('utf-8'), headers=headers)
        with request.urlopen(req3) as resp3:
            print('approve', resp3.status, resp3.read().decode())
