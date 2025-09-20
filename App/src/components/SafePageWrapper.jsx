import React, { useEffect, useState } from 'react';
import { useProfile } from './providers/ProfileProvider';
import { Child } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SafePageWrapper({ children, requiresProfile = false, pageName = "" }) {
    const { activeChild, hasCheckedStorage, isLoadingProfile } = useProfile();
    const [childrenExist, setChildrenExist] = useState(null);
    const [isCheckingChildren, setIsCheckingChildren] = useState(false);

    // Check if any children exist when profile is required but none is selected
    useEffect(() => {
        const checkForChildren = async () => {
            if (requiresProfile && hasCheckedStorage && !activeChild && !isLoadingProfile) {
                setIsCheckingChildren(true);
                try {
                    const childrenList = await Child.list();
                    setChildrenExist(childrenList && childrenList.length > 0);
                } catch (error) {
                    console.error('Failed to check for children:', error);
                    setChildrenExist(false);
                }
                setIsCheckingChildren(false);
            }
        };

        checkForChildren();
    }, [requiresProfile, hasCheckedStorage, activeChild, isLoadingProfile]);

    // Show loading while checking storage or profile
    if (!hasCheckedStorage || isLoadingProfile || (requiresProfile && isCheckingChildren)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-purple-500" />
                    <p className="text-gray-600">Indlæser...</p>
                </div>
            </div>
        );
    }

    // If profile is required but no children exist, show creation prompt
    if (requiresProfile && childrenExist === false) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-pink-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Opret først et barn</h2>
                    <p className="text-gray-600 mb-8">
                        Du skal oprette en barneprofil før du kan bruge denne funktion.
                    </p>
                    <Button 
                        onClick={() => window.location.href = createPageUrl('Children')}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-xl"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Opret barneprofil
                    </Button>
                </motion.div>
            </div>
        );
    }

    // If profile is required but none is selected (but children exist), redirect to selection
    if (requiresProfile && childrenExist === true && !activeChild) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto"
                >
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full flex items-center justify-center">
                        <Users className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Vælg et barn</h2>
                    <p className="text-gray-600 mb-8">
                        Du skal vælge hvilket barn du vil skabe historier for.
                    </p>
                    <Button 
                        onClick={() => window.location.href = createPageUrl('Children')}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-3 rounded-xl"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Vælg barn
                    </Button>
                </motion.div>
            </div>
        );
    }

    // All checks passed, render the children
    return children;
}