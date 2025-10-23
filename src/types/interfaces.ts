export interface DQScore {
  framing: number;
  alternatives: number;
  information: number;
  values: number;
  reasoning: number;
  commitment: number;
}

export interface Message {
  session_id: string;
  user_id: string;
  user_message: string;
  jamie_reply: string;
  dq_score: DQScore;
  timestamp: string;
}