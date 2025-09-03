import React from 'react';
import { createPageUrl } from '@/utils';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        
        // If the error is related to null ID API calls, clear localStorage and redirect
        if (error.message && (error.message.includes('null') || error.message.includes('undefined'))) {
            try {
                localStorage.removeItem('activeChildId');
                localStorage.removeItem('user_id');
            } catch (e) {
                console.warn('Failed to clear localStorage:', e);
            }
        }
    }

    handleRestart = () => {
        // Clear any potentially corrupted data
        try {
            localStorage.removeItem('activeChildId');
            localStorage.removeItem('user_id');
        } catch (e) {
            console.warn('Failed to clear localStorage:', e);
        }
        
        // Reset error state
        this.setState({ hasError: false, error: null });
        
        // Navigate to safe page
        window.location.href = createPageUrl('Children');
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
                    <div className="text-center p-8 max-w-md mx-auto">
                        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl">😓</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Noget gik galt</h2>
                        <p className="text-gray-600 mb-4">
                            Der opstod en fejl ved indlæsning af data. Dette kan ske hvis din session er udløbet.
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={this.handleRestart}
                                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                            >
                                Genstart app
                            </button>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Genindlæs siden
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;