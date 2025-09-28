import React from 'react';
import { ProjectFile } from '../types';
import { CloseIcon, DownloadIcon } from './icons';
import ModalOverlay from './ModalOverlay';

const downloadBase64File = (base64Data: string, fileName: string, mimeType: string) => {
    const linkSource = `data:${mimeType};base64,${base64Data}`;
    const downloadLink = document.createElement("a");
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
};

const FilePreviewModal: React.FC<{
  file: ProjectFile;
  onClose: () => void;
}> = ({ file, onClose }) => {
  return (
    <ModalOverlay className="flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 flex items-center justify-between border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold truncate">{file.name}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => downloadBase64File(file.data, file.name, file.mimeType)}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors bg-gray-700/80 hover:bg-gray-600"
            >
                <DownloadIcon className="text-base" />
              <span>Download</span>
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><CloseIcon /></button>
          </div>
        </header>
        <main className="p-4 flex-1 overflow-auto flex items-center justify-center bg-gray-900/50">
          {file.mimeType.startsWith('image/') ? (
            <img src={`data:${file.mimeType};base64,${file.data}`} alt={file.name} className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center text-gray-400">
              <p className="text-lg">Preview not available for this file type.</p>
              <p>You can download the file to view it.</p>
            </div>
          )}
        </main>
      </div>
    </ModalOverlay>
  );
};

export default FilePreviewModal;
