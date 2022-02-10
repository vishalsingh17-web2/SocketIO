const express = require("express");
var http = require("http");
var app = express();
var server = http.createServer(app);
var io = require("socket.io")(server);

app.use(express.json());
var clients = {};
io.on("connection", (socket) => {
    socket.on("signin",(id)=>{
        clients[id] = socket;
        // console.log(clients[]);
    });
    socket.on("message",(msg)=>{
        console.log(msg);
        let targetId = msg.targetId;
        if(clients[targetId]){
            clients[targetId].emit("message",msg);
        }
    });
    socket.on('typing',(typing)=>{
        console.log(typing);
        let targetId = typing.targetId;
        if(clients[targetId]!=null){
            clients[targetId].emit('typing',typing);
        }
    })
    socket.on('isOnline',(data)=>{
        for(let id in clients){
            if(id!=data.uid){
                clients[id].emit('isOnline',data);
            }
        }
    })
});


server.listen(process.env.PORT, () => {
    console.log("Server started on port 3000");
});