"use client";

import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full py-8 bg-black border-t border-[var(--panel-border)] text-white shadow-[0_-5px_20px_-10px_rgba(0,0,0,0.5)] z-10 relative">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between px-6 gap-6">
                <div className="flex flex-col items-center sm:items-start opacity-70 hover:opacity-100 transition-opacity">
                    <p className="text-sm tracking-widest uppercase font-medium text-gray-400 mb-1">
                        Página desarrollada por
                    </p>
                </div>

                <a
                    href="https://ubik-app.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-3 group relative"
                >
                    <div className="relative w-32 h-14 sm:w-40 sm:h-16 transform transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        <Image
                            src="/nosotros.png"
                            alt="Ubik Logo"
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 128px, 160px"
                        />
                    </div>
                </a>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-transparent via-gray-600 to-transparent mt-8 opacity-20" />
        </footer>
    );
}
