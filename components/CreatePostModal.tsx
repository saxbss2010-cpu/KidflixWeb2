
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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[100] p-4">
      <div className="bg-secondary rounded-lg shadow-xl w-full max-w-lg relative border border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-white">Create a new post</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {!preview ? (
              <label htmlFor="file-upload" className="relative block w-full border-2 border-dashed border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-accent-hover focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-hover transition-colors">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                <span className="mt-2 block text-sm font-medium text-accent">Upload a file (Optional)</span>
                <p className="text-xs text-gray-500 mt-1">Any file type and size</p>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            ) : (
              <div>
                <div className="mb-4 max-h-96 overflow-hidden flex items-center justify-center rounded-lg">
                    {file?.type.startsWith('image/') && <img src={preview} alt="Preview" className="max-h-96 w-auto object-contain" />}
                    {file?.type.startsWith('video/') && <video src={preview} controls className="max-h-96 w-auto" />}
                    {!file?.type.startsWith('image/') && !file?.type.startsWith('video/') && (
                        <div className="text-center p-8 bg-gray-800 rounded-lg">
                            <p className="font-semibold text-white">{file?.name}</p>
                            <p className="text-sm text-gray-400">Preview not available</p>
                        </div>
                    )}
                </div>
                <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-accent hover:underline mb-4">
                  Remove file
                </button>
              </div>
            )}
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={4}
              className="mt-4 block w-full bg-gray-800 border-gray-600 rounded-md shadow-sm text-white focus:outline-none focus:ring-accent focus:border-accent"
            />
          </div>
          <div className="px-6 py-4 bg-gray-800/50 text-right rounded-b-lg">
            <button
              type="submit"
              disabled={isLoading || (!file && !caption.trim())}
              className="inline-flex justify-center items-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
