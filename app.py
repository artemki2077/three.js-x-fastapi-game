from fastapi import FastAPI
import uvicorn
import redis

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
app = FastAPI()



@app.post("/get")
def pong(x: int, y: int):
    try:
        res = r.get(f'{x}:{y}')
        if res:
            return {
                'ok': True,
                'result': res,
                'answer': 'SUCCES'
            }
        else:
            return {
                'ok': True,
                'result': res,
                'answer': 'not such cords'
            }
    except Exception as e:
        return {
                'ok': False,
                'result': str(e),
                'answer': 'ERROR'
            }




if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)

