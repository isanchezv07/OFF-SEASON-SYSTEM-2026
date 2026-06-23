import { InspectionData } from '../../../types/inspection';

export const createInspectionTemplate = (): InspectionData => ({
  robotInfo: {
    name: '',
    inspector: ''
  },
  sections: [
    {
      id: 'physical',
      title: 'Physical Components',
      items: [
        { id: 'frame', name: 'Frame Structure', status: 'pending', required: true },
        { id: 'joints', name: 'Joint Mechanisms', status: 'pending', required: true }
      ]
    },
    {
      id: 'electrical',
      title: 'Electrical Systems',
      items: [
        { id: 'power', name: 'Power System', status: 'pending', required: true },
        { id: 'battery', name: 'Battery Health', status: 'pending', required: true }
      ]
    }/*,
    {
      id: 'software',
      title: 'Software & Controls',
      items: [
        { id: 'firmware', name: 'Firmware Version', status: 'pending', required: true },
        { id: 'calibration', name: 'Sensor Calibration', status: 'pending', required: true }
      ]
    },
    {
      id: 'performance',
      title: 'Performance Tests',
      items: [
        { id: 'movement', name: 'Movement Accuracy', status: 'pending', required: true },
        { id: 'speed', name: 'Speed Tests', status: 'pending', required: true }
      ]
    }*/
  ],
  overallStatus: 'pending'
});