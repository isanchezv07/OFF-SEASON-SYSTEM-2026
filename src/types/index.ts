export interface Team {
  id: number;
  name: string;
  school: string;
  color: string;
  logo?: string;
}

export interface MatchState {
  type: string;
  number: number;
  inProgress: boolean;
  timeRemaining: number;
  redTeam: {
    name: string;
    score: number;
    teams: number[];
  };
  blueTeam: {
    name: string;
    score: number;
    teams: number[];
  };
  showScores: boolean;
  showWinner: boolean;
}

export interface AnimationMessage {
  type: 'START_ANIMATION' | 'RESET_ANIMATION';
  timestamp: number;
  match?: MatchState;  // Ahora sí existe MatchState y no habrá error
}