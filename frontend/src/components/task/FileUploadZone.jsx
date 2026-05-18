import React, { useRef, useState } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';
import { taskApi } from '../../services/taskApi';
import toast from 'react-hot-toast';

const FileUploadZone = ({ taskId, onUploaded }) => {
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const handleFile = async (file) => {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            toast.error('File must be under 10MB');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // Simulate progress for UX (actual upload is fast for small files)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 15, 85));
            }, 200);

            const data = await taskApi.uploadAttachment(taskId, file);

            clearInterval(progressInterval);
            setUploadProgress(100);

            onUploaded && onUploaded(data.data);
            toast.success(`${file.name} uploaded`);
        } catch (error) {
            toast.error('Failed to upload file');
        } finally {
            setTimeout(() => {
                setUploading(false);
                setUploadProgress(0);
            }, 500);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    return (
        <div className="space-y-2">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all text-center
                    ${isDragOver
                        ? 'border-blue-500/50 bg-blue-500/5'
                        : 'border-white/10 hover:border-white/20 bg-black/10 hover:bg-black/20'
                    }
                    ${uploading ? 'pointer-events-none' : ''}
                `}
            >
                {uploading ? (
                    <div className="space-y-2">
                        <Loader2 size={20} className="animate-spin text-blue-400 mx-auto" />
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Uploading… {uploadProgress}%</p>
                    </div>
                ) : (
                    <div className="space-y-1.5">
                        <Upload size={20} className="text-gray-500 mx-auto" />
                        <p className="text-xs text-gray-500">
                            Drop a file here or <span className="text-blue-400">click to browse</span>
                        </p>
                        <p className="text-[10px] text-gray-600">Max 10MB • Images, PDFs, Docs</p>
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
            />
        </div>
    );
};

export default FileUploadZone;
