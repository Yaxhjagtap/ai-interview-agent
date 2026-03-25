import React, { useState } from "react";

export default function ProfileModal({ isOpen, onClose, profile, onUploadResume }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Choose a PDF file");
    setUploading(true);
    try {
      await onUploadResume(file);
      setFile(null);
      onClose();
    } catch (err) {
      alert("Upload failed: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Profile Information</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
            <p className="text-gray-800 font-medium">{profile?.name || "Not provided"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
            <p className="text-gray-800 font-medium">{profile?.email || "Not provided"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Education</label>
            <p className="text-gray-800 font-medium">{profile?.education || "Not provided"}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Resume Status</label>
            <p className="text-gray-800 font-medium">{profile?.resume_path ? "✅ Uploaded" : "❌ Not uploaded"}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 mt-2">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Update Resume</h4>
            <form onSubmit={handleUpload} className="flex flex-col">
              <label className={`block w-full p-4 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 group ${file ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-brand-400'}`}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="hidden"
                />
                <svg className={`w-8 h-8 mx-auto transition-colors mb-2 ${file ? 'text-brand-500' : 'text-gray-300 group-hover:text-brand-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {file ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  )}
                </svg>
                <p className={`text-xs ${file ? 'text-brand-700' : 'text-gray-500'}`}>
                  {file ? file.name : "Click to select a PDF"}
                </p>
              </label>
              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="mt-3 px-4 py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 disabled:opacity-50 transition-colors"
                >
                  {uploading ? "Uploading..." : "Upload Resume"}
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}