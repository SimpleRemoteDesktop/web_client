function close() {
   socket.destroy();
}

const {Frame, Message, Type} = require('./SRD_protocol');
const net = require('net');
let isConnected = false;
let receivedBuffer = Buffer.alloc(0);
let currentType = 0;
let currentSize = 0;
let onFrameCallback = null;

let socket = null;

function onFrame(cb) {
    onFrameCallback = cb;
}

function sendMouseMove(message) {
    const m = new Message(Type.TYPE_MOUSE_MOTION, message.x, message.y, 0, 0, 0, 0, 0, 0, 0, 0);
    socket.write(m.getBuffer());
}

function sendMouseButton(message) {
    const isDown = message.isDown ? Type.TYPE_MOUSE_DOWN : Type.TYPE_MOUSE_UP;
    const m = new Message(isDown, 0, 0, message.button, 0, 0, 0, 0, 0, 0, 0);
    socket.write(m.getBuffer());
}
function connect(hostname, port) {
    socket = net.createConnection(port, hostname);

    socket.on('connect', () => {
        isConnected = true;
        const message = new Message(6, 0, 0, 0, 0, 0, 1280, 720, 1000000, 30, 0);
        socket.write(message.getBuffer());

    });

    socket.on('data', (chunk) => {
        receivedBuffer = Buffer.concat([receivedBuffer, chunk]);
        handleNewFrame();
    });
};

function isNewFrame() {
    return currentSize === 0 && currentType === 0;
}

function read(size) {
    if (receivedBuffer.length >= size) {
        const data = receivedBuffer.slice(0, size);
        receivedBuffer = receivedBuffer.slice(size, receivedBuffer.length);
        return data;
    }
}

function readUInt32() {
    const b = read(4).readUInt32LE();

    return b;
}

function isIDRFrame(frame) {
    return frame.readUInt8(4) === 0x67;
}

function nalUnitParser(buffer) {
    let preposition = 0;
    if (buffer.readUInt8(4) == 0x41) {
        console.log(buffer);
        buffer = buffer.slice(1, buffer.length);
        for (var i = 4; i < buffer.length; i++) {
            if(i + 4 > buffer.length)
                break;
            const NAL_START = buffer.readUInt8(i) << 16 | buffer.readUInt8(i + 1) << 8 | buffer.readUInt8(i + 2);
            if (NAL_START === 0x01) {
                let slice = buffer.slice(preposition, i);
                slice = slice.slice(3, slice.length)
                preposition = i;
                console.log(slice);
                onFrameCallback(slice);
            }
        }
        const slice = buffer.slice(preposition + 3, buffer.length);
        console.log(slice);
        onFrameCallback(slice);
    } else {
    onFrameCallback(buffer);
    }

}

function extractSPSPPS(frame) {
    var dataOffset = 0;
    var ppsOffset = 0;

    for (var i = 4; i < frame.length; i++) {
        const NAL_START = frame.readUInt8(i) << 16 | frame.readUInt8(i + 1) << 8 | frame.readUInt8(i + 2);
        if (NAL_START == 0x01 && frame.readUInt8(i + 3) == 0x68) {
            ppsOffset = i - 1;
            i = i + 4;
        } else if (ppsOffset > 0 && NAL_START === 0x01) {
            dataOffset = i;
            break;
        }
    }

    const sps = frame.slice(0, ppsOffset);
    const pps = frame.slice(ppsOffset, dataOffset);
    const data = frame.slice(dataOffset, frame.length);

    //console.log(sps);
    //console.log(pps);
    //console.log(data);
    onFrameCallback(sps);
    onFrameCallback(pps);
    onFrameCallback(data);

}

function handleNewFrame() {
    while (true) {
        if (isNewFrame()) {
            if (receivedBuffer.length >= 8) {
                currentType = readUInt32();
                currentSize = readUInt32();
            } else {
                break;
            }
        } else {
            if (receivedBuffer.length >= currentSize) {
                const frame = new Frame(currentType, currentSize, read(currentSize));
                currentSize = 0;
                currentType = 0;

                //console.log(frame);
                if (frame.type === 1)
                    if (false) {
                        extractSPSPPS(frame.data);
                    } else {
                    //require('fs').appendFileSync('./stream.h264', frame.data);
                        onFrameCallback(frame.data);
                    }
            } else {
                break;
            }

        }

    }
}


module.exports.connect = connect;
module.exports.onFrame = onFrame;
module.exports.sendMouseButton = sendMouseButton;
module.exports.sendMouseMove = sendMouseMove;
module.exports.close = close
