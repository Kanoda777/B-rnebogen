import React, { useState, useEffect } from "react";
import { SharedStory } from "@/api/entities";
import { motion } from "framer-motion";
import { Trophy, Feather, User, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StoryOfTheMonth() {
    const [winner, setWinner] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchWinner = async () => {
            setIsLoading(true);
            const featuredStories = await SharedStory.filter({ is_featured: true }, "-created_date", 1);
            setWinner(featuredStories[0] || null);
            setIsLoading(false);
        };
        fetchWinner();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-yellow-200 border-t-yellow-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Henter månedens vinderhistorie...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full mb-6 magic-shadow">
                        <Trophy className="w-8 h-8 text-yellow-500" />
                        <span className="text-xl font-semibold text-gray-700">Månedens Historie</span>
                    </div>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Hver måned stemmer vores fællesskab på deres yndlingshistorie. Vinderen bliver vist her og kan blive tilbudt en trykt udgivelse!
                    </p>
                </motion.div>

                {!winner ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <Trophy className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Ingen vinder valgt endnu</h3>
                        <p className="text-gray-500">Kom snart tilbage for at se, hvilken historie der vinder denne måned!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <Card className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 rounded-3xl p-2 magic-shadow border-amber-200">
                            <div className="relative overflow-hidden rounded-2xl">
                                <img 
                                    src={winner.cover_image_url || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80'}
                                    alt={winner.title}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <Badge variant="secondary" className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 font-bold text-sm py-2 px-4 rounded-full border-none">
                                    <Trophy className="w-4 h-4 mr-2"/> Månedens Vinder
                                </Badge>
                            </div>
                            
                            <CardContent className="p-6 md:p-10">
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{winner.title}</h1>
                                
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-8">
                                    <div className="flex items-center gap-2">
                                        <Feather className="w-5 h-5 text-purple-500" />
                                        <span className="font-medium">Skrevet af {winner.author_name} ({winner.author_age} år)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span>Udgivet med forældres samtykke</span>
                                    </div>
                                </div>
                                
                                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                                    {winner.chapters.map((chapter, index) => (
                                        <div key={index} className="mb-8 last:mb-0">
                                            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-amber-200 pb-2 mb-4">
                                                {chapter.title}
                                            </h2>
                                            {chapter.illustration_url && (
                                                <img 
                                                    src={chapter.illustration_url} 
                                                    alt={`Illustration for ${chapter.title}`}
                                                    className="rounded-xl my-6 w-full max-w-md mx-auto shadow-lg"
                                                />
                                            )}
                                            {/* Splitting content by newline to create paragraphs */}
                                            {chapter.content.split('\n').map((paragraph, pIndex) => (
                                                <p key={pIndex} className="mb-4">{paragraph}</p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}