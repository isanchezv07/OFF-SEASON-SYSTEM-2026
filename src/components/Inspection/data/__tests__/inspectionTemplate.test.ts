import { createInspectionTemplate } from '../inspectionTemplate';
import { InspectionData } from '../../../../types/inspection';

describe('createInspectionTemplate', () => {
  it('debería crear un template con estructura correcta', () => {
    const template = createInspectionTemplate();

    expect(template).toHaveProperty('robotInfo');
    expect(template).toHaveProperty('sections');
    expect(template).toHaveProperty('overallStatus');
  });

  it('debería inicializar robotInfo con campos vacíos', () => {
    const template = createInspectionTemplate();

    expect(template.robotInfo).toEqual({
      name: '',
      inspector: ''
    });
  });

  it('debería crear secciones con estructura correcta', () => {
    const template = createInspectionTemplate();

    expect(Array.isArray(template.sections)).toBe(true);
    expect(template.sections.length).toBeGreaterThan(0);

    template.sections.forEach(section => {
      expect(section).toHaveProperty('id');
      expect(section).toHaveProperty('title');
      expect(section).toHaveProperty('items');
      expect(Array.isArray(section.items)).toBe(true);
    });
  });

  it('debería tener items con status pending por defecto', () => {
    const template = createInspectionTemplate();

    template.sections.forEach(section => {
      section.items.forEach(item => {
        expect(item.status).toBe('pending');
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('required');
      });
    });
  });

  it('debería tener overallStatus como pending', () => {
    const template = createInspectionTemplate();

    expect(template.overallStatus).toBe('pending');
  });

  it('debería incluir sección de Physical Components', () => {
    const template = createInspectionTemplate();

    const physicalSection = template.sections.find(s => s.id === 'physical');
    expect(physicalSection).toBeDefined();
    expect(physicalSection?.title).toBe('Physical Components');
    expect(physicalSection?.items.length).toBeGreaterThan(0);
  });

  it('debería incluir sección de Electrical Systems', () => {
    const template = createInspectionTemplate();

    const electricalSection = template.sections.find(s => s.id === 'electrical');
    expect(electricalSection).toBeDefined();
    expect(electricalSection?.title).toBe('Electrical Systems');
    expect(electricalSection?.items.length).toBeGreaterThan(0);
  });

  it('debería crear un nuevo objeto cada vez que se llama', () => {
    const template1 = createInspectionTemplate();
    const template2 = createInspectionTemplate();

    expect(template1).not.toBe(template2);
    expect(template1).toEqual(template2);
  });

  it('debería tener items requeridos marcados como required: true', () => {
    const template = createInspectionTemplate();

    template.sections.forEach(section => {
      section.items.forEach(item => {
        expect(item.required).toBe(true);
      });
    });
  });
});
