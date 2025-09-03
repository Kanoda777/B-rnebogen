
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckSquare, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Child } from "@/api/entities";

export default function PublishStoryModal({ story, onClose, onPublish }) {
    const [authorName, setAuthorName] = useState(story.child_name || "");
    const [consentGiven, setConsentGiven] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [childProfile, setChildProfile] = useState(null);
    const [missingEmail, setMissingEmail] = useState(false);

    useEffect(() => {
        const loadChildProfile = async () => {
            if (story.child_id) {
                try {
                    const child = await Child.filter({ id: story.child_id });
                    if (child.length > 0) {
                        setChildProfile(child[0]);
                        setMissingEmail(!child[0].parent_email);
                    }
                } catch (error) {
                    console.error("Error loading child profile:", error);
                }
            }
        };
        loadChildProfile();
    }, [story.child_id]);

    const handleSubmit = async () => {
        if (!consentGiven || !authorName.trim()) {
            alert("Udfyld venligst forfatternavn og giv samtykke.");
            return;
        }

        if (missingEmail) {
            alert("En forælders email er påkrævet for at udgive historier offentligt. Rediger venligst barnets profil først.");
            return;
        }

        setIsSubmitting(true);
        await onPublish(story, { authorName, consentGiven });
        setIsSubmitting(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-lg magic-shadow relative"
                onClick={(e) => e.stopPropagation()}
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <X className="w-5 h-5" />
                </Button>

                <h2 className="text-2xl font-bold text-gray-800 mb-4">Udgiv historie</h2>
                <p className="text-gray-600 mb-6">
                    Del "{story.title}" med fællesskabet, så andre kan læse og bedømme den.
                </p>

                {missingEmail && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg mb-6">
                        <div className="flex items-start gap-3">
                            <Mail className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-red-800">Email påkrævet</h4>
                                <p className="text-sm text-red-700">
                                    For at udgive historier offentligt skal du tilføje en forælders email til barnets profil. Dette er påkrævet for GDPR-compliance og samtykkeprocessen.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="authorName">Forfatternavn (vises offentligt)</Label>
                        <Input
                            id="authorName"
                            value={authorName}
                            onChange={(e) => setAuthorName(e.target.value)}
                            placeholder="F.eks. Emma E."
                            className="rounded-xl border-purple-200"
                            disabled={missingEmail}
                        />
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                            <Shield className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="font-semibold text-blue-800">GDPR-compliant udgivelse</h4>
                                <p className="text-sm text-blue-700">
                                    Ved at udgive denne historie bekræfter du, at du har ret til at dele den.
                                    Hvis historien vinder, kontakter vi dig på {childProfile?.parent_email || 'den registrerede email'}
                                    for at diskutere trykning.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="consent"
                            checked={consentGiven}
                            onCheckedChange={setConsentGiven}
                            disabled={missingEmail}
                        />
                        <Label htmlFor="consent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Jeg giver samtykke til at dele denne historie offentligt og til kontakt vedrørende eventuelle konkurrencer.
                        </Label>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 rounded-xl"
                    >
                        Annuller
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!consentGiven || !authorName.trim() || isSubmitting || missingEmail}
                        className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl"
                    >
                        {isSubmitting ? "Udgiver..." : "Udgiv nu"}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
