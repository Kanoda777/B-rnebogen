import React, { useState, useEffect } from "react";
import { SharedStory } from "@/api/entities";
import { Rating } from "@/api/entities";
import { motion } from "framer-motion";
import { Award, Heart, Sparkles } from "lucide-react";
import StoryCard from "../components/community/StoryCard";

export default function Community() {
  const [stories, setStories] = useState([]);
  const [ratings, setRatings] = useState({});
  const [featuredStory, setFeaturedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSort, setActiveSort] = useState("newest");

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setIsLoading(true);
    const [storyData, ratingData] = await Promise.all([
      SharedStory.filter({ status: "published" }, "-created_date"),
      Rating.list()
    ]);

    const ratingMap = {};
    ratingData.forEach(r => {
      if (!ratingMap[r.shared_story_id]) {
        ratingMap[r.shared_story_id] = { total: 0, count: 0 };
      }
      ratingMap[r.shared_story_id].total += r.rating_value;
      ratingMap[r.shared_story_id].count += 1;
    });

    setRatings(ratingMap);

    const storiesWithRatings = storyData.map(story => {
      const ratingInfo = ratingMap[story.id] || { total: 0, count: 0 };
      const average_rating = ratingInfo.count > 0 ? ratingInfo.total / ratingInfo.count : 0;
      return { ...story, average_rating, rating_count: ratingInfo.count };
    });
    
    setStories(storiesWithRatings);
    setFeaturedStory(storiesWithRatings.find(s => s.is_featured) || null);
    setIsLoading(false);
  };
  
  const handleRating = async (storyId, value) => {
    // This is a simplified approach. A real app would check if the user has already rated.
    await Rating.create({ shared_story_id: storyId, rating_value: value });
    loadCommunityData(); // Reload to show updated ratings
  };

  const sortedStories = [...stories].sort((a, b) => {
    if (activeSort === "newest") {
      return new Date(b.created_date) - new Date(a.created_date);
    }
    if (activeSort === "top_rated") {
      return b.average_rating - a.average_rating;
    }
    return 0;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Henter magiske historier fra fællesskabet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full mb-6 magic-shadow">
            <Heart className="w-6 h-6 text-green-500" />
            <span className="font-semibold text-gray-700">Fællesskabets Bibliotek</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Udforsk historier fra hele verden
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Læs, bedøm og bliv inspireret af de fantastiske historier, som andre børn har skabt.
          </p>
        </motion.div>

        {/* Featured Story */}
        {featuredStory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="bg-gradient-to-br from-yellow-300 via-amber-300 to-orange-400 rounded-3xl p-6 md:p-8 magic-shadow relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full"></div>
                <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-white/20 rounded-full"></div>
                <div className="relative">
                    <div className="flex items-center gap-3 mb-4 text-amber-800">
                        <Award className="w-8 h-8" />
                        <h2 className="text-2xl md:text-3xl font-bold">Månedens Historie</h2>
                    </div>
                    <StoryCard
                        story={featuredStory}
                        ratingInfo={ratings[featuredStory.id]}
                        onRate={handleRating}
                        isFeatured={true}
                    />
                </div>
            </div>
          </motion.div>
        )}

        {/* Story Grid */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Alle Historier</h2>
            {/* Sorting controls can be added here */}
          </div>
          
          {stories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedStories.filter(s => !s.is_featured).map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index * 0.1) + 0.4 }}
                >
                  <StoryCard
                    story={story}
                    ratingInfo={ratings[story.id]}
                    onRate={handleRating}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">Biblioteket er tomt</h3>
              <p className="text-gray-500">Der er endnu ingen delte historier. Vær den første!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}