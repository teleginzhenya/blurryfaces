"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export interface WebcamViewHandle {
  captureRegion: (x: number, y: number, width: number, height: number) => string | null;
  videoElement: HTMLVideoElement | null;
}

const WebcamView = forwardRef<WebcamViewHandle>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useImperativeHandle(ref, () => ({
    captureRegion: (x: number, y: number, width: number, height: number) => {
      if (!videoRef.current) return null;
      
      try {
        const video = videoRef.current;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        // Get the displayed dimensions of the video
        const videoRect = video.getBoundingClientRect();
        const displayWidth = videoRect.width;
        const displayHeight = videoRect.height;
        
        // Calculate the scaling factors to map from display coordinates to video coordinates
        const scaleX = videoWidth / displayWidth;
        const scaleY = videoHeight / displayHeight;
        
        // Calculate the position in the actual video coordinates
        const videoX = x * scaleX;
        const videoY = y * scaleY;
        const videoRegionWidth = width * scaleX;
        const videoRegionHeight = height * scaleY;
        
        // Create a canvas to draw the captured region
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        // Draw the specific region of the video to the canvas
        ctx.drawImage(
          video,
          videoX, videoY, videoRegionWidth, videoRegionHeight,
          0, 0, width, height
        );
        
        return canvas.toDataURL('image/jpeg');
      } catch (err) {
        console.error('Error capturing region:', err);
        return null;
      }
    },
    videoElement: videoRef.current
  }));

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setError("Could not access webcam. Please check permissions.");
        setIsLoading(false);
      }
    }

    setupWebcam();

    // Cleanup function to stop all tracks when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-10 bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading webcam...
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900 bg-opacity-50 p-4 text-center">
          {error}
        </div>
      )}
      
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-contain absolute inset-0"
      />
    </div>
  );
});

WebcamView.displayName = 'WebcamView';

export default WebcamView;
