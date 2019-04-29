const WebSocketServer = require('websocket').server;
const tcpClient = require('./tcpClient');
const http = require('http');
const fs = require('fs');

var server = http.createServer(function (request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    let url = request.url;
    if (url === "/")
        url = "/index.html";
    const filePath = __dirname + "/../public" + url;
    fs.readFile(filePath, function (err, page) {
        if (err) {
            console.log(err);
            response.writeHead(404);
            return response.end();
        } else {
            if (url.includes("wasm")) {
                response.writeHead(200, {"Content-Type": "application/wasm", 'Content-Length': 132979});
                response.write(page);
                response.end();
            } else {
                response.write(page.toString());
                return response.end();
            }

        }


    });
});

const httpPort = process.env.PORT || 8080;

server.listen(httpPort, function () {
    console.log((new Date()) + ' Server is listening on port ' + httpPort);
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function (request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('srd_protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            console.log(message);
            message = JSON.parse(message.utf8Data);
            tcpClient.onFrame(function (frame) {
                connection.send(frame);
            });

            console.log(message);

            switch (message.type) {
                case "start":
                    console.log("connecting to server");
                    tcpClient.connect("127.0.0.1", 8001);
                    break;
                case "button":
                    tcpClient.sendMouseButton(message);
                    break;
                case "move":
                    tcpClient.sendMouseMove(message);
                    break;
            }


        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function (reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        tcpClient.close();
    });
});
