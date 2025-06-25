import { CloseIcon } from './icons';
import type { Document as DocType } from '../types';

interface DocumentPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    document: DocType;
}

export default function DocumentPreview({ isOpen, onClose, document }: DocumentPreviewProps) {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                onClick={onClose}
            />
            <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-lg z-50 overflow-auto transform transition-transform duration-200 ease-in-out">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Source Document</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        <p><span className="font-medium">Source:</span> {document.id}</p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none text-left">
                        <p>{document.text}</p>
                    </div>
                </div>
            </div>
        </>
    );
} 