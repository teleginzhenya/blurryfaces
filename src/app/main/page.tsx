"use client";

import { useRef, useState } from "react";
import WebcamView, { WebcamViewHandle } from "@/components/WebcamView";
import GridOverlay from "@/components/GridOverlay";
import PreviewCanvas, { PreviewCanvasHandle } from "@/components/PreviewCanvas";

export default function Main() {
  const webcamRef = useRef<WebcamViewHandle>(null);
  const canvasRef = useRef<PreviewCanvasHandle>(null);
  const [canvasOpacity, setCanvasOpacity] = useState(0.5);
  
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-black overflow-auto">
      <div className="relative w-[1920px] h-[1080px] overflow-hidden">
        <WebcamView ref={webcamRef} />
        <PreviewCanvas ref={canvasRef} webcamRef={webcamRef} opacity={canvasOpacity} />
        <GridOverlay canvasRef={canvasRef} />
        
        {/* Opacity control */}
        <div className="absolute bottom-4 left-4 z-30 bg-black bg-opacity-50 p-2 rounded">
          <label htmlFor="opacity-slider" className="text-white text-sm block mb-1">
            Canvas Opacity: {canvasOpacity.toFixed(2)}
          </label>
          <input
            id="opacity-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={canvasOpacity}
            onChange={(e) => setCanvasOpacity(parseFloat(e.target.value))}
            className="w-40"
          />
        </div>
      </div>
    </div>
  );
}
