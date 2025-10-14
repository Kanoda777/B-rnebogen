import React, { useState, useEffect } from "react";
import { Child } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, User, Trash2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SafePageWrapper from "../components/SafePageWrapper";

import CreateChildForm from "../components/children/CreateChildForm";

export default function Profile() {
  const [children, setChildren] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    setIsLoading(true);
    const childrenData = await Child.list("-created_date");
    setChildren(childrenData);
    setIsLoading(false);
  };

  const handleChildCreated = () => {
    setShowCreateForm(false);
    loadChildren();
  };

  const deleteChild = async (childId) => {
    if (window.confirm("Er du sikker på, at du vil slette denne barneprofil?")) {
      await Child.delete(childId);
      loadChildren();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Indlæser din profil...</p>
        </div>
      </div>
    );
  }

  return (
    <SafePageWrapper requiresProfile={false} pageName="Profile">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Min Profil
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                Administrer børneprofiler og opret personaliserede historier
              </p>
              
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Tilføj nyt barn
              </Button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showCreateForm && (
              <CreateChildForm
                onChildCreated={handleChildCreated}
                onCancel={() => setShowCreateForm(false)}
              />
            )}
          </AnimatePresence>

          {children.length === 0 && !showCreateForm ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">Ingen børneprofiler endnu</h3>
              <p className="text-gray-500 mb-6">Opret den første profil for at komme i gang med historier</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {children.map((child, index) => (
                <motion.div
                  key={child.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-none magic-shadow bg-white/70 backdrop-blur-sm">
                    <CardContent className="p-0">
                      {/* Avatar Section */}
                      <div className="relative h-32" style={{ backgroundColor: child.avatar_color || '#FF6B9D' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-black/10"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center mb-2">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-1">{child.name}</h3>
                          <p className="text-white/90 text-sm">{child.age} år gammel</p>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6">
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Interesser:</p>
                          <div className="flex flex-wrap gap-2">
                            {child.interests?.slice(0, 3).map((interest, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                              >
                                {interest}
                              </span>
                            ))}
                            {child.interests?.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                                +{child.interests.length - 3} mere
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={createPageUrl(`CreateStory?childId=${child.id}`)}
                            className="flex-1"
                          >
                            <Button className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl transition-all duration-300">
                              <BookOpen className="w-4 h-4 mr-2" />
                              Ny historie
                            </Button>
                          </Link>
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteChild(child.id)}
                            className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SafePageWrapper>
  );
}