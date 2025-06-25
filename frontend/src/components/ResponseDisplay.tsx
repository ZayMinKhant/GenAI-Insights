import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { ThumbsUpIcon, ThumbsDownIcon, CopyIcon, CheckIcon } from './icons';
import type { HistoryItem, Document as DocType } from '../types';
import { postFeedback, getFeedbackAggregate } from '../api';

interface ResponseDisplayProps {
    response: HistoryItem;
    onSourceClick?: (doc: DocType) => void;
}

export default function ResponseDisplay({ response, onSourceClick }: ResponseDisplayProps) {
    const initialRating = response.feedback ? response.feedback.rating : null;

    const [selectedRating, setSelectedRating] = useState<'like' | 'dislike' | null>(initialRating);
    const [copiedSection, setCopiedSection] = useState<'summary' | 'facts' | null>(null);
    const [comment, setComment] = useState('');
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [aggregate, setAggregate] = useState<{ likes: number; dislikes: number }>({ likes: 0, dislikes: 0 });
    const [loadingAggregate, setLoadingAggregate] = useState(false);

    useEffect(() => {
        const newRating = response.feedback ? response.feedback.rating : null;
        setSelectedRating(newRating);
        setShowCommentBox(false);
        setComment('');
        setFeedbackStatus('idle');
        setFeedbackMessage('');
    }, [response]);

    useEffect(() => {
        if (response.response_id) {
            setLoadingAggregate(true);
            getFeedbackAggregate(response.response_id)
                .then(setAggregate)
                .catch(() => setAggregate({ likes: 0, dislikes: 0 }))
                .finally(() => setLoadingAggregate(false));
        }
    }, [response.response_id, feedbackStatus]);

    const handleCopy = (text: string, section: 'summary' | 'facts') => {
        navigator.clipboard.writeText(text);
        setCopiedSection(section);
        setTimeout(() => setCopiedSection(null), 2000);
    };

    const handleFeedback = (rating: 'like' | 'dislike') => {
        if (!response.query_id || !response.response_id) {
            setFeedbackStatus('error');
            setFeedbackMessage('Query ID or Response ID is missing.');
            return;
        }
        if (selectedRating === rating && !showCommentBox) {
            // If already selected and comment box not shown, allow to remove rating
            setSelectedRating(null);
            setShowCommentBox(false);
            setComment('');
            return;
        }
        setSelectedRating(rating);
        setShowCommentBox(true);
        setFeedbackStatus('idle');
        setFeedbackMessage('');
    };

    const submitFeedback = async () => {
        if (!selectedRating) return;
        try {
            await postFeedback({
                query_id: response.query_id,
                response_id: response.response_id,
                rating: selectedRating,
                user_id: 'anonymous',
                comment: comment.trim() || undefined,
            });
            setFeedbackStatus('success');
            setFeedbackMessage('Thank you for your feedback!');
            setShowCommentBox(false);
            setComment('');
        } catch (error) {
            setFeedbackStatus('error');
            setFeedbackMessage('Failed to send feedback. Please try again.');
        }
    };
    
    const findDocumentBySource = (sourceName: string): DocType | undefined => {
        return response.docs?.find(d => d.id === sourceName);
    };

    const processMarkdown = (text: string) => {
        return text?.replace(
            /\[Source: (.*?)\]/g,
            (_, source) => `[📄 ${source}](#${source})`
        ) || '';
    };

    const { executiveSummary, supportingFacts } = useMemo(() => {
        if (response?.answer) {
            return {
                executiveSummary: response.answer.summary.join('\n- '),
                supportingFacts: response.answer.facts.map(fact => processMarkdown(fact)).join('\n')
            };
        }

        return {
            executiveSummary: '',
            supportingFacts: ''
        };
    }, [response]);

    const components: Components = {
        h2: ({ children }) => (
            <h2 className="text-xl font-semibold border-b pb-2 mb-4">{children}</h2>
        ),
        ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2">{children}</ul>
        ),
        a: ({ href, children }) => {
            if (href?.startsWith('#')) {
                const sourceName = href.replace('#', '').trim();
                const doc = findDocumentBySource(sourceName);
                if (doc) {
                    return (
                        <button
                            onClick={() => onSourceClick?.(doc)}
                            className="inline-flex items-center text-blue-500 hover:text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full text-sm"
                        >
                            {children}
                        </button>
                    );
                }
            }
            return <a href={href} className="text-blue-500 hover:text-blue-600">{children}</a>;
        }
    };

    const SectionHeader = ({ title, onCopy, isCopied }: { title: string; onCopy: () => void; isCopied: boolean }) => (
        <div className="flex justify-between items-center pb-3 mb-3 border-b border-b-white/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <button 
                onClick={onCopy} 
                className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                title={isCopied ? 'Copied!' : 'Copy to clipboard'}
            >
                {isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
                <span>{isCopied ? 'Copied!' : 'Copy'}</span>
            </button>
        </div>
    );

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 space-y-6">
                <div>
                    <SectionHeader 
                        title="Executive Summary" 
                        onCopy={() => handleCopy(executiveSummary, 'summary')}
                        isCopied={copiedSection === 'summary'}
                    />
                    <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 text-left">
                        <ul className="list-disc list-inside space-y-2">
                            {executiveSummary.split('\n').map((line, i) => (
                                <li key={i}>{line.replace(/^-\s*/, '')}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {supportingFacts && (
                    <div>
                        <SectionHeader 
                            title="Supporting Facts"
                            onCopy={() => handleCopy(supportingFacts, 'facts')}
                            isCopied={copiedSection === 'facts'}
                        />
                        <div className="prose prose-sm dark:prose-invert max-w-none space-y-2 text-left">
                            {supportingFacts.split('\n').map((fact, i) => (
                                <div key={i}>
                                    <ReactMarkdown components={components}>{fact.replace(/^-\s*/, '')}</ReactMarkdown>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex flex-col items-end border-t border-gray-200 dark:border-gray-700">
                <div className="w-full flex items-center justify-end space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Was this response helpful?</span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleFeedback('like')}
                            className={`p-2 rounded-full transition-colors ${
                                selectedRating === 'like' 
                                    ? 'bg-green-100 text-green-600 dark:bg-green-900/50' 
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="Good response"
                        >
                            <ThumbsUpIcon className="h-5 w-5" />
                        </button>
                        <span className="text-xs text-gray-500 min-w-[1.5em] text-center">{loadingAggregate ? '-' : aggregate.likes}</span>
                        <button
                            onClick={() => handleFeedback('dislike')}
                            className={`p-2 rounded-full transition-colors ${
                                selectedRating === 'dislike' 
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/50' 
                                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            title="Bad response"
                        >
                            <ThumbsDownIcon className="h-5 w-5" />
                        </button>
                        <span className="text-xs text-gray-500 min-w-[1.5em] text-center">{loadingAggregate ? '-' : aggregate.dislikes}</span>
                    </div>
                </div>
                {showCommentBox && (
                    <div className="w-full mt-3 flex flex-col items-end">
                        <textarea
                            className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows={2}
                            placeholder="Optional: Add a comment..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        <div className="flex items-center space-x-2 mt-2">
                            <button
                                onClick={submitFeedback}
                                className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                            >
                                Submit Feedback
                            </button>
                            <button
                                onClick={() => { setShowCommentBox(false); setComment(''); }}
                                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {feedbackStatus === 'success' && feedbackMessage && (
                    <div className="w-full mt-2 text-green-600 text-sm text-right">{feedbackMessage}</div>
                )}
                {feedbackStatus === 'error' && feedbackMessage && (
                    <div className="w-full mt-2 text-red-600 text-sm text-right">{feedbackMessage}</div>
                )}
            </div>
        </div>
    );
} 