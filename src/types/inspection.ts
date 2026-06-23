export interface RobotInfo {
  name: string;
  inspector: string;
}

export interface InspectionItem {
  id: string;
  name: string;
  status: 'pending' | 'pass' | 'fail' | 'warning';
  required: boolean;
}

export interface InspectionSection {
  id: string;
  title: string;
  items: InspectionItem[];
}

export interface InspectionData {
  robotInfo: RobotInfo;
  sections: InspectionSection[];
  overallStatus: 'pending' | 'pass' | 'fail' | 'warning';
  completedAt?: string;
}