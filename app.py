from fastapi import FastAPI, WebSocket
import uvicorn
import redis
import json

r = redis.Redis(host='localhost', port=6379, decode_responses=True)
app = FastAPI()




@app.post("/get")
async def get_cords(x: int, y: int, z: int):
    try:
        
        if y == 0:
            res = 1
        else:
            res = r.get(f'{x}:{y}:{z}')
        if res:
            return {
                'ok': True,
                'cords': (x, y, z),
                'result': res,
                'answer': 'SUCCES'
            }
        else:
            return {
                'ok': True,
                'cords': (x, y, z),
                'result': res,
                'answer': 'not such cords'
            }
    except Exception as e:
        return {
                'ok': False,
                'cords': (x, y, z),
                'result': str(e),
                'answer': 'ERROR'
            }


@app.post("/set")
async def set_cords(x: int, y: int, z: int, index_block: int):
    try:
        
        res = r.set(f'{x}:{y}:{z}', index_block)
        if res:
            return {
                'ok': True,
                'cords': (x, y, z),
                'index_block': index_block,
                'result': res,
                'answer': 'SUCCES'
            }
        else:
            return {
                'ok': False,
                'cords': (x, y, z),
                'index_block': index_block,
                'result': res,
                'answer': 'ERROR REDIS'
            }
    except Exception as e:
        return {
                'ok': False,
                'cords': (x, y, z),
                'result': str(e),
                'answer': 'ERROR'
            }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        msg: dict = await websocket.receive_json()
        
        command = msg.get('command')
        if command == 'get':
            x, y, z = msg.get('x'), msg.get('y'), msg.get('z')
            if y == 0:
                res = 1
            else:
                res = r.get(f'{x}:{y}:{z}')
            if res:
            
                await websocket.send_json(json.dumps({
                    'ok': True,
                    'cords': (x, y, z),
                    'result': res,
                    'answer': 'SUCCES'
                }))
            else:
                await websocket.send_json(json.dumps({
                    'ok': True,
                    'cords': (x, y, z),
                    'result': res,
                    'answer': 'not such cords'
                }))

        


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8001)

