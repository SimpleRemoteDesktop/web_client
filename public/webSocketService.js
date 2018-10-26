var socket = null;

function startWebsocket(frameHandlerCallback) {
    socket = new WebSocket('ws://127.0.0.1:8080/', "srd_protocol");

    socket.binaryType = 'arraybuffer'; // from jmuxer

    socket.onopen = function (event) {
        console.log("websocket open");
        console.log(event);
        socket.send({type: "start"});
    };

    socket.onmessage = function (event) {
        const byteArray = new Uint8Array(event.data);
        frameHandlerCallback(byteArray);

    };
}