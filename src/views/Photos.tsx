import { useNavigate } from "react-router";
import { db, Photo } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import { Aperture, ImageDown, Info, Trash2 } from "lucide-react";


export default function Photos(){
    const navigate = useNavigate();
    

    // const downloadPhoto = (imgData: Blob, photoName: string) => {
    //     if(!imgData) return;
    //     const link = document.createElement('a');
    //     const imgURL = createURL(imgData);
    //     link.href = imgURL;
    //     link.download = photoName + ".jpg";
    //     link.click();
    // }

    const createURL = (imageData: Blob) => {
        return URL.createObjectURL(imageData)
    }

    const shareNotes = (imgBlob: Photo) => {
        if (navigator.share && imgBlob.data) {
          navigator.share({
            files: [
              new File([imgBlob.data], `${imgBlob.name}.jpg`, {
                type: "image/jpeg",
              })
            ]
          })
          .then(() => console.log('Successful share'))
          .catch(error => console.log('Error sharing:', error));
        }
        else{
          alert("not working")
        }
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
        <div className="h-dvh w-full flex flex-col px-2 pt-2 bg-[#f9f9f9]">
            {(photos && photos?.length > 0) ? (
                <div className="h-full flex flex-col gap-4 overflow-y-auto scroll-smooth">
                    {photos?.sort((a, b) => b.id - a.id).map(photo => {
                        const side = (Math.floor(Math.random() * 2) == 1 ? true : false);
                        const imgSize = Math.round(photo.data.size / 1000);
                        return(
                            <div className={`flex flex-col w-3/4 gap-1 ${side ? 'self-start':'self-end'}`}>
                                <img onClick={()=>shareNotes(photo)} src={createURL(photo.data)} alt={photo.name} />
                                <div className="flex flex-row justify-between">
                                    <h2>{photo.name}</h2>
                                    <p className="text-gray-400">{imgSize} kb</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

            ):(
                <div className="h-full w-full flex items-center justify-center gap-3">
                    <h2 className="text-gray-500">No Photos Yet.</h2>
                </div>
            )
            }
            <div id="navbar" className="w-full flex flex-row items-center justify-evenly pt-4">
                <button onClick={()=>navigate("/")}>
                    <Aperture />
                </button>
                <ImageDown />
                <button onClick={()=>db.albumn.clear()}>
                    <Trash2 />
                </button>
                <Info />
            </div>
        </div>
    )
}