
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

app.get('/', function (req, res) {
    res.render('index.ejs');
});

io.sockets.on('connection', function (socket) {
    socket.on('username', function (username) {
        socket.username = username;
        io.emit('is_online', '🔵 <i>' + socket.username + ' join the game..</i>');
    });

    socket.on('typing', function (username, data) {
        if (data != '') {
            html = '<p><em>' + username + ' is typing...</em></p>';
        } else {
            html = ''
        }
        io.emit('is_typing', html);
    });

    socket.on('disconnect', function (username) {
        io.sockets.in(username).emit('is_online', '🔴 <i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('inputXorO', function (data, id, username) {
       // console.log(socket.adapter.rooms["Sanket"].length);
        io.sockets.in(username).emit('input_XorO', data, id, id);
    })

    socket.on('chat_message', function (message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });

    socket.on('i_won', function (XorO) {
        
        console.log(XorO+" Won The Game");
        io.emit('otherplayerwon',XorO);
    });

    socket.on('privatechatroom', function (roomID) {

        //console.log("privatechatroom joined by "+ data.name);
        console.log(socket.adapter.rooms);
        if (socket.adapter.rooms[roomID]) {
            console.log("user already present")
            socket.join(roomID);
            io.sockets.in(roomID).emit('start',roomID);
        } else {
            var roomID = Math.floor(100000 + Math.random() * 900000)
            socket.join(roomID);
            console.log(roomID);
            io.sockets.in(roomID).emit('waitforpartner',roomID);
        }
    });


});

const server = http.listen(server_port, server_ip_address, function () {
    console.log('listening on *:'+server_port);
});