import type { HistoryItem } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
}

export const postQuery = async (query: string, userId: string): Promise<HistoryItem> => {
    const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, user_id: userId }),
    });
    return handleResponse<HistoryItem>(response);
};

export const getHistory = async (): Promise<HistoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/history`);
    return handleResponse<HistoryItem[]>(response);
};

export const revalidateResponse = async (responseId: string): Promise<HistoryItem> => {
    const response = await fetch(`${API_BASE_URL}/revalidate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response_id: responseId }),
    });
    return handleResponse<HistoryItem>(response);
};

export const getResponseHistory = async (responseId: string): Promise<HistoryItem[]> => {
    const response = await fetch(`${API_BASE_URL}/responses/${responseId}/history`);
    return handleResponse<HistoryItem[]>(response);
};

export const postFeedback = async (
    feedbackData: {
        user_id: string;
        query_id: string;
        response_id: string;
        rating: 'like' | 'dislike';
        comment?: string;
    }
): Promise<{ status: string; feedback_id: string }> => {
    const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData),
    });
    return handleResponse<{ status: string; feedback_id: string }>(response);
};

export async function getFeedbackAggregate(response_id: string): Promise<{ likes: number; dislikes: number }> {
    const res = await fetch(`${API_BASE_URL}/feedback/aggregate?response_id=${encodeURIComponent(response_id)}`);
    return handleResponse<{ likes: number; dislikes: number }>(res);
}
