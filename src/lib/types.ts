export interface Model {
  name: string;
  modified_at: string;
  size: number;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
  id?: string;
}

export interface LLMStats {
  tokensPerSecond: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  modelName?: string;
}

export interface ModelChatHistory {
  [modelName: string]: Message[];
}
