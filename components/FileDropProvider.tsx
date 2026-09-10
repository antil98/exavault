'use client';

import { useGlobalContext } from '@/context/global.context';
import { useRef, useState } from 'react';

export default function FileDropProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dragging, setDragging] = useState(false);
  const dragCounter = useRef(0);
  const { setDroppedFiles } = useGlobalContext();

  const isFileDrag = (e: React.DragEvent<HTMLDivElement>) =>
    Array.from(e.dataTransfer.types).includes('Files');

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isFileDrag(e)) return;

    e.preventDefault();
    dragCounter.current = 0;
    setDragging(false);

    const files = Array.from(e.dataTransfer.files);

    if (files.length > 0) {
      setDroppedFiles(files);
    }
  };

  return (
    <div
      className="w-full min-h-screen relative"
      onDragEnter={(e) => {
        if (!isFileDrag(e)) return;

        e.preventDefault();
        dragCounter.current++;
        setDragging(true);
      }}
      onDragOver={(e) => {
        if (!isFileDrag(e)) return;

        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!isFileDrag(e)) return;

        e.preventDefault();
        dragCounter.current = Math.max(0, dragCounter.current - 1);
        if (dragCounter.current === 0) {
          setDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex justify-center">
          <div className="w-full h-full pt-[50%] md:pt-[10%] border-4 border-dashed border-accent bg-black/30 flex justify-center text-2xl font-semibold">
            Drop files to upload
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
