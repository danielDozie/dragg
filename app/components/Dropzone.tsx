'use client'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Image from 'next/image'
import { IoCloseOutline } from 'react-icons/io5'
import { AiOutlineQuestionCircle } from 'react-icons/ai'
import { BsFileTextFill } from 'react-icons/bs'

export default function Dropzone(): JSX.Element {
    const [showProgress, setShowProgress] = useState<boolean>(false)
    const [maxFileSize] = useState<number>(4194304);
    const [fileSize, setFileSize] = useState<number>(0)
    const [loadPercentage, setLoadPercentage] = useState<number>(0)

    const onDrop = useCallback((acceptedFiles: File[]) => {
        acceptedFiles.forEach((file: Blob) => {
            const reader = new FileReader()
            reader.onerror = () => console.log('file reading has failed')
            reader.onprogress = (evt: ProgressEvent<FileReader>) => {
                //track upload progress via api
                let percentage = Math.floor((evt.loaded * 100) / evt.total);
                setTimeout(() => {
                    setLoadPercentage(percentage)
                }, 500);
            }
            reader.onload = () => {
                // Do whatever you want with the file contents. call api or send to s3 bucket
                const binaryStr = reader.result;
                setFileSize(file.size)
                setShowProgress(true);
            }
            
            reader.readAsArrayBuffer(file)
        })
    }, [])

    const { getRootProps, getInputProps, isDragReject, isDragAccept, acceptedFiles } = useDropzone({
        onDrop, accept: {
            'text/csv': ['.csv']
        },
        maxSize: maxFileSize,
        maxFiles: 5,
    });

    //dropbox section
    function dropboxElements() {
        return (
            <>
                <div className={`p-8 mt-5 border-2 border-dashed rounded-lg ${isDragAccept ? 'border-violet-600 bg-violet-50' : isDragReject ? 'border-red-500 bg-red-50' : ''}`} {...getRootProps()}>
                    {showProgress ? <ProgressRing stroke={6} radius={60} progress={100} percent={loadPercentage} /> :
                        (<>
                            <div className='flex mx-auto justify-center mb-6 bg-violet-200 rounded-full w-[70px] h-[70px]'>
                                <Image style={{ objectFit: "contain" }} src="/upload.png" height="60" width="60" alt="upload" />
                            </div>
                            <input {...getInputProps()} />
                        </>)
                    }
                    <p className='text-xs font-medium text-center text-gray-600'>{isDragAccept ? "Drop file here" : isDragReject ? "File type not allowed" : fileSize > maxFileSize ? isDragReject : "Drag CSV here"}</p>
                    <p className='text-center text-[10px] text-gray-400'>
                        or, click to browse (4 MB max)
                    </p>

                </div>
                <p className='text-center text-[9px] text-gray-400 mt-2'>
                    Some data formats, such as dates, numbers, and coors, may not be recognized.
                    <a href="#" className='underline'>Learn more.</a>
                </p>
            </>
        )
    }

    //File list section. Dragging mutilpe files MAX 5. Drops all invalid files.
    function fileListElements() {
        return acceptedFiles.map((file, index) => (
            <div key={index}>
                {showProgress ? <div className='flex w-full p-2 mt-2 border-2 border-gray-200 rounded-lg'>
                    <BsFileTextFill className='p-1 text-gray-400 border border-gray-200 rounded-md' size={28} />
                    <div className='flex flex-col w-full gap-1 ml-4'>
                        <p className='text-[12px] text-bold text-gray-600'>
                            {/* convert file size to MB with exception to small Byte files */}
                            {file.name} ({file.size < 1024 ? file.size : (file.size / 1024000).toFixed(1)} {file.size < 1024 ? "B" : "MB"})</p>
                        <div className='flex justify-between w-full'>
                            <div className="w-[92%] h-2 bg-gray-200 rounded-full">
                                <div className="relative w-0 h-2 transition-all duration-1000 ease-out rounded-full bg-violet-600" style={{ width: `${loadPercentage}%` }} />
                            </div>
                            <div className='w-[5%] -mt-1 mr-1'>
                                <p className='text-[10px] text-gray-500'>{loadPercentage}%</p>
                            </div>
                        </div>
                    </div>
                </div> : null
                }
            </div>
        ));
    };

    return (
        <>
            <div className='w-4/5 bg-white md:w-2/5 min-h-72 rounded-xl'>
                <div className='p-4'>
                    <div className='flex justify-between'>
                        <div className='flex flex-col'>
                            <h4 className='font-bold text-gray-700'>Import customers</h4>
                            <p className='text-[10px] text-gray-500'>
                                Upload a CSV to import customer data to your CMS.
                            </p>
                        </div>
                        <IoCloseOutline className='p-1 text-gray-600 rounded-md cursor-pointer bg-violet-50' size="24" />
                    </div>
                    
                    {/* Dropbox */}
                    {dropboxElements()}
                    
                    {/* Files and Progress */}
                    {fileListElements()}
                    
                    {/* OR horizontal rule section */}
                    <div className="relative flex items-center py-5">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-2 text-gray-600 text-[10px] font-bold">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    {/* Url input */}
                    <div>
                        <label className="block mb-1 text-[10px] font-bold text-gray-600" htmlFor="url_input">Upload from URL</label>
                        <div className='flex w-full border-2 border-gray-200 rounded-lg'>
                            <div className='px-2 my-auto'>
                                <p className='text-[12px] font-medium text-gray-600'>https://</p>
                            </div>
                            <div className="flex w-full">
                                <input className="flex w-full text-[12px] p-2 text-gray-600 font-medium focus:outline-none border-l-2" id="url_input" type="url" />
                                <button className='text-[10px] text-gray-600 font-medium px-2 border-2 h-6 my-auto mr-1 rounded-md'>Upload</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Custom horizontal rule */}
                <div className="flex-grow my-3 border-t border-gray-200" />

                <div className='flex justify-between px-4 pb-4'>
                    <div className='flex gap-1 pt-2'>
                        <AiOutlineQuestionCircle className='font-medium text-gray-600' />
                        <p className='text-[12px] font-medium text-gray-600'>Support</p>
                    </div>
                    <div className='flex gap-2'>
                        <button className='py-2 px-4 text-[12px] font-medium text-gray-600 border rounded-lg'>
                            Discard
                        </button>
                        <button className='py-2 px-4 text-[12px] font-medium bg-violet-600 text-slate-200 border rounded-lg'>
                            Import
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

//create an svg progress ring
type PROGRESSRING = {
    stroke: number;
    radius: number;
    progress: number;
    percent: number
}

function ProgressRing({stroke, radius, progress, percent}: PROGRESSRING): React.JSX.Element {
    const normalizedRadius = radius - stroke * 2
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - progress / 100 * circumference;

    return (
        <div className="flex items-center self-center justify-center overflow-hidden rounded-full">
            <svg
                height={radius * 2}
                width={radius * 2}
            >
                <circle
                    stroke="#E5E7EB"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    stroke-width={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke="#7C3AED"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset}}
                    stroke-width={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <span className="absolute text-xl font-semibold text-gray-600">{percent}%</span>
        </div>
    )
}