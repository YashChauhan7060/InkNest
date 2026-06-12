import React from "react";
import { Feather } from "lucide-react";

const Loading = () => {
  return (
    // 'fixed inset-0' forces this div to stretch to all 4 corners of the screen
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-stone-950/80 backdrop-blur-sm gap-5">
      
      {/* 1. Animated Spinner Ring */}
      <div className="relative flex items-center justify-center w-16 h-16">
        <div className="absolute inset-0 border-4 border-stone-200 dark:border-stone-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        <Feather className="w-6 h-6 text-orange-500 animate-pulse" />
      </div>

      {/* 2. Loading Text */}
      <div className="flex flex-col items-center gap-1">
        <h3 className="text-xl font-black tracking-tight text-stone-900 dark:text-white">
          InkNest<span className="text-orange-500">.</span>
        </h3>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400 animate-pulse">
          Curating your blogs...
        </p>
      </div>

    </div>
  );
};

export default Loading;