const express = require("express");
var http = require("http");
var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);

var admin = require("firebase-admin");

var serviceAccount = require("./chat-3a149-firebase-adminsdk-l56n0-cc81783981.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


app.use(express.json());
var clients = {};
io.on("connection", (socket) => {
    socket.on("signin", (id) => {
        clients[id] = socket;
        console.log(id);
    });
    socket.on("message", (msg) => {
        console.log(msg);
        let targetId = msg.targetId;
        if (clients[targetId]) {
            clients[targetId].emit("message", msg);
            try{
                const registrationToken = msg.fcmToken;
                const message = {
                    data:{
                        "sourceId": msg.sourceId,
                        "time": msg.time,
                    },
                    notification: {
                        title: msg.sendersName,
                        body: msg.message,
                    },
                    token: registrationToken
                };
                admin.messaging().send(message)
            }catch(e){
                console.log("FCM Token error: "+e);
            }
        }
    });
    socket.on('typing', (typing) => {
        console.log(typing);
        let targetId = typing.targetId;
        if (clients[targetId] != null) {
            clients[targetId].emit('typing', typing);
        }
    })
    socket.on('isOnline', (data) => {
        for (let id in clients) {
            if (id != data.uid) {
                clients[id].emit('isOnline', data);
            }
        }
    })
});


server.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
});