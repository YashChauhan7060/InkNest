"use client";
import Link from "next/link";
import React, { useState } from "react";
import { CircleUserRoundIcon, LogIn, Menu, X ,Sun, Moon} from "lucide-react";
import { useTheme } from "next-themes";
import { useAppData } from "../context/AppContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { loading, isAuth } = useAppData();
  const { theme, setTheme } = useTheme();
  return (
    <nav className="bg-orange-100 dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-900 p-4 z-50 transition-colors duration-300">
      
      <div className="container mx-auto flex justify-between items-center">
        <Link href={"/blogs"} className="flex items-center gap-3 group">
           <div className="w-14 h-14 overflow-hidden rounded-xl shadow-md border border-orange-200 dark:border-stone-800 bg-orange-500 shrink-0 group-hover:scale-105 transition-transform duration-300">
            <img
              
              src="/logo.jpeg" 
              alt="InkNest Logo" 
              className="w-full h-full object-cover"
              />
            </div>
            <span className="text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            InkNest<span className="text-orange-500">.</span>
          </span>
          
        </Link>

        <div className="md:hidden flex items-center gap-2">
           <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Button variant={"ghost"} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
        <ul className="hidden md:flex justify-center items-center space-x-8 text-sm font-semibold text-stone-600 dark:text-stone-300">
          <li>
            <Link href={"/blogs"} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-xl font-semibold">
              Home
            </Link>
          </li>
          {isAuth && (
            <li>
              <Link href={"/blog/saved"} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors text-xl font-semibold">
                Saved Blogs
              </Link>
            </li>
          )}
          <li>
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-200 text-stone-500 dark:text-stone-400 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </li>
          {loading ? (
            ""
          ) : (
            <li>
              {isAuth ? (
                <Link href={"/profile"} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors flex items-center gap-2">
                  <CircleUserRoundIcon />
                </Link>
              ) : (
               <Link href={"/login"} className="flex items-center gap-2 bg-stone-900 dark:bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-500 dark:hover:bg-orange-600 transition-colors shadow-sm">
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all border-t border-stone-100 dark:border-stone-800 duration-300 ease-in-out",
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <ul className="flex flex-col items-start space-y-4 px-6 py-4 font-medium text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-950 shadow-inner">
          <li>
            <Link href={"/"} className="block w-full hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              Home
            </Link>
          </li>
          {isAuth && (
            <li>
              <Link href={"/blog/saved"} className="block w-full hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                Saved Blogs
              </Link>
            </li>
          )}
          {loading ? (
            ""
          ) : (
            <li>
              {isAuth ? (
                <Link href={"/profile"} className="block w-full hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
                Saved Blogs
                </Link>
              ) : (
                <Link href={"/login"} className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 transition-colors">
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
    
    </nav>
  );
};

export default Navbar;
