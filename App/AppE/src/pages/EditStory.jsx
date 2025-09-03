import React, { useState, useEffect } from "react";
import { Story } from "@/api/entities";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EditStory() {
    const [story, setStory] = useState(null);
    const [editedStory, setEditedStory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

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
                    setEditedStory({
                        title: foundStory.title,
                        description: foundStory.description,
                        content: foundStory.chapters.map(chapter => 
                            `**${chapter.title}**\n\n${chapter.content}`
                        ).join('\n\n---\n\n'),
                        child_name: foundStory.child_name,
                        theme: foundStory.theme
                    });
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

    const handleSave = async () => {
        if (!editedStory.title.trim() || !editedStory.content.trim()) {
            alert("Titel og indhold er påkrævet");
            return;
        }

        setIsSaving(true);
        try {
            // Convert edited content back to chapters format
            const contentSections = editedStory.content.split('\n\n---\n\n');
            const chapters = contentSections.map((section, index) => {
                const lines = section.split('\n').filter(line => line.trim());
                const title = lines[0] ? lines[0].replace(/^\*\*|\*\*$/g, '') : `Kapitel ${index + 1}`;
                const content = lines.slice(1).join('\n');
                
                return {
                    chapter_number: index + 1,
                    title: title,
                    content: content,
                    illustration_prompt: story.chapters[index]?.illustration_prompt || `Children's book illustration for: ${title}`,
                    illustration_url: story.chapters[index]?.illustration_url || ""
                };
            });

            const updatedStory = {
                ...story,
                title: editedStory.title,
                description: editedStory.description,
                chapters: chapters
            };

            await Story.update(story.id, updatedStory);
            alert("Historie opdateret!");
            window.location.href = createPageUrl("Library");
            
        } catch (error) {
            console.error("Error saving story:", error);
            alert("Kunne ikke gemme historie. Prøv igen.");
        }
        setIsSaving(false);
    };

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

    if (!story || !editedStory) {
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
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Rediger Historie</h1>
                        <Link to={createPageUrl("Library")}>
                            <Button
                                variant="outline"
                                className="border-gray-300 text-gray-600"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Tilbage til bibliotek
                            </Button>
                        </Link>
                    </div>

                    <Card className="bg-white/80 backdrop-blur-sm magic-shadow border-none">
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Titel</Label>
                                <Input
                                    id="title"
                                    value={editedStory.title}
                                    onChange={(e) => setEditedStory({...editedStory, title: e.target.value})}
                                    className="text-lg font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Beskrivelse</Label>
                                <Textarea
                                    id="description"
                                    value={editedStory.description}
                                    onChange={(e) => setEditedStory({...editedStory, description: e.target.value})}
                                    className="h-20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Historiens indhold</Label>
                                <Textarea
                                    id="content"
                                    value={editedStory.content}
                                    onChange={(e) => setEditedStory({...editedStory, content: e.target.value})}
                                    className="h-96 font-mono text-sm"
                                    placeholder="**Kapitel Titel**

Kapitel indhold her...

---

**Næste Kapitel**

Mere indhold..."
                                />
                                <p className="text-sm text-gray-500">
                                    Tip: Brug **fed tekst** til kapitler og --- til at adskille kapitler
                                </p>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Link to={createPageUrl("Library")} className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        Annuller
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white"
                                >
                                    {isSaving ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                                            Gemmer...
                                        </div>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Gem Ændringer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}