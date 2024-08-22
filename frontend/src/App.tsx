import { useState } from "react"
import VideoCompressorUI from "./components/DragDrop"
import { DownloadIcon, Trash2Icon } from "lucide-react"
import { OpenFilePath } from "../wailsjs/go/main/App"

export interface FileInfo {
  fileName: string
  fileSize: number
  filePath?: string
  compressionRatio?: number
  compressedSize?: number
}

function formatBytes(bytes: number, decimals: number = 1) {
  if (!+bytes) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


function App() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null)

  return (
    <>
      <VideoCompressorUI
        setIsProcessing={setIsProcessing}
        setFileInfo={setFileInfo}
        // @ts-ignore
        fileInfo={fileInfo}
      />

      {isProcessing && (
        <div className="absolute top-0 left-0 
        w-full h-full bg-[#0A0A0A] flex flex-col items-center justify-center  gap-4
        ">

          <div className=" bg-[#151515] p-10 w-1/2 h-1/5 rounded-2xl flex  items-center justify-center gap-4">
            <div>
              <p className="uppercase text-xs text-gray-400">Original</p>
              <h1 className="text-white text-3xl font-bold mb-2">{formatBytes(fileInfo?.fileSize!)}</h1>
            </div>
            <button className="border border-gray-400 text-black py-2 px-4 rounded-md font-medium hover:bg-[##191919]"
              onClick={() => {
                setIsProcessing(false)
              }}>
              <Trash2Icon className="w-5 h-5 text-white" />
            </button>
          </div >

          <div className=" bg-[#151515] p-10 w-1/2 h-1/5 rounded-2xl flex  items-center justify-center gap-4">
            <div>
              <p className="uppercase text-xs text-gray-400">Compressed</p>
              <h1 className="text-white text-3xl font-bold mb-2">{formatBytes(fileInfo?.compressedSize!)}</h1>
            </div>


            <div className="flex flex-col items-center justify-center gap-4">
              <button className="border border-gray-400 text-black py-2 px-4 rounded-md font-medium hover:bg-[##191919]"
                onClick={async () => {
                  await OpenFilePath(fileInfo?.filePath!)
                }}
              >
                <DownloadIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {
              fileInfo?.compressionRatio !== 0 ? (
                <div
                  className="absolute top-[21.2rem] right-[7.2rem]"
                  style={{ willChange: "auto", opacity: 1, transform: "translateY(0%)" }}
                >
                  <div className="bg-lime-300 mt-1 text-black font-medium rounded-sm text-sm w-max px-2 py-1 flex items-center justify-center">
                    {fileInfo?.compressionRatio?.toFixed(0)}% Smaller
                  </div>
                </div>
              ) : null
            }

          </div>
        </div >
      )
      }

      <footer className="bg-[#0A0A0A] text-white py-2 px-4 text-sm fixed bottom-0 left-0 right-0">
        <div className="flex items-center justify-center space-x-1">
          <span>powered by</span>

          <div className="border-b border-foreground/30 inline-flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="1em" height="1em" fill="none">
              <path stroke="#008700" strokeLinecap="round" strokeLinejoin="round" strokeWidth="18"
                d="M9 9h40L9 49v40L89 9h40L9 129h40l80-80v40l-40 40h40">
              </path>
            </svg>
            <div className='hover:text-[#008700] cursor-pointer'>FFmpeg</div>
          </div>
        </div>
      </footer>

    </>
  )
}

export default App
