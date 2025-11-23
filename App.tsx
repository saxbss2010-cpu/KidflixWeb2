
import React, { useContext } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from './contexts/AppContext';
import Header from './components/Header';
import Feed from './components/Feed';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Profile from './components/Profile';
import Toast from './components/Toast';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
// FIX: Import the Messages component to add it to the router.
import Messages from './components/Messages';

const App: React.FC = () => {
  const { currentUser } = useContext(AppContext);

  return (
    <HashRouter>
      <div className="min-h-screen bg-primary">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <Routes>
            <Route path="/login" element={!currentUser ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!currentUser ? <SignUp /> : <Navigate to="/" />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/notifications" element={currentUser ? <Notifications /> : <Navigate to="/login" />} />
            <Route path="/settings" element={currentUser ? <Settings /> : <Navigate to="/login" />} />
            {/* FIX: Add routes for the messaging feature. */}
            <Route path="/messages" element={currentUser ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/messages/:username" element={currentUser ? <Messages /> : <Navigate to="/login" />} />
            <Route path="/" element={<Feed />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Toast/>
      </div>
    </HashRouter>
  );
};

export default App;
