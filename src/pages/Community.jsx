
import React, { useState, useEffect } from "react";
import { SharedStory } from "@/api/entities";
import { Rating } from "@/api/entities";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { Award, Heart, Sparkles, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryCard from "../components/community/StoryCard";

export default function Community() {
  const [stories, setStories] = useState([]);
  const [ratings, setRatings] = useState({});
  const [userRatings, setUserRatings] = useState({});
  const [featuredStory, setFeaturedStory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("newest");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setIsLoading(true);
    try {
        const user = await User.me();
        setCurrentUser(user);

        const [storyData, ratingData] = await Promise.all([
            SharedStory.filter({ status: "published" }, "-created_date"),
            Rating.list()
        ]);

        // Process all ratings for average scores
        const ratingMap = {};
        ratingData.forEach(r => {
            if (!ratingMap[r.shared_story_id]) {
                ratingMap[r.shared_story_id] = { total: 0, count: 0 };
            }
            ratingMap[r.shared_story_id].total += r.rating_value;
            ratingMap[r.shared_story_id].count += 1;
        });
        setRatings(ratingMap);
        
        // Process user-specific ratings
        const userRatingMap = {};
        if (user) { // Only process user-specific ratings if user is logged in
            ratingData
                .filter(r => r.created_by === user.email)
                .forEach(r => {
                    userRatingMap[r.shared_story_id] = r.rating_value;
                });
        }
        setUserRatings(userRatingMap);

        const storiesWithRatings = storyData.map(story => {
            const ratingInfo = ratingMap[story.id] || { total: 0, count: 0 };
            const average_rating = ratingInfo.count > 0 ? ratingInfo.total / ratingInfo.count : 0;
            return { ...story, average_rating, rating_count: ratingInfo.count };
        });
        
        setStories(storiesWithRatings);
        setFeaturedStory(storiesWithRatings.find(s => s.is_featured) || null);

    } catch (error) {
        console.error("Error loading community data:", error);
        // Handle cases where user is not logged in gracefully
        if (error.message.includes("User not authenticated") || error.statusCode === 401) {
            setCurrentUser(null);
            // Reload data without user-specific context (i.e., just public stories, no specific ratings processed yet)
            try {
                const storyData = await SharedStory.filter({ status: "published" }, "-created_date");
                setStories(storyData.map(s => ({...s, average_rating: 0, rating_count: 0})));
                setRatings({}); // Clear any previous global ratings
                setUserRatings({}); // Ensure user ratings are empty
                setFeaturedStory(storyData.find(s => s.is_featured) || null);
            } catch (storyError) {
                console.error("Error loading public stories after auth failure:", storyError);
            }
        } else {
            // General error, clear stories or show error message
            setStories([]);
            setRatings({});
            setUserRatings({});
            setFeaturedStory(null);
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRating = async (storyId, value) => {
    if (!currentUser) {
        alert("Du skal være logget ind for at bedømme en historie.");
        return;
    }
    if (userRatings[storyId]) return; // Already rated

    try {
        await Rating.create({ shared_story_id: storyId, rating_value: value });
        
        // Optimistically update UI
        setUserRatings(prev => ({ ...prev, [storyId]: value }));
        setRatings(prev => {
            const existing = prev[storyId] || { total: 0, count: 0 };
            return {
                ...prev,
                [storyId]: {
                    total: existing.total + value,
                    count: existing.count + 1,
                }
            };
        });
        // Re-calculate average for the specific story in the stories list
        setStories(prevStories => prevStories.map(story => {
            if (story.id === storyId) {
                const updatedRatingInfo = {
                    total: (ratings[storyId]?.total || 0) + value,
                    count: (ratings[storyId]?.count || 0) + 1
                };
                return {
                    ...story,
                    average_rating: updatedRatingInfo.total / updatedRatingInfo.count,
                    rating_count: updatedRatingInfo.count
                };
            }
            return story;
        }));

    } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Der opstod en fejl ved afsendelse af bedømmelsen. Prøv igen.");
    }
  };

  const getFilteredStories = () => {
    let filteredStories = [...stories].filter(s => !s.is_featured);

    switch (activeFilter) {
      case "newest":
        return filteredStories.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      
      case "trending":
        return filteredStories
          .filter(story => story.rating_count > 0) // Only stories with ratings
          .sort((a, b) => {
            // Sort by average rating first, then by rating count
            if (b.average_rating !== a.average_rating) {
              return b.average_rating - a.average_rating;
            }
            return b.rating_count - a.rating_count;
          });
      
      case "unrated":
        return filteredStories
          .filter(story => story.rating_count === 0)
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      
      default:
        return filteredStories;
    }
  };

  const filteredStories = getFilteredStories();

  const filterButtons = [
    { key: "newest", label: "Nyeste", icon: Clock, color: "blue" },
    { key: "trending", label: "Trendende", icon: TrendingUp, color: "green" },
    { key: "unrated", label: "Ikke bedømt", icon: Star, color: "purple" }
  ];

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
                        userRating={userRatings[featuredStory.id]}
                        onRate={handleRating}
                        isFeatured={true}
                        currentUser={currentUser}
                    />
                </div>
            </div>
          </motion.div>
        )}

        {/* Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filterButtons.map(({ key, label, icon: Icon, color }) => (
            <Button
              key={key}
              onClick={() => setActiveFilter(key)}
              variant={activeFilter === key ? "default" : "outline"}
              className={`rounded-2xl px-6 py-3 font-semibold transition-all duration-300 ${
                activeFilter === key
                  ? `bg-${color}-500 hover:bg-${color}-600 text-white shadow-lg`
                  : `border-${color}-200 text-${color}-600 hover:bg-${color}-50`
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {label}
            </Button>
          ))}
        </motion.div>

        {/* Story Grid */}
        <div>
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeFilter === "newest" && "Nyeste Historier"}
                {activeFilter === "trending" && "Trendende Historier"}
                {activeFilter === "unrated" && "Endnu Ikke Bedømt"}
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredStories.length} historier fundet
              </p>
            </div>
          </div>
          
          {filteredStories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index * 0.1) + 0.6 }}
                >
                  <StoryCard
                    story={story}
                    ratingInfo={ratings[story.id]}
                    userRating={userRatings[story.id]}
                    onRate={handleRating}
                    currentUser={currentUser}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">
                {activeFilter === "trending" && "Ingen trendende historier endnu"}
                {activeFilter === "unrated" && "Alle historier har fået bedømmelser"}
                {activeFilter === "newest" && "Ingen historier fundet"}
              </h3>
              <p className="text-gray-500">
                {activeFilter === "trending" && "Historier skal have bedømmelser for at være trendende"}
                {activeFilter === "unrated" && "Kom tilbage senere for nye historier"}
                {activeFilter === "newest" && "Der er endnu ingen delte historier"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
