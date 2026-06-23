import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InspectionSection } from '../InspectionSection';
import { InspectionSection as InspectionSectionType } from '../../../types/inspection';

// Mock InspectionCard
jest.mock('../InspectionCard', () => ({
  InspectionCard: ({ item, onStatusChange, onNotesChange }: any) => (
    <div data-testid={`inspection-card-${item.id}`}>
      <span>{item.name}</span>
      <button onClick={() => onStatusChange(item.id, 'pass')}>Pass</button>
      <button onClick={() => onNotesChange(item.id, 'test notes')}>Add Notes</button>
    </div>
  )
}));

describe('InspectionSection', () => {
  const mockSection: InspectionSectionType = {
    id: 'test-section',
    title: 'Test Section',
    items: [
      { id: 'item1', name: 'Item 1', status: 'pending', required: true },
      { id: 'item2', name: 'Item 2', status: 'pass', required: true },
      { id: 'item3', name: 'Item 3', status: 'fail', required: false }
    ]
  };

  const mockOnItemStatusChange = jest.fn();
  const mockOnItemNotesChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el título de la sección', () => {
    render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('debería mostrar el progreso correcto', () => {
    render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText(/2\/3 completed/)).toBeInTheDocument();
    expect(screen.getByText(/67%/)).toBeInTheDocument();
  });

  it('debería mostrar status fail cuando hay items fallidos', () => {
    render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText('Fail')).toBeInTheDocument();
  });

  it('debería mostrar status pending cuando no hay items completados', () => {
    const pendingSection: InspectionSectionType = {
      ...mockSection,
      items: [
        { id: 'item1', name: 'Item 1', status: 'pending', required: true },
        { id: 'item2', name: 'Item 2', status: 'pending', required: true }
      ]
    };

    render(
      <InspectionSection
        section={pendingSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('debería mostrar status pass cuando todos los items están completados y no hay fallos', () => {
    const passSection: InspectionSectionType = {
      ...mockSection,
      items: [
        { id: 'item1', name: 'Item 1', status: 'pass', required: true },
        { id: 'item2', name: 'Item 2', status: 'pass', required: true }
      ]
    };

    const { container } = render(
      <InspectionSection
        section={passSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    // Buscar el badge de Pass en el header de la sección (no en los items)
    const badges = container.querySelectorAll('.bg-green-100');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('debería mostrar status warning cuando hay items con warning', () => {
    const warningSection: InspectionSectionType = {
      ...mockSection,
      items: [
        { id: 'item1', name: 'Item 1', status: 'pass', required: true },
        { id: 'item2', name: 'Item 2', status: 'warning', required: true }
      ]
    };

    render(
      <InspectionSection
        section={warningSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('debería renderizar todos los items', () => {
    render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByTestId('inspection-card-item1')).toBeInTheDocument();
    expect(screen.getByTestId('inspection-card-item2')).toBeInTheDocument();
    expect(screen.getByTestId('inspection-card-item3')).toBeInTheDocument();
  });

  it('debería llamar onItemStatusChange cuando se cambia el status de un item', () => {
    render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    const passButton = screen.getAllByText('Pass')[0];
    fireEvent.click(passButton);

    expect(mockOnItemStatusChange).toHaveBeenCalledWith('test-section', 'item1', 'pass');
  });

  it('debería llamar onItemNotesChange cuando se agregan notas', () => {
    render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    const notesButton = screen.getAllByText('Add Notes')[0];
    fireEvent.click(notesButton);

    expect(mockOnItemNotesChange).toHaveBeenCalledWith('test-section', 'item1', 'test notes');
  });

  it('debería calcular el porcentaje correctamente', () => {
    const { rerender } = render(
      <InspectionSection
        section={mockSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText(/67%/)).toBeInTheDocument();

    const allPassSection: InspectionSectionType = {
      ...mockSection,
      items: mockSection.items.map(item => ({ ...item, status: 'pass' as const }))
    };

    rerender(
      <InspectionSection
        section={allPassSection}
        onItemStatusChange={mockOnItemStatusChange}
        onItemNotesChange={mockOnItemNotesChange}
      />
    );

    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });
});
