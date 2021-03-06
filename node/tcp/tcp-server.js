const
    net = require('net'),
    readline = require('readline'),
    port = 5050;

var
    clientList = [];

net.createServer((client) => {
    client.name = client.remoteAddress + ":" + client.remotePort;
    client.chat = [];
    clientList.push(client);
    showClientForStart(client);





    // broadcast(client.name + " joined the chat\n", client);

    client.on('data', function (data) {
        data = data.toString();
        if (data.indexOf('#') > -1) {
            var socketIndex = data.split('#')[1];
            var socketId = clientList[socketIndex].name;
            console.log(socketId);
            console.log(client.chat)
            client.chat.socketId = socketId;
            client.chat.connection = false;
            client.write('Wait for the connection\n\n');
            establishConnection(client);
        } else if (client.chat.connection) {
            sendChat(client, data);
        }

    });
    client.on('end', function () {
        for (var i = 0; i < clientList.length; i++) {
            if (clientList[i] == client) {
                console.log('Client has disconnected', client.name);
                delete clientList[i];
            }
        }
    });
}).listen(port, () => {
    console.log("Chat server running at port " + port);
});


function sendChat(client, message) {
    clientList.forEach((_c) => {
        if (_c.name == client.chat.socketId) {
            _c.write(client.name + ': ' + message);
            _c.write('\n');
        }
    });
}
function establishConnection(client) {
    clientList = clientList.map((_c) => {
        if (_c.name == client.chat.socketId) {
            client.chat.connection = true;
            _c.chat = {
                socketId: clone(client.name),
                connection: true
            }
            client.write('client Establish connection with' + _c.chat.socketId);
            client.write('Type message: ');
            _c.write('_c Establish connection with' + client.chat.socketId);
            _c.write('Type message: ');
        }
        return _c;
    });
}

function showClientForStart(client) {
    var list = [];
    list = clientList.map((c, index) => {
        if (c === client)
            return ['NOT', index, '-', 'ME'].join(' ');
        return [index, '-', c.name].join(' ');

    });
    client.chat = {
        connection: false,
        socketId: null
    };
    clientList.forEach((_c) => {
        _c.write('select a person to start conversation by starting with #ID (example: #0)\n')
        _c.write(list.join('\n'));
    })

}

function broadcast(message, sender) {
    clientList.forEach(function (client) {
        // Don't want to send it to sender
        // if (client === sender) return;
        client.write(message);
    });
    // Log it to the server output too
    process.stdout.write(message)
}

// function startServer() {
//     net.createServer(function (s) {
//         if (socket) return s.end("Sorry this chat is full");

//         socket = s;
//         socket.write("Welcome to the chat, I'm " + myNick);

//         socket.on('data', function (data) {
//             data = data.toString();
//             console.log(data);
//         });

//         socket.on('end', function () {
//             console.log('Client has disconnected');
//             socket = null;
//         });

//     }).listen(port);

//     console.log("Chat server running at port " + port);
// }

// function getNick() {
//     console.log("What's your name?");
// }

// readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// }).on('line', function (line) {
//     if (!myNick) {
//         line = line.trim();
//         if (line.length < 1) {
//             getNick();
//         } else {
//             myNick = line;
//             startServer();
//         }
//     } else {
//         socket.write(myNick + ": " + line);
//     }
// });
// ;

// getNick();

function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}