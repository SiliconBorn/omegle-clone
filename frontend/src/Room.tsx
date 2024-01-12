import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { Socket, io } from "socket.io-client";


const URL = "http://localhost:3000";

const Room = ({
name,
localAudioTrack,
localVideoTrack
}:{
    name:string,
    localAudioTrack:MediaStreamTrack,
    localVideoTrack:MediaStreamTrack

}) => {

const [serachParams,setSearchParams] = useSearchParams()
// const name = serachParams.get("name");
const [socket,setSocket] = useState<null|Socket>(null);
const [lobby,setLobby] = useState<boolean>(false);
const [sendingPc,setSendingPc] = useState<null|RTCPeerConnection>(null);
const [receivingPc,setReceivingingPc] = useState<null|RTCPeerConnection>(null);
const [remoteVideoTrack,setRemoteVideoTrack] = useState<null|MediaStreamTrack>(null);
const [remoteAudioTrack,setRemoteAudioTrack] = useState<null|MediaStreamTrack>(null);





useEffect(()=>{
const socket = io(URL)
socket.on("send-offer",async({roomId})=>{
    // alert("send offer please!!");
    setLobby(false)
    const pc = new RTCPeerConnection();
    setSendingPc(pc);
pc.addTrack(localAudioTrack)
pc.addTrack(localVideoTrack)
    pc.onicecandidate = async()=>{
    const sdp = await pc.createOffer();
    socket.emit("offer",{
        sdp,
        roomId
    });

    }
})


socket.on("offer",async({roomId,offer})=>{
    // alert("send answer please!!");
      setLobby(false)
    const pc = new RTCPeerConnection();
       pc.setRemoteDescription({sdp:offer,type:"offer"})

       const sdp = await pc.createAnswer();

       //trickle ice
       
       setReceivingingPc(pc);
       pc.ontrack = (({track,type})=>{
        if(type==="audio"){
            setRemoteAudioTrack(track);
        }else{
            setRemoteVideoTrack(track)
        }
       })
    socket.emit("answer",{
        sdp,
        roomId
    });
})

socket.on("answer",({roomId,answer})=>{
    setLobby(false)
    // alert("connection done!!")
    setSendingPc(pc=>{
        pc?.setRemoteDescription({
            type:"answer",
            sdp:answer
        })
        return pc
    })
     
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