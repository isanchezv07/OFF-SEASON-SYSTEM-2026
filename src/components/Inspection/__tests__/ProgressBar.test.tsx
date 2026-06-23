import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('debería renderizar correctamente', () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    
    const progressBar = container.querySelector('.bg-gray-200');
    expect(progressBar).toBeInTheDocument();
  });

  it('debería calcular el porcentaje correctamente', () => {
    const { container } = render(<ProgressBar current={3} total={10} />);
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toHaveStyle({ width: '30%' });
  });

  it('debería mostrar 0% cuando current es 0', () => {
    const { container } = render(<ProgressBar current={0} total={10} />);
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('debería mostrar 100% cuando current es igual a total', () => {
    const { container } = render(<ProgressBar current={10} total={10} />);
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toHaveStyle({ width: '100%' });
  });

  it('debería manejar total igual a 0 sin errores', () => {
    const { container } = render(<ProgressBar current={5} total={0} />);
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toHaveStyle({ width: '0%' });
  });

  it('debería aplicar className personalizada', () => {
    const { container } = render(<ProgressBar current={5} total={10} className="custom-class" />);
    
    const progressBar = container.querySelector('.custom-class');
    expect(progressBar).toBeInTheDocument();
  });

  it('debería manejar valores decimales correctamente', () => {
    const { container } = render(<ProgressBar current={2.5} total={10} />);
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toHaveStyle({ width: '25%' });
  });

  it('debería manejar current mayor que total', () => {
    const { container } = render(<ProgressBar current={15} total={10} />);
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toHaveStyle({ width: '150%' });
  });

  it('debería tener las clases CSS correctas', () => {
    const { container } = render(<ProgressBar current={5} total={10} />);
    
    const progressBar = container.querySelector('.bg-gray-200');
    expect(progressBar).toBeInTheDocument();
    
    const progressFill = container.querySelector('.bg-blue-600');
    expect(progressFill).toBeInTheDocument();
    expect(progressFill).toHaveClass('transition-all', 'duration-300', 'ease-out');
  });
});
