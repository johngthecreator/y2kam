import { useEffect, useRef, useState } from "react";
import camImage from "../assets/y2k_cam_sony_vert.png"
import vhs from "../assets/vhs.jpg"
import vhs2 from "../assets/vhs2.jpg"
import { db } from "../db";
import { useNavigate } from "react-router";


export default function Home () {
    const [isMobile, setIsMobile] = useState<boolean>(true);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [imgURL, setImgURL] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
    const navigate = useNavigate();



    const mobile_constraints = {
        video: {
            facingMode: { exact: "environment" },
            width: { exact: 640 },
            height: { exact: 480 },
            frameRate: { ideal: 15 }
        }
    };

    const getStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(isMobile ? mobile_constraints : {video: { 
            width: { exact: 640 },
            height: { exact: 480 },
            frameRate: { ideal: 15 }}
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
          image.src = vhs;

          const image2 = new Image();
          image2.src = vhs2;

          Promise.all([
            new Promise(resolve => image.onload = resolve),
            new Promise(resolve => image2.onload = resolve)
          ]).then(() => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            context.globalAlpha = 0.20;
            context.drawImage(image, 0, 0, canvas.width, canvas.height);

            context.globalAlpha = 0.30;
            context.drawImage(image2, 0, 0, canvas.width, canvas.height);
    
            context.globalAlpha = 1.0;

            const dataUrl = canvas.toDataURL('image/jpeg');
            setImgURL(dataUrl);
            })
        }
    };

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

    const addPhoto = async (imgData: string) => {

        const id = await db.albumn.add({
            name:"",
            data: imgData
        })

        await db.albumn.update(id, { name: "y2k-" + id });
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

        <div className="w-full h-dvh bg-[#89CC04] flex items-center justify-center overflow-hidden p-2">
            <div className='relative overflow-hidden'>
                <div className='absolute bg-transparent h-full flex w-full px-9'>
                    <div className='relative h-3/5 w-full mt-16 bg-blue-600 overflow-clip'>
                        {(videoStream && !isTakingPhoto) &&
                            <button onClick={()=>gotoAlbumn()} className="bottom-10 -left-1 rounded-sm bg-black opacity-55 absolute text-white z-50 p-1 text-sm rotate-90"> PHOTOS </button>
                        }
                        {!videoStream &&
                            <h2 className='top-5 left-5 absolute text-white'> click any button to turn on cam</h2>
                        }
                        {isTakingPhoto && 
                            <div className="h-full bg-slate-900"></div>
                        }
                        <canvas ref={canvasRef} className='hidden' />
                        <img src={vhs} className='absolute z-10 opacity-20' />
                        <img src={vhs2} className='absolute z-10 opacity-30 object-cover' />
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