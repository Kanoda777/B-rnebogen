import React, { useState, useEffect } from "react";
import { Story } from "@/api/entities";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function ReadStory() {
  const [story, setStory] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStory = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const storyId = urlParams.get('id');
      
      if (!storyId) {
        alert("Ingen historie ID fundet");
        return;
      }

      setIsLoading(true);
      try {
        const stories = await Story.list();
        const foundStory = stories.find(s => s.id === storyId);
        
        if (foundStory) {
          setStory(foundStory);
          setCurrentChapter(foundStory.current_chapter || 1);
        } else {
          alert("Historie ikke fundet");
        }
      } catch (error) {
        console.error("Error loading story:", error);
        alert("Kunne ikke indlæse historie");
      }
      setIsLoading(false);
    };

    loadStory();
  }, []);

  const updateProgress = async (chapterNumber) => {
    if (story && chapterNumber !== story.current_chapter) {
      try {
        const isCompleted = chapterNumber >= story.chapters.length;
        await Story.update(story.id, { 
          current_chapter: chapterNumber,
          completed: isCompleted
        });
        setStory(prev => ({ 
          ...prev, 
          current_chapter: chapterNumber,
          completed: isCompleted
        }));
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const goToChapter = (chapterNumber) => {
    if (chapterNumber >= 1 && chapterNumber <= story.chapters.length) {
      setCurrentChapter(chapterNumber);
      updateProgress(chapterNumber);
    }
  };

  const currentChapterData = story?.chapters?.find(c => c.chapter_number === currentChapter);
  const progress = story ? (currentChapter / story.chapters.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser historie...</p>
        </div>
      </div>
    );
  }

  if (!story || !currentChapterData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Historie ikke fundet</h2>
          <Link to={createPageUrl("Library")}>
            <Button variant="outline">Tilbage til bibliotek</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to={createPageUrl("Library")} 
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Tilbage til bibliotek</span>
          </Link>
          
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">{story.title}</h1>
            <p className="text-gray-600">For {story.child_name}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Kapitel {currentChapter} af {story.chapters.length}</span>
            <span>{Math.round(progress)}% færdig</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Chapter Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm magic-shadow border-none mb-8">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
                  {currentChapterData.title}
                </h2>
                
                {currentChapterData.illustration_url && (
                  <div className="text-center mb-8">
                    <img 
                      src={currentChapterData.illustration_url} 
                      alt={currentChapterData.title}
                      className="max-w-full h-auto rounded-2xl shadow-lg mx-auto"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                  {currentChapterData.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-lg">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => goToChapter(currentChapter - 1)}
            disabled={currentChapter <= 1}
            className="rounded-xl px-6 py-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Forrige
          </Button>

          <div className="flex gap-2">
            {story.chapters.map((_, index) => (
              <button
                key={index + 1}
                onClick={() => goToChapter(index + 1)}
                className={`w-10 h-10 rounded-full font-medium transition-colors ${
                  currentChapter === index + 1
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-100'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <Button
            onClick={() => goToChapter(currentChapter + 1)}
            disabled={currentChapter >= story.chapters.length}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 py-3"
          >
            Næste
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Completion Message */}
        {currentChapter >= story.chapters.length && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-12 p-8 bg-green-100 rounded-2xl"
          >
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              🎉 Historie færdig! 🎉
            </h3>
            <p className="text-green-700 mb-6">
              Fantastisk læsning, {story.child_name}! Du har læst hele historien.
            </p>
            <Link to={createPageUrl("Library")}>
              <Button className="bg-green-500 hover:bg-green-600 text-white rounded-xl px-8 py-3">
                <Home className="w-4 h-4 mr-2" />
                Tilbage til bibliotek
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}