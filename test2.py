from fastapi import FastAPI, WebSocket
import uvicorn
import redis

# r = redis.Redis(host='localhost', port=6379, decode_responses=True)
app = FastAPI()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        msg: dict = await websocket.receive_json()
        
        command = msg.get('command')
        if command == 'get':
            ...
            


if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8002)

