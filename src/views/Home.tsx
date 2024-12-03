import { useEffect, useRef, useState } from "react";
import camImage from "../assets/y2k_cam_sony_vert.png"
import digi from "../assets/digi-s.jpg"
import film from "../assets/film.jpg"
import dreamy from "../assets/dreamy.jpg"
import wavy from "../assets/wavy-s.jpg"
import { db } from "../db";
import { useNavigate } from "react-router";
import { Blend } from "lucide-react";


export default function Home () {
    const [isMobile, setIsMobile] = useState<boolean>(true);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [imgURL, setImgURL] = useState<Blob | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
    const [filterCounter, setFilterCounter] = useState<number>(0);
    const navigate = useNavigate();

    const filters = [digi, film, dreamy, wavy]



    const mobile_constraints = {
        video: {
            facingMode: { exact: "environment" },
            width: { exact: 1024 },
            height: { exact: 768 },
            // frameRate: { ideal: 15 }
        }
    };

    const getStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(isMobile ? mobile_constraints : {video: { 
            width: { exact: 640 },
            height: { exact: 480 },
            frameRate: { ideal: 24 }}
        });
        setVideoStream(stream);
    }

    const gotoAlbumn = () => {
        setVideoStream(null);
        navigate("/photos")
    }

    const captureImageWithOverlay = () => {
        setIsTakingPhoto(true);
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if(!context) return;
          const image = new Image();
          image.src = filters[filterCounter];


          Promise.all([
            new Promise(resolve => image.onload = resolve),
          ]).then(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // --- Saving for later ---

            // context.globalCompositeOperation = 'lighten';
            // context.globalAlpha = 0.15; // Set opacity to 15%
            // context.fillStyle = 'blue'; // Set fill color to blue
            // context.fillRect(0, 0, canvas.width, canvas.height);

            // context.globalAlpha = 0.15; // Set opacity to 15%
            // context.fillStyle = 'orange'; // Solid orange color
            // context.fillRect(0, 0, canvas.width, canvas.height);

            context.globalCompositeOperation = 'multiply';

            context.globalAlpha = 0.40;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
    
            context.globalAlpha = 1.0;

            canvas.toBlob(
                (blob) => {
                    setImgURL(blob);
                },
                'image/jpeg',
                0.95
              );
            })
        }
    };

    const shuffleFilter = () => {
        if(filterCounter == 4){
            setFilterCounter(0);
        }else{
            setFilterCounter(filterCounter + 1);
        }
    }

    useEffect(()=>{
        if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
            console.log("Let's get this party started")
        }

        if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
           setIsMobile(true);
        }else{
           setIsMobile(false);
        }
    },[])

    const addPhoto = async (imgData: Blob) => {

        const id = await db.albumn.add({
            name:"",
            data: imgData
        })

        await db.albumn.update(id, { name: "Y2K-" + id });
        setIsTakingPhoto(false);
    }

    useEffect(()=>{
        if(!imgURL) return;
        addPhoto(imgURL);
    },[imgURL])

    useEffect(()=>{
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    },[videoStream])

    return(

        <div className="w-full h-dvh bg-[#f9f9f9] flex items-center justify-center overflow-hidden p-2">
            <div className='relative overflow-hidden'>
                <div className='absolute bg-transparent h-full flex w-full px-9'>
                    <div className='relative h-3/5 w-full -left-0.5 mt-16 bg-blue-600 overflow-clip'>
                        {(videoStream && !isTakingPhoto) &&
                            <button onClick={()=>gotoAlbumn()} className="bottom-10 -left-1.5 rounded-sm bg-black opacity-55 absolute text-white z-50 p-1 text-sm rotate-90"> PHOTOS </button>
                        }
                        {(videoStream && !isTakingPhoto) &&
                            <button onClick={()=>shuffleFilter()} className="top-6 left-3 rounded-sm bg-black opacity-55 absolute text-white z-50 p-1 text-sm rotate-90"> <Blend size={20} className="p-[1px]"/> </button>
                        }
                        {!videoStream &&
                            <h2 className='top-5 left-5 absolute text-white'> click any button to turn on cam</h2>
                        }
                        {isTakingPhoto && 
                            <div className="h-full bg-slate-900"></div>
                        }
                        <canvas ref={canvasRef} className='hidden' />
                        {filterCounter <= 3 &&
                            <img src={filters[filterCounter]} className='absolute z-10 opacity-30 object-cover h-full w-full' />
                        }
                        <video className={`h-full w-full object-cover ${isMobile ? '':'-scale-x-100'}`} ref={videoRef} autoPlay={true} playsInline={true} >
                        </video>
                    </div>
                </div>
                <button onClick={videoStream ? ()=>captureImageWithOverlay() : ()=>getStream()} className='absolute bg-transparent z-50 bottom-14 h-32 w-full' />

                <img 
                    src={camImage} 
                    alt="cam" 
                    className="object-cover z-30 relative" 
                />
            </div>
        </div>
    )
}