import { useEffect, useRef, useState } from "react";
import camImage from "../assets/y2k_cam_sony_vert.png"
import vhs from "../assets/vhs.jpg"
import vhs2 from "../assets/vhs2.jpg"

export interface IBookResponse {
    author: string,
    desc: string,
    genres: string[],
    isbn: number,
    link: string,
    title: string,
}






export default function Home () {
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
    const [imgURL, setImgURL] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);


    const mobile_constraints = {
        video: {
            facingMode: { exact: "environment" }
        }
    };

    const getStream = async () => {
        const stream = await navigator.mediaDevices.getUserMedia(isMobile ? mobile_constraints : {video: true});
        setVideoStream(stream);
    }

    const captureImageWithOverlay = () => {
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          if(!context) return;
          // Draw video frame
          const image = new Image(); // Create an image object
          image.src = vhs; // Set the imported image as the source

          const image2 = new Image(); // Create an image object
          image2.src = vhs2; // Set the imported image as the source
    
          image.onload = async () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            // Draw overlay image
            context.globalAlpha = 0.20; // Adjust opacity if needed
            context.drawImage(image, 0, 0, canvas.width, canvas.height); // Adjust position and size of overlay

            context.globalAlpha = 0.10; // Adjust opacity if needed
            context.drawImage(image2, 0, 0, canvas.width, canvas.height); // Adjust position and size of overlay
    
            context.globalAlpha = 1.0;

            const dataUrl = canvas.toDataURL('image/png'); // Base64 format
            setImgURL(dataUrl);
            }
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

    useEffect(()=>{
        if(!imgURL) return;
        const link = document.createElement('a');
        link.href = imgURL; // Base64 image source
        link.download = 'y2k.png'; // File name
        link.click();
    },[imgURL])

    useEffect(()=>{
        if (videoRef.current && videoStream) {
            videoRef.current.srcObject = videoStream;
        }
    },[videoStream])

    return(

        <div className="w-full h-dvh bg-[#89CC04] flex items-center justify-center overflow-hidden p-2">
            <div className='relative overflow-hidden'>
                <div className='absolute bg-transparent h-full w-full px-9'>
                    <div className='relative h-3/5 w-full mt-16 bg-[#89CC04] overflow-clip'>
                        {!videoStream &&
                            <h2 className='top-5 left-5 absolute text-black'> click any button to turn on cam</h2>
                        }
                        <canvas ref={canvasRef} className='hidden' />
                        <img src={vhs} className='absolute z-10 opacity-20' />
                        <img src={vhs2} className='absolute z-10 opacity-10' />
                        <video className={`h-full w-full object-cover ${isMobile ? '':'-scale-x-100'}`} ref={videoRef} autoPlay playsInline >
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