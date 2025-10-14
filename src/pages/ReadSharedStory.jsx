import React, { useState, useEffect } from "react";
import { SharedStory } from "@/api/entities";
import { Rating } from "@/api/entities";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ThumbsUp, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const RatingStars = ({ storyId, initialRating, onRate, disabled }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(initialRating);

    const handleRate = async (value) => {
        if (disabled) return;
        setCurrentRating(value);
        await onRate(storyId, value);
    };
    
    return (
        <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    className={`w-8 h-8 transition-colors duration-200 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${
                        (hoverRating || currentRating) >= star 
                          ? "text-yellow-400 fill-yellow-400" 
                          : "text-gray-300 hover:text-yellow-300"
                    }`}
                    onMouseEnter={() => !disabled && setHoverRating(star)}
                    onMouseLeave={() => !disabled && setHoverRating(0)}
                    onClick={() => handleRate(star)}
                />
            ))}
        </div>
    );
};

export default function ReadSharedStory() {
    const [story, setStory] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadStoryData = async () => {
            setIsLoading(true);
            const urlParams = new URLSearchParams(window.location.search);
            const storyId = urlParams.get('id');
            
            if (!storyId) {
                alert("Intet historie ID fundet");
                setIsLoading(false);
                return;
            }

            try {
                const user = await User.me();
                setCurrentUser(user);

                const sharedStories = await SharedStory.list();
                const foundStory = sharedStories.find(s => s.id === storyId);

                if (foundStory) {
                    setStory(foundStory);
                    const ratings = await Rating.filter({ shared_story_id: storyId, created_by: user.email });
                    if (ratings.length > 0) {
                        setUserRating(ratings[0].rating_value);
                    }
                } else {
                    alert("Historie ikke fundet");
                }
            } catch (error) {
                console.error("Fejl ved indlæsning af historie:", error);
                alert("Kunne ikke indlæse historie");
            } finally {
                setIsLoading(false);
            }
        };

        loadStoryData();
    }, []);

    const handleRating = async (storyId, value) => {
        if (userRating) return; // Already rated
        await Rating.create({ shared_story_id: storyId, rating_value: value });
        setUserRating(value);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Åbner historiebogen...</p>
                </div>
            </div>
        );
    }

    if (!story) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-700 mb-2">Historie ikke fundet</h2>
                    <Link to={createPageUrl("Community")}>
                        <Button variant="outline">Tilbage til Fællesskab</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="mb-8">
                        <Link to={createPageUrl("Community")} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                            <span>Tilbage til Fællesskab</span>
                        </Link>
                    </div>

                    <Card className="bg-white/90 backdrop-blur-sm magic-shadow border-none mb-8">
                        <div className="relative">
                            <img src={story.cover_image_url} alt={story.title} className="w-full h-64 object-cover rounded-t-2xl" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-4 left-6">
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{story.title}</h1>
                                <Badge variant="secondary" className="bg-white/80 text-gray-800">
                                    <UserIcon className="w-4 h-4 mr-2"/>
                                    Skrevet af {story.author_name}, {story.author_age} år
                                </Badge>
                            </div>
                        </div>

                        <CardContent className="p-8 md:p-12">
                            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                {story.chapters.map((chapter, index) => (
                                    <div key={index} className="mb-10">
                                        <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-purple-200 pb-2 mb-4">
                                            {chapter.title}
                                        </h2>
                                        {chapter.illustration_url && (
                                            <img 
                                                src={chapter.illustration_url} 
                                                alt={`Illustration for ${chapter.title}`}
                                                className="rounded-xl my-6 w-full max-w-md mx-auto shadow-lg"
                                            />
                                        )}
                                        {chapter.content.split('\n').map((paragraph, pIndex) => (
                                            <p key={pIndex} className="mb-4">{paragraph}</p>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/90 backdrop-blur-sm magic-shadow border-none">
                        <CardContent className="p-8 text-center">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">Hvad syntes du om historien?</h3>
                            <p className="text-gray-600 mb-6">
                                {userRating ? "Tak for din bedømmelse!" : "Giv din bedømmelse for at hjælpe andre med at finde gode historier."}
                            </p>
                            <div className="flex justify-center">
                                <RatingStars 
                                    storyId={story.id} 
                                    initialRating={userRating}
                                    onRate={handleRating}
                                    disabled={!!userRating}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}