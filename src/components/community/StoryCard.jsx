
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const RatingStars = ({ rating = 0, onRate, storyId, disabled, isLoggedIn }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleRate = async (value) => {
    if (disabled) return; // Already disabled if not logged in or already rated
    await onRate(storyId, value);
  };
  
  const stars = (
    <div className={`flex items-center gap-1 ${disabled ? 'opacity-70' : ''}`}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={`w-5 h-5 transition-colors duration-200 ${
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          } ${
            (hoverRating || rating) >= star 
              ? "text-yellow-400 fill-yellow-400" 
              : `text-gray-300 ${!disabled ? 'hover:text-yellow-300' : ''}`
          }`}
          onMouseEnter={() => !disabled && setHoverRating(star)}
          onMouseLeave={() => !disabled && setHoverRating(0)}
          onClick={() => handleRate(star)}
        />
      ))}
    </div>
  );

  if (!isLoggedIn) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {stars}
          </TooltipTrigger>
          <TooltipContent>
            <p>Log ind for at bedømme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return stars;
};

export default function StoryCard({ story, ratingInfo, userRating, onRate, isFeatured = false, currentUser }) {
  const avgRating = ratingInfo && ratingInfo.count > 0 ? (ratingInfo.total / ratingInfo.count) : 0;
  const ratingCount = ratingInfo ? ratingInfo.count : 0;
  
  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.03, transition: { duration: 0.3 } }
  };

  const cardClass = isFeatured
    ? "bg-white/70 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/50"
    : "bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden magic-shadow border border-gray-100";

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={cardClass}
    >
      <div className="relative">
        <img 
          src={story.cover_image_url || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80'} 
          alt={story.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="text-lg font-bold text-white leading-tight">{story.title}</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{story.author_name}, {story.author_age} år</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{avgRating.toFixed(1)} ({ratingCount})</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">
          {story.description}
        </p>

        <div className="flex flex-col gap-3">
           <div className="space-y-1">
                <p className="text-xs text-gray-500">{userRating ? 'Din bedømmelse:' : (currentUser ? 'Bedøm denne historie:' : 'Log ind for at bedømme')}</p>
                <RatingStars 
                    rating={userRating} 
                    onRate={onRate} 
                    storyId={story.id} 
                    disabled={!!userRating || !currentUser}
                    isLoggedIn={!!currentUser}
                />
           </div>
           <Link to={createPageUrl(`ReadSharedStory?id=${story.id}`)} className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl">
                    <Eye className="w-4 h-4 mr-2" />
                    Læs Historie
                </Button>
            </Link>
        </div>
      </div>
    </motion.div>
  );
}
