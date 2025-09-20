
import React, { useState, useEffect } from "react";
import { Child } from "@/api/entities";
import { Story } from "@/api/entities";
import { InvokeLLM, GenerateImage } from "@/api/integrations";
import { useProfile } from "../components/providers/ProfileProvider";
import SafePageWrapper from "../components/SafePageWrapper";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Wand2, Sparkles, BookOpen, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STORY_THEMES = [
  "Eventyr og feer", "Dyr og natur", "Rumfart og planeter", "Pirater og skattejagt",
  "Prinsesser og slotte", "Dinosaurer", "Superhelte", "Undervandseventyr",
  "Skovens mysterier", "Drage-eventyr", "Roboter og fremtiden", "Magiske venner"
];

export default function CreateStory() {
  const { activeChild, selectActiveChild } = useProfile();
  const [children, setChildren] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("");
  const [customTheme, setCustomTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStory, setGeneratedStory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStory, setEditedStory] = useState(null);

  // Parse URL parameters to check if a specific child was selected
  useEffect(() => {
    const loadChildren = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const childId = urlParams.get('childId');
      
      const childrenData = await Child.list("-created_date");
      setChildren(childrenData);
      
      if (childId && childrenData.find(child => child.id === childId)) {
        selectActiveChild(childId);
      }
    };
    
    loadChildren();
  }, [selectActiveChild]);

  const generateStoryWithAPI = async (childData, theme) => {
    // Mock API call structure - replace this with your real API integration
    const storyPrompt = `
      Create a magical, age-appropriate story for ${childData.name}, who is ${childData.age} years old.
      Theme: ${theme}
      Child's interests: ${childData.interests?.join(', ') || 'general adventures'}
      Reading level: ${childData.reading_level}
      
      Please create a story with:
      - A captivating title that includes the child's name
      - 3-4 short chapters, each with a descriptive title
      - Child-friendly language appropriate for age ${childData.age}
      - Interactive elements that engage the reader
      - A positive, encouraging message
      
      Format the response as JSON with this structure:
      {
        "title": "Story title with child's name",
        "description": "Brief story description",
        "chapters": [
          {
            "chapter_number": 1,
            "title": "Chapter title",
            "content": "Chapter content with multiple paragraphs",
            "illustration_prompt": "Detailed description for illustration"
          }
        ]
      }
    `;

    try {
      const response = await InvokeLLM({
        prompt: storyPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            chapters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  chapter_number: { type: "number" },
                  title: { type: "string" },
                  content: { type: "string" },
                  illustration_prompt: { type: "string" }
                }
              }
            }
          }
        }
      });

      return response;
    } catch (error) {
      console.error("Error generating story:", error);
      throw new Error("Kunne ikke generere historie. Prøv igen.");
    }
  };

  const generateIllustrations = async (chapters) => {
    const chaptersWithIllustrations = [];
    
    for (const chapter of chapters) {
      try {
        const illustration = await GenerateImage({
          prompt: `Children's book illustration: ${chapter.illustration_prompt}. Colorful, friendly, and appropriate for young children. Digital art style.`
        });
        
        chaptersWithIllustrations.push({
          ...chapter,
          illustration_url: illustration.url
        });
      } catch (error) {
        console.error("Error generating illustration for chapter:", chapter.chapter_number);
        chaptersWithIllustrations.push(chapter); // Still include chapter even if illustration failed
      }
    }
    
    return chaptersWithIllustrations;
  };

  const handleGenerateStory = async () => {
    if (!activeChild) {
      alert("Vælg venligst et barn først");
      return;
    }

    const theme = customTheme.trim() || selectedTheme;
    if (!theme) {
      alert("Vælg eller indtast et tema");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate story content
      const storyData = await generateStoryWithAPI(activeChild, theme);
      
      // Generate cover image
      const coverImage = await GenerateImage({
        prompt: `Children's book cover for "${storyData.title}". Colorful, magical, and inviting. Shows the main character as a ${activeChild.age}-year-old child. Digital art style.`
      });

      // Generate illustrations for chapters
      const chaptersWithIllustrations = await generateIllustrations(storyData.chapters);

      const completeStory = {
        title: storyData.title,
        description: storyData.description,
        child_name: activeChild.name,
        theme: theme,
        chapters: chaptersWithIllustrations,
        cover_image_url: coverImage.url,
        current_chapter: 1,
        completed: false
      };
      
      setGeneratedStory(completeStory);

    } catch (error) {
      console.error("Error in story generation:", error);
      alert("Der opstod en fejl ved generering af historien. Prøv igen.");
    }

    setIsGenerating(false);
  };

  const handleEditStory = () => {
    setEditedStory({
      title: generatedStory.title,
      description: generatedStory.description,
      content: generatedStory.chapters.map(chapter => 
        `**${chapter.title}**\n\n${chapter.content}`
      ).join('\n\n---\n\n'),
      author_name: activeChild?.name || "",
      child_name: activeChild?.name || "",
      theme: selectedTheme || customTheme
    });
    setIsEditing(true);
  };

  const handleSaveStory = async () => {
    if (!editedStory.title.trim() || !editedStory.content.trim()) {
      alert("Titel og indhold er påkrævet");
      return;
    }

    try {
      // Convert edited content back to chapters format
      const contentSections = editedStory.content.split('\n\n---\n\n');
      const chapters = contentSections.map((section, index) => {
        const lines = section.split('\n');
        const titleMatch = lines[0]?.match(/^\*\*(.*?)\*\*$/);
        const title = titleMatch ? titleMatch[1] : `Kapitel ${index + 1}`; // Default title if not found
        const content = lines.slice(2).join('\n'); // Skip title and empty line
        
        return {
          chapter_number: index + 1,
          title: title.trim(),
          content: content.trim(),
          illustration_prompt: `Children's book illustration for: ${title.trim()}`,
          illustration_url: generatedStory.chapters[index]?.illustration_url || "" // Preserve existing illustration URL
        };
      });

      const storyToSave = {
        title: editedStory.title.trim(),
        description: editedStory.description.trim(),
        child_name: editedStory.child_name.trim(),
        theme: editedStory.theme.trim(),
        chapters: chapters,
        cover_image_url: generatedStory.cover_image_url,
        current_chapter: 1,
        completed: false
      };

      await Story.create(storyToSave);
      alert("Historie gemt i dit bibliotek!");
      
      // Reset to initial state
      setGeneratedStory(null);
      setIsEditing(false);
      setEditedStory(null);
      setSelectedTheme("");
      setCustomTheme("");
      
    } catch (error) {
      console.error("Error saving story:", error);
      alert("Kunne ikke gemme historie. Prøv igen.");
    }
  };

  if (isEditing && editedStory) {
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
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-gray-300 text-gray-600"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tilbage
              </Button>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm magic-shadow border-none">
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
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
                    <Label htmlFor="author">Forfatter</Label>
                    <Input
                      id="author"
                      value={editedStory.author_name}
                      onChange={(e) => setEditedStory({...editedStory, author_name: e.target.value})}
                      placeholder="F.eks. Emma (7 år)"
                    />
                  </div>
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
                    placeholder={`**Kapitel Titel**

Kapitel indhold her...

---

**Næste Kapitel**

Mere indhold...`}
                  />
                  <p className="text-sm text-gray-500">
                    Tip: Brug <b>fed tekst</b> til kapiteloverskrifter og <code>---</code> på en tom linje til at adskille kapitler.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Annuller
                  </Button>
                  <Button
                    onClick={handleSaveStory}
                    className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Gem Historie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (generatedStory) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-3 bg-green-100 backdrop-blur-sm px-6 py-3 rounded-full mb-6 magic-shadow">
              <Sparkles className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-green-700">Historie klar!</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              {generatedStory.title}
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              En personlig historie til {activeChild.name}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                onClick={handleEditStory}
                variant="outline"
                className="w-full sm:w-auto border-2 border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold rounded-2xl"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Rediger historie
              </Button>
              <Button
                onClick={() => {
                  setEditedStory({
                    title: generatedStory.title,
                    description: generatedStory.description,
                    content: generatedStory.chapters.map(chapter => 
                      `**${chapter.title}**\n\n${chapter.content}`
                    ).join('\n\n---\n\n'),
                    author_name: activeChild?.name || "",
                    child_name: activeChild?.name || "",
                    theme: selectedTheme || customTheme
                  });
                  handleSaveStory();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Gem som den er
              </Button>
            </div>
          </motion.div>

          {/* Story Preview */}
          <Card className="bg-white/80 backdrop-blur-sm magic-shadow border-none">
            <CardContent className="p-8">
              <img 
                src={generatedStory.cover_image_url} 
                alt={generatedStory.title}
                className="w-full max-w-md mx-auto rounded-2xl shadow-lg mb-6"
              />
              <p className="text-gray-700 text-lg leading-relaxed text-center mb-8">
                {generatedStory.description}
              </p>
              
              {/* Chapter Previews */}
              <div className="space-y-6">
                {generatedStory.chapters.slice(0, 2).map((chapter, index) => (
                  <div key={index} className="border-l-4 border-purple-200 pl-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{chapter.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {chapter.content.substring(0, 200)}...
                    </p>
                  </div>
                ))}
                {generatedStory.chapters.length > 2 && (
                  <p className="text-center text-gray-500 italic">
                    Og {generatedStory.chapters.length - 2} kapitler mere...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <SafePageWrapper requiresProfile={true} pageName="CreateStory">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <Link
              to={createPageUrl("Children")}
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tilbage til børneprofiler</span>
            </Link>

            <div className="inline-flex items-center gap-3 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full mb-6 magic-shadow">
              <Wand2 className="w-6 h-6 text-purple-500" />
              <span className="font-semibold text-gray-700">Skab en magisk historie</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Personlig Historieskaber
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vælg et barn og et tema, så skaber vores AI en unik historie med dit barns navn og interesser
            </p>
          </motion.div>

          {/* Story Generator Form */}
          <Card className="bg-white/80 backdrop-blur-sm magic-shadow border-none">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                Historieskaber
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Child Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Vælg barn</Label>
                {children.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-yellow-700">
                      Du har ikke oprettet nogen børneprofiler endnu.{" "}
                      <Link to={createPageUrl("Children")} className="underline font-medium">
                        Opret en profil først
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {children.map((child) => (
                      <Card
                        key={child.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          activeChild?.id === child.id
                            ? "ring-2 ring-purple-500 bg-purple-50"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => selectActiveChild(child.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                              style={{ backgroundColor: child.avatar_color }}
                            >
                              <User className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-800">{child.name}</h3>
                              <p className="text-sm text-gray-600">{child.age} år • {child.reading_level}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold">Vælg tema</Label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="rounded-xl border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Vælg et spændende tema..." />
                  </SelectTrigger>
                  <SelectContent>
                    {STORY_THEMES.map((theme) => (
                      <SelectItem key={theme} value={theme}>
                        {theme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="text-center text-gray-500">eller</div>
                
                <div className="space-y-2">
                  <Label>Beskriv dit eget tema</Label>
                  <Textarea
                    value={customTheme}
                    onChange={(e) => setCustomTheme(e.target.value)}
                    placeholder="F.eks. 'En historie om en hund der kan flyve og hjælper andre dyr'"
                    className="rounded-xl border-purple-200 focus:border-purple-400 h-24"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="text-center pt-4">
                <Button
                  onClick={handleGenerateStory}
                  disabled={!activeChild || (!selectedTheme && !customTheme.trim()) || isGenerating}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin w-6 h-6 border-3 border-white/30 border-t-white rounded-full" />
                      <span>Skaber historie...</span>
                    </div>
                  ) : (
                    <>
                      <Wand2 className="w-6 h-6 mr-3" />
                      Skab magisk historie
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SafePageWrapper>
  );
}
