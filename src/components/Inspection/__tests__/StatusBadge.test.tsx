import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('debería renderizar con status pending', () => {
    render(<StatusBadge status="pending" />);
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('debería renderizar con status pass', () => {
    render(<StatusBadge status="pass" />);
    
    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('Pass')).toHaveClass('bg-green-100', 'text-green-700');
  });

  it('debería renderizar con status fail', () => {
    render(<StatusBadge status="fail" />);
    
    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('Fail')).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('debería renderizar con status warning', () => {
    render(<StatusBadge status="warning" />);
    
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toHaveClass('bg-amber-100', 'text-amber-700');
  });

  it('debería usar tamaño md por defecto', () => {
    const { container } = render(<StatusBadge status="pass" />);
    
    const badge = container.querySelector('.text-sm');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('px-3', 'py-1');
  });

  it('debería aplicar tamaño sm cuando se especifica', () => {
    const { container } = render(<StatusBadge status="pass" size="sm" />);
    
    const badge = container.querySelector('.text-xs');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('px-2', 'py-1');
  });

  it('debería aplicar tamaño lg cuando se especifica', () => {
    const { container } = render(<StatusBadge status="pass" size="lg" />);
    
    const badge = container.querySelector('.text-base');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('px-4', 'py-2');
  });

  it('debería mostrar el icono correcto para cada status', () => {
    const { rerender, container } = render(<StatusBadge status="pending" />);
    let icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();

    rerender(<StatusBadge status="pass" />);
    icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();

    rerender(<StatusBadge status="fail" />);
    icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();

    rerender(<StatusBadge status="warning" />);
    icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('debería tener las clases de estilo correctas', () => {
    const { container } = render(<StatusBadge status="pass" />);
    
    const badge = container.querySelector('span');
    expect(badge).toHaveClass(
      'inline-flex',
      'items-center',
      'gap-1',
      'rounded-full',
      'font-medium'
    );
  });

  it('debería cambiar el tamaño del icono según el tamaño del badge', () => {
    const { rerender, container } = render(<StatusBadge status="pass" size="sm" />);
    let icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('width', '12');
    expect(icon).toHaveAttribute('height', '12');

    rerender(<StatusBadge status="pass" size="md" />);
    icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('width', '16');
    expect(icon).toHaveAttribute('height', '16');

    rerender(<StatusBadge status="pass" size="lg" />);
    icon = container.querySelector('svg');
    expect(icon).toHaveAttribute('width', '20');
    expect(icon).toHaveAttribute('height', '20');
  });
});
