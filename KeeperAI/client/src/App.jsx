import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HorizontalNavbar from './components/HorizontalNavbar';
import Home from './pages/Home';
import Library from './pages/Library';
import './App.css';

const App = () => {
  return (
    <div className="app-container">
      <HorizontalNavbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;