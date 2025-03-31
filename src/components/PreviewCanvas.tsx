"use client";

import { useEffect, useRef, RefObject, forwardRef, useImperativeHandle } from "react";
import { WebcamViewHandle } from "./WebcamView";

export interface PreviewCanvasHandle {
  captureRegion: (x: number, y: number, width: number, height: number) => string | null;
  canvasElement: HTMLCanvasElement | null;
}

interface PreviewCanvasProps {
  webcamRef: RefObject<WebcamViewHandle | null>;
  opacity?: number;
}

const PreviewCanvas = forwardRef<PreviewCanvasHandle, PreviewCanvasProps>(({ webcamRef, opacity = 0.5 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    captureRegion: (x: number, y: number, width: number, height: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      
      try {
        // Create a temporary canvas for the captured region
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return null;
        
        // Draw the region from the main canvas to the temporary canvas
        tempCtx.drawImage(
          canvas,
          x, y, width, height,  // Source rectangle
          0, 0, width, height   // Destination rectangle
        );
        
        // Convert to data URL
        return tempCanvas.toDataURL('image/jpeg');
      } catch (err) {
        console.error('Error capturing region from canvas:', err);
        return null;
      }
    },
    canvasElement: canvasRef.current
  }));
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let isActive = true;
    
    // Function to draw the video frame onto the canvas
    const drawVideoFrame = () => {
      if (!isActive) return;
      
      const videoElement = webcamRef.current?.videoElement;
      
      if (videoElement && videoElement.readyState >= 2) {
        // Get container dimensions
        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;
        
        // Get video dimensions
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;
        
        // Calculate dimensions to fit video in container while maintaining aspect ratio (object-contain)
        const videoAspectRatio = videoWidth / videoHeight;
        const containerAspectRatio = containerWidth / containerHeight;
        
        let canvasWidth, canvasHeight, drawX, drawY, drawWidth, drawHeight;
        
        if (videoAspectRatio > containerAspectRatio) {
          // Video is wider than container (relative to height)
          canvasWidth = containerWidth;
          canvasHeight = containerWidth / videoAspectRatio;
          drawX = 0;
          drawY = (containerHeight - canvasHeight) / 2;
          drawWidth = canvasWidth;
          drawHeight = canvasHeight;
        } else {
          // Video is taller than container (relative to width)
          canvasHeight = containerHeight;
          canvasWidth = containerHeight * videoAspectRatio;
          drawX = (containerWidth - canvasWidth) / 2;
          drawY = 0;
          drawWidth = canvasWidth;
          drawHeight = canvasHeight;
        }
        
        // Set canvas dimensions to match container
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set the global alpha (opacity)
        ctx.globalAlpha = opacity;
        
        // Draw the video frame onto the canvas with object-contain scaling
        ctx.drawImage(
          videoElement,
          0, 0, videoWidth, videoHeight,  // Source rectangle
          drawX, drawY, drawWidth, drawHeight  // Destination rectangle
        );
      }
      
      // Request the next animation frame
      animationFrameId = requestAnimationFrame(drawVideoFrame);
    };
    
    // Start the animation loop
    drawVideoFrame();
    
    // Cleanup function
    return () => {
      isActive = false;
      cancelAnimationFrame(animationFrameId);
    };
  }, [webcamRef, opacity]);
  
  return (
    <div ref={containerRef} className="absolute inset-0 z-[15]" style={{ pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
});

PreviewCanvas.displayName = 'PreviewCanvas';

export default PreviewCanvas;
