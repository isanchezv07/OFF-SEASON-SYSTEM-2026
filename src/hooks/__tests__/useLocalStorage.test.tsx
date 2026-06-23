import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('debería inicializar con el valor inicial si no hay nada en localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
    
    expect(result.current[0]).toBe('initial-value');
  });

  it('debería cargar el valor desde localStorage si existe', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'));
    
    expect(result.current[0]).toBe('stored-value');
  });

  it('debería actualizar el valor en localStorage cuando se cambia', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new-value'));
  });

  it('debería manejar objetos complejos', () => {
    const initialObject = { name: 'Test', count: 0 };
    const { result } = renderHook(() => useLocalStorage('test-key', initialObject));
    
    act(() => {
      result.current[1]({ name: 'Updated', count: 5 });
    });
    
    expect(result.current[0]).toEqual({ name: 'Updated', count: 5 });
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual({ name: 'Updated', count: 5 });
  });

  it('debería manejar funciones de actualización', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));
    
    act(() => {
      result.current[1]((prev: number) => prev + 1);
    });
    
    expect(result.current[0]).toBe(1);
    
    act(() => {
      result.current[1]((prev: number) => prev * 2);
    });
    
    expect(result.current[0]).toBe(2);
  });

  it('debería manejar errores de lectura de localStorage', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'));
    
    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
    getItemSpy.mockRestore();
  });

  it('debería manejar errores de escritura en localStorage', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    // El estado debería actualizarse aunque falle localStorage
    expect(result.current[0]).toBe('new-value');
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('debería manejar valores null en localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify(null));
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
    
    expect(result.current[0]).toBeNull();
  });

  it('debería mantener el valor entre re-renders', () => {
    const { result, rerender } = renderHook(() => useLocalStorage('test-key', 'initial'));
    
    act(() => {
      result.current[1]('updated');
    });
    
    rerender();
    
    expect(result.current[0]).toBe('updated');
  });
});
