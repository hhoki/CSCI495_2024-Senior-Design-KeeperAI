import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HorizontalNavbar from './components/HorizontalNavbar';
import Home from './pages/Home';
import Library from './pages/Library';
import Analytics from './pages/Analytics';
import Recommendations from './pages/Recommendations';
import Settings from './pages/Settings';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <HorizontalNavbar />
      <div className="main-content">
        <Routes>
          {/* Default route redirects to library */}
          <Route path="/" element={<Home />} />
          
          {/* Main routes */}
          <Route path="/library" element={<Library />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/settings" element={<Settings />} />
          

          {/* 404 route - must be last */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;