import { useNavigate } from "react-router";
import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect } from "react";

export default function Photos(){
    const navigate = useNavigate();
    const downloadPhoto = (imgData: Blob, photoName: string) => {
        if(!imgData) return;
        const link = document.createElement('a');
        const imgURL = createURL(imgData);
        link.href = imgURL;
        link.download = photoName + ".jpg";
        link.click();
    }

    const createURL = (imageData: Blob) => {
        return URL.createObjectURL(imageData)
    }

    const photos = useLiveQuery(() => db.albumn.toArray());

    if(photos && photos?.length > 0){
        if( typeof photos[0].data == "string"){
            db.albumn.clear();
        }else{
            console.log('already supports blobs')
        }
    }


    return(
        <div className="h-dvh w-full p-2 bg-[#89CC04]">
            <div className="absolute div justify-between items-center p-2">
                <h1 className="text-3xl font-archivo font-bold">photos <br /> and they're still mine <br />  but just vibey.</h1>
                <button onClick={()=>navigate("/")} className="text-xl font-archivo">back 2 camera</button>
            </div>
            <div className="absolute right-1 div justify-between items-center p-2">
                <button onClick={()=>db.albumn.clear()} className="text-3xl font-archivo text-right font-bold">clear <br /> camera</button>
            </div>
            <div className="h-full flex flex-col gap-3 overflow-y-auto scroll-smooth">
                <div className="p-20">
                </div>
                {photos?.sort((a, b) => b.id - a.id).map(photo => {
                    return(
                        <img onClick={()=>downloadPhoto(photo.data, photo.name)} src={createURL(photo.data)} alt={photo.name} className="rounded"/>
                    )
                })}

            </div>
        </div>
    )
}