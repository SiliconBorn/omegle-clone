import { Socket } from "socket.io";

const express = require("express")
const {Server}  = require("socket.io")
const http = require("http")
const {join} =require("path")


const app = express();
const server = http.createServer(http)
const io = new Server(server)



io.on("connection",(socket:Socket)=>{
    console.log(socket);
    console.log("user connected");
});


server.listen(3000,()=>{
    console.log(`server running at port 3000`)
})

