"use client";

import { useState, useRef, RefObject } from "react";
import { PreviewCanvasHandle } from "./PreviewCanvas";

interface PopupProps {
  index: string;
  screenshot: string | null;
  onClose: () => void;
}

function Popup({ index, screenshot, onClose }: PopupProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4">Cell Index</h3>
        <p className="mb-4">You clicked on cell: {index}</p>
        
        {screenshot ? (
          <div className="mb-4">
            <p className="mb-2 font-medium">Screenshot:</p>
            <div className="flex justify-center">
              <img 
                src={screenshot} 
                alt={`Screenshot of ${index}`} 
                className="rounded border border-gray-300"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
        ) : (
          <p className="mb-4 text-red-500">Failed to capture screenshot</p>
        )}
        
        <button 
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

interface GridOverlayProps {
  canvasRef: RefObject<PreviewCanvasHandle | null>;
}

export default function GridOverlay({ canvasRef }: GridOverlayProps) {
  const [selectedCell, setSelectedCell] = useState<{index: string; screenshot: string | null} | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Create a grid with 11 columns and 5 rows
  const rows = 5;
  const cols = 11;
  
  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!canvasRef.current || !gridRef.current) {
      setSelectedCell({
        index: `Row ${rowIndex + 1}, Column ${colIndex + 1}`,
        screenshot: null
      });
      return;
    }
    
    // Get the grid dimensions
    const gridRect = gridRef.current.getBoundingClientRect();
    const totalWidth = gridRect.width;
    const totalHeight = gridRect.height;
    
    // Calculate the exact cell position and size based on grid dimensions
    const cellWidth = totalWidth / cols;
    const cellHeight = totalHeight / rows;
    
    // Calculate the exact position of this cell within the grid
    const cellX = colIndex * cellWidth;
    const cellY = rowIndex * cellHeight;
    
    // Capture the region of the canvas that corresponds to this cell
    const screenshot = canvasRef.current.captureRegion(
      cellX, cellY, cellWidth, cellHeight
    );
    
    setSelectedCell({
      index: `Row ${rowIndex + 1}, Column ${colIndex + 1}`,
      screenshot
    });
  };
  
  const closePopup = () => {
    setSelectedCell(null);
  };
  
  return (
    <>
      <div ref={gridRef} className="absolute inset-0 z-20 grid grid-rows-5 grid-cols-11">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="cursor-pointer transition-all duration-200 outline outline-1 outline-white/50 hover:outline-2 hover:outline-white"
              onClick={() => handleCellClick(rowIndex, colIndex)}
            />
          ))
        ))}
      </div>
      
      {selectedCell && (
        <Popup 
          index={selectedCell.index} 
          screenshot={selectedCell.screenshot} 
          onClose={closePopup} 
        />
      )}
    </>
  );
}
