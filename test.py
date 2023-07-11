import redis


r = redis.Redis(host='localhost', port=6379, decode_responses=True)


user1 = {
    "login": 'artemki2077',
    "pass_hash": '',
    "pass_salt": ''
}