import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"

const Room = () => {
const [serachParams,setSearchParams] = useSearchParams()
const name = serachParams.get("name");
    
useEffect(()=>{

    //logic to init user to room
},[name])
return (
    <div>
        Hi!!!! {name}
    </div>
  )
}

export default Room