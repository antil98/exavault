'use client';

import { useGlobalContext } from '@/app/context/global.context';
import { useRef, useState } from 'react';

export default function FileDropProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const { setDroppedFiles } = useGlobalContext();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);

    setDroppedFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      className="w-full min-h-screen relative"
      onDragEnter={(e) => {
        e.preventDefault();
        dragCounter.current++;
        setDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        dragCounter.current--;
        if (dragCounter.current === 0) {
          setDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
          <div className="w-full h-full border-4 border-dashed border-accent bg-black/50 flex items-center justify-center text-2xl font-semibold">
            Drop files to upload
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
