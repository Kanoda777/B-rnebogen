import React, { createContext, useState, useEffect, useContext } from 'react';
import { Child } from '@/api/entities';

const ProfileContext = createContext(null);

export const useProfile = () => useContext(ProfileContext);

export const ProfileProvider = ({ children }) => {
    const [activeChild, setActiveChild] = useState(null);
    const [activeChildId, setActiveChildId] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('activeChildId');
        }
        return null;
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChildData = async () => {
            if (activeChildId) {
                setIsLoading(true);
                try {
                    // Assuming a get-by-id method exists or filter can be used
                    const children = await Child.filter({ id: activeChildId });
                    if (children.length > 0) {
                        setActiveChild(children[0]);
                    } else {
                        // The ID in localStorage is invalid
                        clearActiveChild();
                    }
                } catch (error) {
                    console.error("Failed to fetch active child profile:", error);
                    clearActiveChild(); // Clear if there's an error
                }
                setIsLoading(false);
            } else {
                setActiveChild(null);
                setIsLoading(false);
            }
        };

        fetchChildData();
    }, [activeChildId]);

    const selectActiveChild = (childId) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('activeChildId', childId);
        }
        setActiveChildId(childId);
    };

    const clearActiveChild = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('activeChildId');
        }
        setActiveChildId(null);
        setActiveChild(null);
    };

    const value = {
        activeChild,
        activeChildId,
        selectActiveChild,
        clearActiveChild,
        isLoadingProfile: isLoading,
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};