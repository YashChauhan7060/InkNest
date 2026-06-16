"use client";
import React from "react";
import Link from "next/link";
import { BoxSelect, PanelLeftClose, PanelLeft} from "lucide-react";
import { blogCategories, useAppData } from "../context/AppContext";
import { Input } from "@/components/ui/input";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton , useSidebar} from "@/components/ui/sidebar";
import { SidebarMenuItem } from "./ui/sidebar";

const SideBar = () => {
  const { searchQuery, setSearchQuery, setCategory } = useAppData();
  const { toggleSidebar, state } = useSidebar();
  const isExpanded = state === "expanded";
  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-orange-200! dark:border-orange-900! bg-orange-50! dark:bg-orange-950! transition-colors duration-300"
    >
      <SidebarHeader className="p-4 bg-transparent! mt-2 flex flex-row items-center justify-between">
        
        {/* Your Branding Block */}
        {isExpanded && (
          <Link href={"/blogs"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 overflow-hidden rounded-xl shadow-md border border-orange-200 dark:border-stone-800 bg-orange-500 shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img
                src="/logo.jpeg" 
                alt="InkNest Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-black text-orange-950 dark:text-orange-50">
          InkNest<span className="text-orange-500">.</span>
        </span>
          </Link>
        )}

        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-orange-200/50 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 transition-colors"
        >
          {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Search</SidebarGroupLabel>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Your Desired blog"
          />

          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setCategory("")}>
                <BoxSelect /> <span>All</span>
              </SidebarMenuButton>
              {blogCategories?.map((e, i) => {
                return (
                  <SidebarMenuButton key={i} onClick={() => setCategory(e)}>
                    <BoxSelect /> <span>{e}</span>
                  </SidebarMenuButton>
                );
              })}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;