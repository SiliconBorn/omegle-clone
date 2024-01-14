import { User } from "./UserManager";


let GLOBAL_ROOM_ID = 1;

export interface Room{
  user1:User,
  user2:User,
}

export class RoomManager{
   private rooms:Map<string,Room>

    constructor(){
      this.rooms = new Map<string,Room>();
    }


    createRoom(user1:User,user2:User){
        const roomId = this.generate().toString();
        this.rooms.set(roomId.toString(),{
          user1,
          user2
        })
       
        user1.socket.emit("send-offer",{
          roomId
        })
    }

    

    onOffer(roomId:string,sdp:string,senderSocketId:string){
      
      const  room = this.rooms.get(roomId);
      if(!room){
        return;
      }

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1: room.user2;
         
        //  const user2 = this.rooms.get(roomId)?.user2;
         console.log(`onOffer`)
         console.log(`user2 is ${receivingUser}`)
         receivingUser?.socket.emit("offer",{
          sdp,
          roomId
         })
    }


    onAnswer(roomId:string,sdp:string,senderSocketId:string){
      
      const  room = this.rooms.get(roomId);
      if(!room){
        return;
      }

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1: room.user2;
      // const user1 = this.rooms.get(roomId)?.user1;
         console.log(`onAnswer`)
         console.log(`user1 is ${receivingUser}`)
      receivingUser?.socket.emit("answer",{
       sdp,
       roomId
      })
    }

    onIceCandidates(roomId:string,senderSocketId:string,candidate:any,type:"sender"|"receiver"){

      const  room = this.rooms.get(roomId);
      if(!room){
        return;
      }

        const receivingUser = room.user1.socket.id === senderSocketId ? room.user1: room.user2;
        receivingUser.socket.send("add-ice-candidate",({candidate,type}))
    }

    
   generate(){
    return GLOBAL_ROOM_ID++;
  }


}