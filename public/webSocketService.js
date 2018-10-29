var socket = null;

function startWebsocket(frameHandlerCallback) {
    const url = 'ws://' + window.location.host + '/';
    console.log('connecting websocket to url' + url);
    socket = new WebSocket(url, "srd_protocol");

    socket.binaryType = 'arraybuffer'; // from jmuxer

    socket.onopen = function (event) {
        console.log("websocket open");
        console.log(event);
        socket.send(JSON.stringify({type: "start"}));
    };

    socket.onmessage = function (event) {
        const byteArray = new Uint8Array(event.data);
        frameHandlerCallback(byteArray);

    };
}
