import { Server,Socket } from "socket.io";
import express from "express";
import http from "http";
import { UserManager } from "./managers/UserManager";


const app = express();
const server = http.createServer(http)
const io = new Server(server,{
    cors:{
        origin:"*"
    }
})


const userManager = new UserManager()

io.on("connection",(socket:Socket)=>{
    // console.log(socket);
    console.log("user connected");
    userManager.addUser("randomName",socket);


    socket.on("disconnect",()=>{
        userManager.removerUser(socket.id)
        console.log(`user disconnected  `)

    })
});


server.listen(3000,()=>{
    console.log(`server running at port 3000`)
})

