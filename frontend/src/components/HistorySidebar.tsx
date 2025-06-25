import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { RefreshIcon, CloseIcon, HistoryIcon } from './icons';
import type { HistoryItem } from '../types';

interface HistorySidebarProps {
    history: HistoryItem[];
    onSelect: (id: string) => void;
    onRevalidate: (id: string) => void;
    onViewHistory: (responseId: string) => void;
    isRevalidating?: string | null;
    isOpen?: boolean;
    onCloseSidebar?: () => void;
}

const groupHistoryByDate = (history: HistoryItem[]) => {
    const groups: { [key: string]: HistoryItem[] } = {
        Today: [],
        Yesterday: [],
        'Previous 7 Days': [],
        'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    history.forEach(entry => {
        const entryDate = new Date(entry.timestamp);
        if (entryDate >= today) {
            groups.Today.push(entry);
        } else if (entryDate >= yesterday) {
            groups.Yesterday.push(entry);
        } else if (entryDate >= sevenDaysAgo) {
            groups['Previous 7 Days'].push(entry);
        } else {
            groups.Older.push(entry);
        }
    });

    return groups;
};

export default function HistorySidebar({
    history,
    onSelect,
    onRevalidate,
    onViewHistory,
    isRevalidating,
    isOpen = true,
    onCloseSidebar
}: HistorySidebarProps) {
    const selectedHistoryId = useSelector((state: RootState) => state.ui.selectedHistoryId);
    const groupedHistory = useMemo(() => groupHistoryByDate(history), [history]);

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-black/30 dark:bg-black/60 transition-opacity md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                aria-hidden={!isOpen}
                onClick={onCloseSidebar}
            />
            <aside
                className={`
                    fixed left-0 top-0 h-full w-full z-50 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto shadow-lg transition-transform duration-200
                    md:w-80 md:z-30 md:shadow-none md:rounded-none
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
                style={{ marginLeft: 0, borderLeftWidth: 0 }}
                aria-label="Sidebar"
                tabIndex={-1}
                role="complementary"
            >
                <div className="flex items-center justify-between mb-4 text-center border-b border-white/30 pb-3">
                    <h2 className="text-lg font-semibold w-full mt-2">History</h2>
                    <button
                        onClick={onCloseSidebar}
                        aria-label="Close sidebar"
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 md:hidden"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="space-y-4 mt-4">
                    {history.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-3">No queries yet</p>
                    ) : (
                        Object.entries(groupedHistory).map(([groupName, entries]) => (
                            entries.length > 0 && (
                                <div key={groupName}>
                                    <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 px-3 mb-2">{groupName}</h3>
                                    <div className="space-y-1">
                                        {entries.map((entry) => {
                                            const isSelected = selectedHistoryId === entry.response_id;
                                            return (
                                                <div
                                                    key={entry.response_id}
                                                    className={`group relative rounded-md transition-colors
                                                        ${isSelected
                                                            ? 'bg-blue-500 text-white'
                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <button
                                                        onClick={() => onSelect(entry.response_id)}
                                                        className="w-full text-left p-3 pr-20"
                                                        aria-current={isSelected ? 'true' : undefined}
                                                    >
                                                        <p className="font-medium text-sm truncate" title={entry.query}>{entry.query}</p>
                                                        <p className={`text-xs transition-colors ${isSelected ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {new Date(entry.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </p>
                                                    </button>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onViewHistory(entry.response_id); }}
                                                            className={`p-1.5 rounded-full ${isSelected ? 'hover:bg-blue-600' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                                            title="View response history"
                                                        >
                                                            <HistoryIcon className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onRevalidate(entry.response_id); }}
                                                            disabled={isRevalidating === entry.response_id}
                                                            className={`p-1.5 rounded-full ${isSelected ? 'hover:bg-blue-600' : 'hover:bg-gray-300 dark:hover:bg-gray-600'} disabled:opacity-50`}
                                                            title="Refresh answer"
                                                        >
                                                            {isRevalidating === entry.response_id
                                                                ? <RefreshIcon className="w-4 h-4 animate-spin" />
                                                                : <RefreshIcon className="w-4 h-4" />
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        ))
                    )}
                </div>
            </aside>
        </>
    );
} 