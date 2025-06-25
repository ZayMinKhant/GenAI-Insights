import React from 'react';
import ResponseDisplay from './ResponseDisplay';
import { CloseIcon } from './icons';
import type { HistoryItem } from '../types';

interface ResponseHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    query: string;
}

const ResponseHistoryModal: React.FC<ResponseHistoryModalProps> = ({ isOpen, onClose, history, query }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Response History for: "{query}"</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                    {history.length > 0 ? (
                        history.map((item, index) => (
                            <div key={item.response_id} className="border-l-4 border-blue-500 pl-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                    Version {index + 1} on {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                                <ResponseDisplay response={item} />
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No other versions of this response have been generated.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResponseHistoryModal; 