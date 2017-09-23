import socketio
import eventlet

sio = socketio.server()
app = Flask(__name__)

