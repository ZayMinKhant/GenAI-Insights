import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Toaster, toast } from 'react-hot-toast'

import QueryInput from './components/QueryInput'
import ResponseDisplay from './components/ResponseDisplay'
import HistorySidebar from './components/HistorySidebar'
import SkeletonAnswer from './components/SkeletonAnswer'
import DocumentPreview from './components/DocumentPreview'
import ResponseHistoryModal from './components/ResponseHistoryModal'
import { MenuIcon, ChevronLeftIcon, HistoryIcon } from './components/icons'
import type { RootState } from './store'
import { setSelectedHistoryId } from './store'
import type { HistoryItem, Document as DocType } from './types'
import { getHistory, postQuery, revalidateResponse, getResponseHistory } from './api'
import './App.css'


export default function App() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentResponse, setCurrentResponse] = useState<HistoryItem | null>(null)
  const [revalidatingId, setRevalidatingId] = useState<string | null>(null)
  const [previewDoc, setPreviewDoc] = useState<DocType | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [responseHistory, setResponseHistory] = useState<HistoryItem[]>([])
  const [currentQueryForHistory, setCurrentQueryForHistory] = useState("")

  const dispatch = useDispatch();
  const selectedHistoryId = useSelector((state: RootState) => state.ui.selectedHistoryId);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load history. Please try again later.')
    }
  }

  const handleSubmit = async (query: string) => {
    setIsLoading(true)
    dispatch(setSelectedHistoryId(null))
    setCurrentResponse(null);

    try {
      const data = await postQuery(query, 'anonymous');
      setCurrentResponse(data);
      fetchHistory();
    } catch (error) {
      console.error(error);
      toast.error('Failed to process query. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistorySelect = async (id: string) => {
    const historyItem = history.find(item => item.response_id === id)
    if (historyItem) {
      dispatch(setSelectedHistoryId(id))
      setCurrentResponse(historyItem)
    }
  }

  const handleRevalidate = async (id: string) => {
    setRevalidatingId(id)
    try {
      const data = await revalidateResponse(id);

      if (id === selectedHistoryId || !selectedHistoryId) {
        setCurrentResponse(data)
      }
      
      toast.success('A new response has been generated.');

      await fetchHistory()
    } catch (error) {
      console.error(error);
      toast.error('Failed to revalidate query. Please try again.')
    } finally {
      setRevalidatingId(null)
    }
  }

  const handleViewHistory = async (responseId: string) => {
    const historyItem = history.find(item => item.response_id === responseId);
    if (historyItem) {
      setCurrentQueryForHistory(historyItem.query);
      try {
        const data = await getResponseHistory(responseId);
        setResponseHistory(data);
        setIsHistoryModalOpen(true);
      } catch (error) {
        toast.error('Failed to load response history.');
        console.error(error);
      }
    }
  };

  const handleSourceClick = (doc: DocType) => {
      setPreviewDoc(doc)
  }

  return (
    <div className="min-h-screen flex flex-row bg-gray-50 dark:bg-gray-900">
      <Toaster position="bottom-right" />
      <button
        className="fixed top-4 left-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition md:block"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? (
          <ChevronLeftIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>
      <HistorySidebar
        history={history}
        onSelect={handleHistorySelect}
        onRevalidate={handleRevalidate}
        onViewHistory={handleViewHistory}
        isRevalidating={revalidatingId}
        isOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(false)}
      />
      <main className={`flex-1 p-6 overflow-y-auto relative transition-all flex justify-center items-start ${sidebarOpen ? 'ml-72 md:ml-80' : 'ml-0'}`}>
        <div className="max-w-3xl w-full space-y-6">
          <div className="flex items-center justify-center gap-4">
            <img src="/logo2.png" alt="GenAI Insights Logo" className="h-[80px] w-[80px]" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-white flex gap-2"><span>GenAI</span> <span>Insights</span></h1>
          </div>
          <QueryInput onSubmit={handleSubmit} isLoading={isLoading} />
          {/* Blank-state illustration */}
          {(!currentResponse && history.length === 0 && !isLoading) && (
            <div className="flex flex-col items-center justify-center py-16 opacity-70">
              <HistoryIcon className="w-20 h-20 mb-4 text-gray-400" />
              <p className="text-lg text-gray-500">No queries yet. Start by asking a question!</p>
            </div>
          )}
          {/* Skeleton loader */}
          {isLoading && <SkeletonAnswer />}
          {/* Answer display */}
          {(!isLoading && currentResponse) && (
            <ResponseDisplay
              response={currentResponse}
              onSourceClick={handleSourceClick}
            />
          )}
          <DocumentPreview
            isOpen={!!previewDoc}
            onClose={() => setPreviewDoc(null)}
            document={previewDoc || { id: '', text: '' }}
          />
        </div>
      </main>
      <ResponseHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={responseHistory}
        query={currentQueryForHistory}
      />
    </div>
  )
}
