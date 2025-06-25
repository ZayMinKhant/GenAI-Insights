export default function SkeletonAnswer() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mt-6" />
            <div className="space-y-2 mt-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            </div>
        </div>
    );
} 