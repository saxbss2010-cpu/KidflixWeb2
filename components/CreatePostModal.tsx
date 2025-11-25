import React, { useState, useContext, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import Spinner from './Spinner';
import { UploadIcon, XMarkIcon } from './icons';

interface CreatePostModalProps {
  onClose: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ onClose }) => {
  const { createPost, showToast } = useContext(AppContext);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !caption.trim()) {
        showToast('Please add a caption or select a file.', 'error');
        return;
    }
    setIsLoading(true);
    // Simulate upload delay
    setTimeout(() => {
        createPost({
            fileUrl: preview || '',
            fileType: file?.type || '',
            fileName: file?.name || '',
            caption: caption,
        });
        setIsLoading(false);
        onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#1a1a1a] rounded-3xl shadow-2xl w-full max-w-lg relative border border-white/10 overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5">
          <h3 className="text-xl font-bold text-white">Create Post</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {!preview ? (
              <label htmlFor="file-upload" className="relative flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-600 hover:border-accent rounded-2xl p-10 cursor-pointer transition-all bg-black/20 hover:bg-black/40 group">
                <div className="p-4 bg-white/5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <UploadIcon className="h-8 w-8 text-gray-400 group-hover:text-accent" />
                </div>
                <span className="mt-2 block text-sm font-bold text-gray-300 group-hover:text-white">Click to upload media</span>
                <p className="text-xs text-gray-500 mt-1">Images or Videos</p>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            ) : (
              <div className="relative group">
                <div className="mb-4 max-h-80 overflow-hidden flex items-center justify-center rounded-2xl border border-white/5 bg-black">
                    {file?.type.startsWith('image/') && <img src={preview} alt="Preview" className="max-h-80 w-auto object-contain" />}
                    {file?.type.startsWith('video/') && <video src={preview} controls className="max-h-80 w-auto" />}
                    {!file?.type.startsWith('image/') && !file?.type.startsWith('video/') && (
                        <div className="text-center p-8">
                            <p className="font-semibold text-white">{file?.name}</p>
                            <p className="text-sm text-gray-400">Preview not available</p>
                        </div>
                    )}
                </div>
                <button 
                    type="button" 
                    onClick={() => { setFile(null); setPreview(null); }} 
                    className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full hover:bg-red-600 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100"
                >
                  <XMarkIcon className="w-4 h-4"/>
                </button>
              </div>
            )}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              className="mt-6 block w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div className="px-6 py-4 bg-white/5 text-right border-t border-white/5">
            <button
              type="submit"
              disabled={isLoading || (!file && !caption.trim())}
              className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-lg shadow-accent/20 text-sm font-bold rounded-xl text-white bg-accent hover:bg-accent-hover focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Publishing...' : 'Share Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;