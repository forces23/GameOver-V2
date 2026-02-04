import React from 'react'
import { FaGithub, FaRegCopyright } from "react-icons/fa";


export default function Footer() {
    return (
        <div className='h-10 flex gap-4 items-center'>
            <span className="text-3xl"><FaGithub/></span>
            {/* <span className="text-2xl flex items-center gap-2"><FaRegCopyright />2026</span> */}
        </div>
    )
}
