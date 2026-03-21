import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './contexts/GameContext';
import CharacterCreation from './pages/CharacterCreation/CharacterCreation';
import Home from './pages/Home/Home';
import StoryMode from './pages/StoryMode/StoryMode';
import FreePlay from './pages/FreePlay/FreePlay';
import Challenge from './pages/Challenge/Challenge';
import Settings from './pages/Settings/Settings';
import './styles/variables.css';

function AppContent() {
  const { state } = useGame();
  const { hasCharacter } = state;

  return (
    <BrowserRouter>
      <Routes>
        {/* Character Creation - only show if no character */}
        <Route 
          path="/create" 
          element={hasCharacter ? <Navigate to="/" replace /> : <CharacterCreation />} 
        />
        
        {/* Home */}
        <Route 
          path="/" 
          element={hasCharacter ? <Home /> : <Navigate to="/create" replace />} 
        />
        
        {/* Story Mode */}
        <Route 
          path="/story" 
          element={hasCharacter ? <StoryMode /> : <Navigate to="/create" replace />} 
        />
        
        {/* Free Play */}
        <Route 
          path="/freeplay" 
          element={hasCharacter ? <FreePlay /> : <Navigate to="/create" replace />} 
        />
        
        {/* Challenge */}
        <Route 
          path="/challenge/:operation" 
          element={hasCharacter ? <Challenge /> : <Navigate to="/create" replace />} 
        />
        
        {/* Settings */}
        <Route 
          path="/settings" 
          element={hasCharacter ? <Settings /> : <Navigate to="/create" replace />} 
        />
        
        {/* Profile (redirects to settings for now) */}
        <Route 
          path="/profile" 
          element={hasCharacter ? <Settings /> : <Navigate to="/create" replace />} 
        />
        
        {/* Catch all - redirect based on hasCharacter */}
        <Route 
          path="*" 
          element={<Navigate to={hasCharacter ? "/" : "/create"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
