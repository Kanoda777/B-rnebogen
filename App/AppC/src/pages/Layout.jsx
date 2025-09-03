
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Users, Library, Sparkles, Heart, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { ProfileProvider } from "../components/providers/ProfileProvider";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const isActive = (pageName) => {
    return location.pathname === createPageUrl(pageName);
  };

  return (
    <ProfileProvider>
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&display=swap');
              
              :root {
                --primary-pink: #FF6B9D;
                --primary-purple: #A855F7;
                --primary-blue: #3B82F6;
                --secondary-yellow: #FCD34D;
                --secondary-green: #10B981;
                --text-dark: #1F2937;
                --text-light: #6B7280;
                --bg-light: #FFFFFF;
                --shadow-soft: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              }
              
              * {
                font-family: 'Fredoka', cursive;
              }
              
              .story-gradient {
                background: linear-gradient(135deg, #FF6B9D 0%, #A855F7 50%, #3B82F6 100%);
              }
              
              .magic-shadow {
                box-shadow: var(--shadow-soft);
              }
            `}
          </style>
          
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link to={createPageUrl("Welcome")} className="flex items-center gap-3">
                  <div className="w-10 h-10 story-gradient rounded-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">Børnebogen</h1>
                    <p className="text-xs text-gray-500">Magiske historier for børn</p>
                  </div>
                </Link>
                
                {/* Navigation for larger screens */}
                <nav className="hidden md:flex items-center gap-6">
                  <Link
                    to={createPageUrl("Welcome")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isActive("Welcome")
                        ? "bg-pink-100 text-pink-700"
                        : "text-gray-600 hover:text-pink-600 hover:bg-pink-50"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="font-medium">Hjem</span>
                  </Link>
                  <Link
                    to={createPageUrl("Children")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isActive("Children")
                        ? "bg-purple-100 text-purple-700"
                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span className="font-medium">Børn</span>
                  </Link>
                  <Link
                    to={createPageUrl("Library")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isActive("Library")
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Library className="w-4 h-4" />
                    <span className="font-medium">Bibliotek</span>
                  </Link>
                  <Link
                    to={createPageUrl("Community")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isActive("Community")
                        ? "bg-green-100 text-green-700"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">Fællesskab</span>
                  </Link>
                  <Link
                    to={createPageUrl("StoryOfTheMonth")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                      isActive("StoryOfTheMonth")
                        ? "bg-yellow-100 text-yellow-700"
                        : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">Månedens Historie</span>
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="min-h-[calc(100vh-80px)]">
            {children}
          </main>

          {/* Mobile Navigation */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-100 z-50">
            <div className="flex justify-around py-3">
              <Link
                to={createPageUrl("Welcome")}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive("Welcome")
                    ? "text-pink-600"
                    : "text-gray-500"
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-medium">Hjem</span>
              </Link>
              <Link
                to={createPageUrl("Children")}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive("Children")
                    ? "text-purple-600"
                    : "text-gray-500"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">Børn</span>
              </Link>
              <Link
                to={createPageUrl("Library")}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive("Library")
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                <Library className="w-5 h-5" />
                <span className="text-xs font-medium">Bibliotek</span>
              </Link>
              <Link
                to={createPageUrl("Community")}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive("Community")
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-xs font-medium">Fællesskab</span>
              </Link>
              <Link
                to={createPageUrl("StoryOfTheMonth")}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive("StoryOfTheMonth")
                    ? "text-yellow-600"
                    : "text-gray-500"
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span className="text-xs font-medium">Vinder</span>
              </Link>
            </div>
          </nav>
        </div>
    </ProfileProvider>
  );
}
