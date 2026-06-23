export interface Team {
  number: number;
  isAssigned: boolean;
  allianceId?: string;
}

export interface Alliance {
  id: string;
  name: string;
  maxTeams: number;
  teams: number[];
  color: string;
}