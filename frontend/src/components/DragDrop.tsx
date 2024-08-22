import { FileInfo } from '@/App';
import { Upload } from 'lucide-react';
import { useEffect } from 'react';
import * as runtime from "../../wailsjs/runtime"
import { SelectFile } from "../../wailsjs/go/main/App"

export function FFmpegIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="1em" height="1em" fill="none"><path stroke="#008700" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18" d="M9 9h40L9 49v40L89 9h40L9 129h40l80-80v40l-40 40h40"></path></svg>
  );
}

const VideoCompressorUI = ({
  setIsProcessing,
  setFileInfo,
}: {
  setIsProcessing: (isProcessing: boolean) => void
  setFileInfo: (fileInfo: FileInfo | null) => void
  fileInfo: FileInfo | null
}) => {

  useEffect(() => {
    const handleProgress = (event: { totalSize: number }) => {
      // @ts-ignore
      setFileInfo((prevFileInfo) => {
        if (!prevFileInfo) return null;
        return {
          ...prevFileInfo,
          compressedSize: event.totalSize,
        };
      });
    };

    const handleComplete = () => {
      // @ts-ignore
      setFileInfo((prevFileInfo) => {
        if (!prevFileInfo || prevFileInfo.fileSize === 0) return prevFileInfo;
        return {
          ...prevFileInfo,
          compressionRatio: (prevFileInfo.compressedSize || 0) / prevFileInfo.fileSize * 100,
        };
      });
    };

    runtime.EventsOn("processing-progress", handleProgress);
    runtime.EventsOn("processing-complete", handleComplete);

    return () => {
      runtime.EventsOff("processing-progress");
      runtime.EventsOff("processing-complete");
    };
  }, [setFileInfo]);

  const handleSelectFile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const fileData = await SelectFile();
      const file = JSON.parse(fileData) as { fileName: string; fileSize: number; success: boolean, filePath: string };

      if (!file.success) {
        throw new Error("File selection failed");
      }

      setFileInfo({
        fileName: file.fileName,
        fileSize: file.fileSize,
        filePath: file.filePath,
        compressionRatio: 0,
        compressedSize: 0,
      });
    } catch (error) {
      console.error("Error selecting file:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-screen bg-[#0A0A0A]">
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-[#151515] p-8 rounded-2xl text-center w-80">
          <div className="mb-4">
            <Upload className="mx-auto text-white" size={24} />
          </div>
          <h2 className="text-white text-lg font-semibold mb-2">
            Drag and drop video file to compress
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Compression happens on your device, no data is sent to our servers
          </p>
          <button
            onClick={handleSelectFile}
            className="bg-white text-black py-2 px-4 rounded-md font-medium"
          >
            Select File
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCompressorUI;