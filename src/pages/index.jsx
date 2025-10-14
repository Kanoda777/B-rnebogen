import Layout from "./Layout.jsx";

import Welcome from "./Welcome";

import Children from "./Children";

import Community from "./Community";

import Library from "./Library";

import StoryOfTheMonth from "./StoryOfTheMonth";

import CreateStory from "./CreateStory";

import ReadStory from "./ReadStory";

import EditStory from "./EditStory";

import ReadSharedStory from "./ReadSharedStory";

import Profile from "./Profile";

import Forside from "./Forside";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Welcome: Welcome,
    
    Children: Children,
    
    Community: Community,
    
    Library: Library,
    
    StoryOfTheMonth: StoryOfTheMonth,
    
    CreateStory: CreateStory,
    
    ReadStory: ReadStory,
    
    EditStory: EditStory,
    
    ReadSharedStory: ReadSharedStory,
    
    Profile: Profile,
    
    Forside: Forside,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Welcome />} />
                
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Children" element={<Children />} />
                
                <Route path="/Community" element={<Community />} />
                
                <Route path="/Library" element={<Library />} />
                
                <Route path="/StoryOfTheMonth" element={<StoryOfTheMonth />} />
                
                <Route path="/CreateStory" element={<CreateStory />} />
                
                <Route path="/ReadStory" element={<ReadStory />} />
                
                <Route path="/EditStory" element={<EditStory />} />
                
                <Route path="/ReadSharedStory" element={<ReadSharedStory />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Forside" element={<Forside />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}