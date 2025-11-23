import React, { useContext, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

// Simple hash function for passwords
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

const Settings: React.FC = () => {
  const { currentUser, updateUserProfile, updatePassword, showToast, updateUserAvatar } = useContext(AppContext);
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const [username, setUsername] = useState(currentUser.username);
  const [email, setEmail] = useState(currentUser.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newAvatarPreview, setNewAvatarPreview] = useState<string | null>(null);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() === '' || email.trim() === '') {
        showToast('Username and email cannot be empty.', 'error');
        return;
    }
    const success = updateUserProfile({ username, email });
    if(success) {
        navigate(`/profile/${username}`);
    }
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (simpleHash(currentPassword) !== currentUser.passwordHash) {
        showToast('Incorrect current password.', 'error');
        return;
    }
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters.', 'error');
        return;
    }
    if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match.', 'error');
        return;
    }
    const success = updatePassword(simpleHash(newPassword));
    if (success) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setNewAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        showToast('Please select a valid image file.', 'error');
    }
  };

  const handleAvatarUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAvatarPreview) {
        updateUserAvatar(newAvatarPreview);
        setNewAvatarPreview(null);
        showToast('Profile picture updated successfully!', 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-secondary rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700">Profile Picture</h2>
        <form onSubmit={handleAvatarUpdate} className="p-6 flex flex-col items-center space-y-4">
            <img src={newAvatarPreview || currentUser.avatar} alt="Avatar preview" className="w-32 h-32 rounded-full object-cover border-4 border-gray-600"/>
            <label htmlFor="avatar-upload" className="cursor-pointer py-2 px-4 rounded-md text-sm font-medium text-white bg-gray-600 hover:bg-gray-500 transition-colors">
                Choose Image
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
            {newAvatarPreview && (
                <div className="flex space-x-2">
                    <button type="button" onClick={() => setNewAvatarPreview(null)} className="py-2 px-4 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" className="py-2 px-4 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors">
                        Save Picture
                    </button>
                </div>
            )}
        </form>
      </div>

      <div className="bg-secondary rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700">Edit Profile</h2>
        <form onSubmit={handleProfileUpdate} className="p-6 space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
            <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent"/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-accent focus:border-accent"/>
          </div>
          <div className="text-right">
             <button type="submit" className="py-2 px-4 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="bg-secondary rounded-lg border border-gray-700">
        <h2 className="text-xl font-bold text-white p-4 border-b border-gray-700">Change Password</h2>
        <form onSubmit={handlePasswordUpdate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Current Password</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-accent"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-accent"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
            <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="mt-1 block w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-accent"/>
          </div>
          <div className="text-right">
             <button type="submit" className="py-2 px-4 rounded-md text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;