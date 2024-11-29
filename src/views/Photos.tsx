import { useNavigate } from "react-router";
import { db } from "../db";
import { useLiveQuery } from "dexie-react-hooks";

export default function Photos(){
    const navigate = useNavigate();
    const downloadPhoto = (imgURL: string, photoName: string) => {
        if(!imgURL) return;
        const link = document.createElement('a');
        link.href = imgURL;
        link.download = photoName + ".jpg";
        link.click();
    }

    const photos = useLiveQuery(() => db.albumn.toArray());
    return(
        <div className="h-dvh w-full p-2 bg-[#89CC04]">
            <div className="absolute div justify-between items-center p-2">
                <h1 className="text-3xl font-archivo font-bold">photos <br /> and they're still mine <br />  but just vibey.</h1>
                <button onClick={()=>navigate("/")} className="text-xl font-archivo">back 2 camera</button>
            </div>
            <div className="h-full flex flex-col gap-3 overflow-y-auto scroll-smooth">
                <div className="p-20">
                </div>
                {photos?.sort((a, b) => b.id - a.id).map(photo => {
                    return(
                        <img onClick={()=>downloadPhoto(photo.data, photo.name)} src={photo.data} alt={photo.name} className="rounded"/>
                    )
                })}

            </div>
        </div>
    )
}