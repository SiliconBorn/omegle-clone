import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000";

const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: null | MediaStreamTrack;
  localVideoTrack: null | MediaStreamTrack;
}) => {
  const [serachParams, setSearchParams] = useSearchParams();
  // const name = serachParams.get("name");
  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState<boolean>(false);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [receivingPc, setReceivingingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<null | MediaStreamTrack>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<null | MediaStreamTrack>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<null | MediaStream>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = io(URL);
    socket.on("send-offer", async ({ roomId }) => {
      // alert("send offer please!!");
      setLobby(false);
      const pc = new RTCPeerConnection();
      setSendingPc(pc);
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }

      pc.onicecandidate = async (e) => {
        if (e.candidate) {
          pc.addIceCandidate(e.candidate);
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
        }
      };

      pc.onnegotiationneeded = async () => {
        setTimeout(async () => {
          const sdp = await pc.createOffer();
          // @ts-ignore
          pc.setLocalDescription(sdp);
          socket.emit("offer", {
            sdp,
            roomId,
          });
        }, 2000);
        // alert("onnegotiation needed")
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      // alert("send answer please!!");
      setLobby(false);
      const pc = new RTCPeerConnection();
      const stream = new MediaStream();

      pc.ontrack = (e) => {
        stream.addTrack(e.track);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      pc.setRemoteDescription(remoteSdp);

      const sdp = await pc.createAnswer();

      pc.setLocalDescription(sdp);
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);
      //trickle ice

      setReceivingingPc(pc);

      pc.onicecandidate = async (e) => {
        if (!e.candidate) {
          return;
        }
        if (e.candidate) {
          pc.addIceCandidate(e.candidate);
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
        }
      };

      socket.emit("answer", {
        sdp,
        roomId,
      });

      // ADHOC FIX

      // setTimeout(()=>{
      //     const track1 = pc.getTransceivers()[0].receiver.track
      //     const track2 = pc.getTransceivers()[1].receiver.track

      //     if(track1.kind === "video"){
      //         setRemoteVideoTrack(track1)
      //         setRemoteAudioTrack(track2)

      //     }else{
      //         setRemoteVideoTrack(track2)
      //         setRemoteAudioTrack(track1)

      //     }
      //     // @ts-ignore
      //     remoteVideoRef.current.srcObject.addTrack(track1)
      //     // @ts-ignore
      //     remoteVideoRef.current.srcObject.addTrack(track2)
      //     // @ts-ignore
      //     remoteVideoRef.current.play();

      // },5000)
    });

    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      // alert("connection done!!")
      setSendingPc((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
    });

    socket.on("lobby", () => {
      setLobby(true);
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      if (type == "sender") {
        setReceivingingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPc((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    setSocket(socket);
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
        localVideoRef.current.play();
      }
    }
  }, [localVideoRef, localVideoTrack]);

  return (
    <div>
      Hi!!!! {name}
      <video autoPlay width={400} height={400} ref={localVideoRef} />
      {lobby ? "WAITING TO CONNECT YOU TO SOMEONE" : null}
      <video autoPlay width={400} height={400} ref={remoteVideoRef} />
    </div>
  );
};

export default Room;
