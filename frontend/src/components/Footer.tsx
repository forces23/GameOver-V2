import React from 'react'
import { FaGithub, FaRegCopyright } from "react-icons/fa";

export default function Footer() {
    return (
        <div className='h-10 flex gap-4 items-center'>
            <a href="https://github.com/forces23" target='_blank'>
                <span className="text-3xl"><FaGithub /></span>
            </a>
            {/* <span className="text-2xl flex items-center gap-2"><FaRegCopyright />2026</span> */}
        </div>
    )
}
