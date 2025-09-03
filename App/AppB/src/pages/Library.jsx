import React, { useState, useEffect } from "react";
import { Story } from "@/api/entities";
import { SharedStory } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Library as LibraryIcon, BookOpen, Plus, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublishStoryModal from "../components/community/PublishStoryModal";

export default function Library() {
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [storyToPublish, setStoryToPublish] = useState(null);

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        setIsLoading(true);
        const storyData = await Story.list("-created_date");
        setStories(storyData);
        setIsLoading(false);
    };

    const handlePublish = async (story, consentData) => {
        // Here you would create the SharedStory record
        await SharedStory.create({
            original_story_id: story.id,
            author_name: consentData.authorName,
            author_age: story.child_age, // Assuming age is on original story, or get from child profile
            title: story.title,
            description: story.description,
            theme: story.theme,
            chapters: story.chapters,
            cover_image_url: story.cover_image_url,
            consent_given: consentData.consentGiven,
        });

        // Optionally, mark the original story as published
        // await Story.update(story.id, { is_published: true });

        setStoryToPublish(null);
        alert("Historien er blevet udgivet i fællesskabet!");
    };


    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Henter dine gemte historier...</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Mit Bibliotek</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Her er alle de magiske historier, du har skabt. Læs dem igen eller del dem med fællesskabet.
                    </p>
                </motion.div>

                {stories.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center py-16"
                    >
                        <LibraryIcon className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Dit bibliotek er tomt</h3>
                        <p className="text-gray-500 mb-6">Start med at skabe en ny historie for et af dine børn.</p>
                        <Link to={createPageUrl("Children")}>
                            <Button className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl px-6 py-3">
                                <Plus className="w-4 h-4 mr-2" />
                                Skab din første historie
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stories.map((story, index) => (
                            <motion.div
                                key={story.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden magic-shadow border border-gray-100 flex flex-col"
                            >
                                <img src={story.cover_image_url || 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80'} alt={story.title} className="w-full h-48 object-cover" />
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">{story.title}</h3>
                                    <p className="text-sm text-gray-500 mb-2">For {story.child_name}</p>
                                    <p className="text-gray-600 text-sm flex-grow mb-4">{story.description}</p>
                                    <div className="flex flex-col gap-2 mt-auto">
                                        <Link to={createPageUrl(`ReadStory?id=${story.id}`)}>
                                            <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl">
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                Læs Videre
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="outline"
                                            className="w-full rounded-xl border-green-300 text-green-600 hover:bg-green-50"
                                            onClick={() => setStoryToPublish(story)}
                                        >
                                            <UploadCloud className="w-4 h-4 mr-2" />
                                            Udgiv i Fællesskab
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {storyToPublish && (
                <PublishStoryModal
                    story={storyToPublish}
                    onClose={() => setStoryToPublish(null)}
                    onPublish={handlePublish}
                />
            )}
        </div>
    );
}