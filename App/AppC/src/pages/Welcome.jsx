import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { BookOpen, Sparkles, Users, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Welcome() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full mb-8 magic-shadow">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold text-gray-700">Velkommen til magiske historier!</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text story-gradient">Børnebogen</span>
              <br />
              <span className="text-2xl md:text-3xl font-medium text-gray-600">
                Hvor fantasien kommer til live
              </span>
            </h1>
            
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
              Skab personlige, interaktive historier til dit barn med kunstig intelligens. 
              Hver historie er unik og tilpasset dit barns navn, alder og interesser.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to={createPageUrl("Children")}>
                <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Users className="w-5 h-5 mr-2" />
                  Kom i gang
                </Button>
              </Link>
              <Link to={createPageUrl("Library")}>
                <Button variant="outline" className="w-full sm:w-auto border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold rounded-2xl transition-all duration-300">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Se biblioteket
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Hvordan fungerer det?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Med få enkle trin skaber vi en magisk historie til dit barn
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-3xl flex items-center justify-center magic-shadow">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">1. Opret barnets profil</h3>
              <p className="text-gray-600 leading-relaxed">
                Indtast barnets navn, alder og interesser for at personalisere historien
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-3xl flex items-center justify-center magic-shadow">
                <Wand2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">2. Vælg tema</h3>
              <p className="text-gray-600 leading-relaxed">
                Vælg et spændende tema som eventyr, rumfart, dyr eller noget helt andet
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center magic-shadow">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">3. Læs sammen</h3>
              <p className="text-gray-600 leading-relaxed">
                Nyd den unikke, interaktive historie sammen med dit barn
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 magic-shadow"
          >
            <div className="w-16 h-16 mx-auto mb-6 story-gradient rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Klar til at skabe magiske minder?
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Start med at oprette dit barns profil og få den første historie på få minutter
            </p>
            <Link to={createPageUrl("Children")}>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-10 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <Users className="w-5 h-5 mr-2" />
                Opret barneprofil
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}