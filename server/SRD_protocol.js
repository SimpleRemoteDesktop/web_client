const Type = {
    TYPE_KEY_DOWN: 1,
    TYPE_KEY_UP: 2,
    TYPE_MOUSE_MOTION: 3,
    TYPE_MOUSE_DOWN: 4,
    TYPE_MOUSE_UP: 5,
    TYPE_ENCODER_START: 6,
    TYPE_ENCODER_STOP: 7

};

class Frame {
    constructor(type, size, data) {
        this.type = type;
        this.size = size;
        this.data = data;

    }
}

class Message {
    constructor(type = 0, x = 0, y = 0, button = 0,
                keycode = 0, scancode = 0, codec_width = 0,
                codec_height = 0, bandwidth = 0, fps = 0, sdl = 0) {

        this.buffer = Buffer.alloc(44);

        this.buffer.writeUInt32LE(type, 0);
        this.buffer.writeFloatLE(x, 4);
        this.buffer.writeFloatLE(y, 8);
        this.buffer.writeUInt32LE(button, 12);
        this.buffer.writeUInt32LE(keycode, 16);
        this.buffer.writeUInt32LE(scancode, 20);
        this.buffer.writeUInt32LE(codec_width, 24);
        this.buffer.writeUInt32LE(codec_height, 28);
        this.buffer.writeUInt32LE(bandwidth, 32);
        this.buffer.writeUInt32LE(fps, 36);
        this.buffer.writeUInt32LE(sdl, 40);

    }

    getBuffer() {
        return this.buffer;
    }
}


module.exports.Frame = Frame;
module.exports.Message = Message;