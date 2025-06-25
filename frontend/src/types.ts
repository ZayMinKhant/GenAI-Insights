export interface Document {
  id: string;
  text: string;
}

export interface Answer {
  summary: string[];
  facts: string[];
}

export interface Feedback {
  rating: 'like' | 'dislike';
  comment?: string;
}

export interface HistoryItem {
  query_id: string;
  response_id: string;
  query: string;
  answer: Answer;
  timestamp: string;
  docs: Document[];
  feedback: Feedback | null;
} 