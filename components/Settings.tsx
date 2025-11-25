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

  const InputField = ({ label, id, type, value, onChange, placeholder }: any) => (
      <div className="space-y-1">
          <label htmlFor={id} className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">{label}</label>
          <input 
              id={id} 
              type={type} 
              value={value} 
              onChange={onChange} 
              required 
              placeholder={placeholder}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
          />
      </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      <div className="bg-glass-gradient backdrop-blur-xl rounded-3xl border border-glass-border overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white">Profile Picture</h2>
        </div>
        <form onSubmit={handleAvatarUpdate} className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-accent to-purple-600 rounded-full opacity-50 blur group-hover:opacity-75 transition duration-500"></div>
                <img src={newAvatarPreview || currentUser.avatar} alt="Avatar preview" className="relative w-32 h-32 rounded-full object-cover border-4 border-black"/>
            </div>
            <div className="flex-1 flex flex-col items-center md:items-start gap-4">
                <p className="text-gray-400 text-sm text-center md:text-left">Upload a new photo to change your profile appearance.</p>
                <div className="flex gap-4">
                    <label htmlFor="avatar-upload" className="cursor-pointer py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/5 transition-colors">
                        Choose Image
                    </label>
                    <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                    {newAvatarPreview && (
                        <>
                            <button type="submit" className="py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-colors">
                                Save
                            </button>
                            <button type="button" onClick={() => setNewAvatarPreview(null)} className="py-2.5 px-4 rounded-xl text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </div>
        </form>
      </div>

      <div className="bg-glass-gradient backdrop-blur-xl rounded-3xl border border-glass-border overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white">Account Details</h2>
        </div>
        <form onSubmit={handleProfileUpdate} className="p-8 space-y-6">
          <InputField label="Username" id="username" type="text" value={username} onChange={(e: any) => setUsername(e.target.value)} />
          <InputField label="Email" id="email" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
          <div className="pt-2 text-right">
             <button type="submit" className="py-3 px-8 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all transform hover:scale-105">Save Changes</button>
          </div>
        </form>
      </div>

      <div className="bg-glass-gradient backdrop-blur-xl rounded-3xl border border-glass-border overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-xl font-bold text-white">Security</h2>
        </div>
        <form onSubmit={handlePasswordUpdate} className="p-8 space-y-6">
          <InputField label="Current Password" id="currentPassword" type="password" value={currentPassword} onChange={(e: any) => setCurrentPassword(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <InputField label="New Password" id="newPassword" type="password" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
             <InputField label="Confirm New Password" id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e: any) => setConfirmNewPassword(e.target.value)} />
          </div>
          <div className="pt-2 text-right">
             <button type="submit" className="py-3 px-8 rounded-xl text-sm font-bold text-white bg-accent hover:bg-accent-hover shadow-lg shadow-accent/20 transition-all transform hover:scale-105">Update Password</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;