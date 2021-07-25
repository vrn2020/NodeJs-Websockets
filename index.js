const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let timerId = null,
    sockets = new Set();
var tradedata = require('./data');

var localdata = {};

io.on('connection', socket => {
    localdata = tradedata.data;
    sockets.add(socket);
    if (!timerId) {
        startTimer();
    }

    console.log(`Socket ${socket.id} has connected`);

    socket.on('disconnect', () => {
        console.log(`Deleting socket: ${socket.id}`);
        sockets.delete(socket);
        console.log(`Remaining sockets: ${sockets.size}`);
    });
});

function startTimer() {
    timerId = setInterval(() => {
        if (!sockets.size) {
            clearInterval(timerId);
            timerId = null;
            console.log(`Timer stopped`);
        }
        updateData();
        for (const s of sockets) {
            s.emit('documents', { data: localdata });
        }

    }, 10);
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function updateData() {
    localdata.forEach(
        (a) => {
            a.Coupon = getRandomInt(10, 500);
            a.Notional = getRandomInt(1000000, 7000000);
        });
}

http.listen(4444, () => {
    console.log('Listening on port 4444');
});