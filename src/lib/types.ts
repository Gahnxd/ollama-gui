export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMStats {
  tokensPerSecond: number;
  totalTokens: number;
}
