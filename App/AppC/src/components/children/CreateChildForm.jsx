
import React, { useState } from "react";
import { Child } from "@/api/entities";
import { motion } from "framer-motion";
import { X, User, Heart, Palette, BookOpen, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "../providers/ProfileProvider";

const AVATAR_COLORS = [
  "#FF6B9D", "#A855F7", "#3B82F6", "#10B981", "#F59E0B", 
  "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"
];

const COMMON_INTERESTS = [
  "Dyr", "Rumfart", "Prinsesser", "Dinosaurer", "Biler", "Eventyr",
  "Musik", "Sport", "Tegning", "Natur", "Robotter", "Pirater",
  "Feer", "Drager", "Superhelte", "Havet", "Skov", "Kæledyr"
];

export default function CreateChildForm({ onChildCreated, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    interests: [],
    avatar_color: "#FF6B9D",
    reading_level: "beginner",
    parent_email: ""
  });
  const [customInterest, setCustomInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectActiveChild } = useProfile();
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addInterest = (interest) => {
    if (!formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
  };

  const removeInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !formData.interests.includes(customInterest.trim())) {
      addInterest(customInterest.trim());
      setCustomInterest("");
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.age) return;
    
    // Validate email format if provided
    if (formData.parent_email && !isValidEmail(formData.parent_email)) {
      alert("Indtast venligst en gyldig email-adresse");
      return;
    }

    setIsSubmitting(true);
    try {
      const newChild = await Child.create({
        ...formData,
        age: parseInt(formData.age)
      });
      selectActiveChild(newChild.id); // Set the new child as active
      onChildCreated();
    } catch (error) {
      console.error("Error creating child:", error);
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-sm magic-shadow border-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6 text-pink-500" />
              Opret barneprofil
            </CardTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-gray-600">Hjælp os med at personalisere historierne til dit barn</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Barnets navn *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="F.eks. Emma"
                  className="rounded-xl border-purple-200 focus:border-purple-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="age">Alder *</Label>
                <Select value={formData.age.toString()} onValueChange={(value) => handleInputChange("age", value)}>
                  <SelectTrigger className="rounded-xl border-purple-200 focus:border-purple-400">
                    <SelectValue placeholder="Vælg alder" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3,4,5,6,7,8,9,10,11,12].map(age => (
                      <SelectItem key={age} value={age.toString()}>{age} år</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reading Level */}
            <div className="space-y-2">
              <Label htmlFor="reading_level">Læseniveau</Label>
              <Select value={formData.reading_level} onValueChange={(value) => handleInputChange("reading_level", value)}>
                <SelectTrigger className="rounded-xl border-purple-200 focus:border-purple-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Begynder (3-5 år)</SelectItem>
                  <SelectItem value="intermediate">Mellem (6-8 år)</SelectItem>
                  <SelectItem value="advanced">Avanceret (9+ år)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Avatar Color */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Vælg favoritfarve
              </Label>
              <div className="flex flex-wrap gap-3">
                {AVATAR_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleInputChange("avatar_color", color)}
                    className={`w-10 h-10 rounded-full border-4 transition-all duration-200 ${
                      formData.avatar_color === color 
                        ? "border-gray-800 scale-110" 
                        : "border-white hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Hvad kan dit barn lide? (vælg flere)
              </Label>
              
              <div className="flex flex-wrap gap-2">
                {COMMON_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => 
                      formData.interests.includes(interest)
                        ? removeInterest(interest)
                        : addInterest(interest)
                    }
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      formData.interests.includes(interest)
                        ? "bg-purple-500 text-white"
                        : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>

              {/* Custom Interest */}
              <div className="flex gap-2">
                <Input
                  value={customInterest}
                  onChange={(e) => setCustomInterest(e.target.value)}
                  placeholder="Tilføj egen interesse..."
                  className="rounded-xl border-purple-200 focus:border-purple-400"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomInterest())}
                />
                <Button
                  type="button"
                  onClick={addCustomInterest}
                  variant="outline"
                  className="rounded-xl border-purple-200 text-purple-600 hover:bg-purple-50"
                  disabled={!customInterest.trim()}
                >
                  Tilføj
                </Button>
              </div>

              {/* Selected Interests */}
              {formData.interests.length > 0 && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-700 font-medium mb-2">Valgte interesser:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm flex items-center gap-1"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-purple-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Parent Email */}
            <div className="space-y-2 border-t border-gray-200 pt-6">
              <Label htmlFor="parent_email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Forældres email (valgfrit)
              </Label>
              <Input
                id="parent_email"
                type="email"
                value={formData.parent_email}
                onChange={(e) => handleInputChange("parent_email", e.target.value)}
                placeholder="f.eks. mor@email.com"
                className="rounded-xl border-purple-200 focus:border-purple-400"
              />
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Privatliv beskyttet:</strong> Denne email bruges kun til at kontakte dig, hvis dit barns historie vinder månedlige konkurrencer eller kræver samtykke til udgivelse. Den vises aldrig offentligt.
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1 rounded-xl border-gray-300"
              >
                Annuller
              </Button>
              <Button
                type="submit"
                disabled={!formData.name.trim() || !formData.age || isSubmitting}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Opretter...
                  </div>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Opret profil
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
