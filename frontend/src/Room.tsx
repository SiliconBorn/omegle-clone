import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { Socket, io } from "socket.io-client";


const URL = "http://localhost:3000";

const Room = () => {
const [serachParams,setSearchParams] = useSearchParams()
const name = serachParams.get("name");
const [socket,setSocket] = useState<null|Socket>(null);
const [lobby,setLobby] = useState<boolean>(false);
const [sendingPc,setSendingPc] = useState<null|RTCPeerConnection>(null);
const [receivingPc,setReceivingingPc] = useState<null|RTCPeerConnection>(null);
const [remoteVideoTrack,setRemoteVideoTrack] = useState<null|MediaStreamTrack>(null);
const [localVideoTrack,setLocalVideoTrack] = useState<null|MediaStreamTrack>(null);
const [remoteAudioTrack,setRemoteAudioTrack] = useState<null|MediaStreamTrack>(null);
const [localAudioTrack,setLocalAudioTrack] = useState<null|MediaStreamTrack>(null);




useEffect(()=>{
const socket = io(URL)
socket.on("send-offer",({roomId})=>{
    alert("send offer please!!");
    setLobby(false)
    socket.emit("offer",{
        sdf:"",
        roomId
    });
})


socket.on("offer",({roomId,offer})=>{
    alert("send answer please!!");
      setLobby(false)
    socket.emit("answer",{
        sdf:"",
        roomId
    });
})

socket.on("answer",({roomId,answer})=>{
    setLobby(false)
    alert("connection done!!")
     
})

socket.on("lobby",()=>{
    setLobby(true)
})

setSocket(socket)
},[name])

if(lobby){
    return<div>
        WAITING TO CONNECT TO SOMEONE
    </div>
}

return (
    <div>
        Hi!!!! {name}

        <video width={400} height={400}/>
        <video width={400} height={400}/>
    </div>
  )
}

export default Room