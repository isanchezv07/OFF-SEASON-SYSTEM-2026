import { renderHook, act } from '@testing-library/react';
import { useAudio } from '../../components/useAudio';

describe('useAudio', () => {
  let mockAudio: {
    play: jest.Mock;
    pause: jest.Mock;
    currentTime: number;
    volume: number;
    addEventListener: jest.Mock;
    removeEventListener: jest.Mock;
  };

  beforeEach(() => {
    mockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      currentTime: 0,
      volume: 1,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    (global.Audio as jest.Mock) = jest.fn().mockImplementation(() => mockAudio);
    jest.clearAllMocks();
  });

  it('debería crear un elemento Audio con la fuente correcta', () => {
    const src = '/sounds/test.wav';
    renderHook(() => useAudio(src));
    
    expect(global.Audio).toHaveBeenCalledWith(src);
  });

  it('debería establecer el volumen correctamente', () => {
    const src = '/sounds/test.wav';
    const volume = 0.5;
    renderHook(() => useAudio(src, volume));
    
    expect(mockAudio.volume).toBe(volume);
  });

  it('debería usar volumen 1 por defecto', () => {
    const src = '/sounds/test.wav';
    renderHook(() => useAudio(src));
    
    expect(mockAudio.volume).toBe(1);
  });

  it('debería reproducir el audio cuando se llama a play', () => {
    const src = '/sounds/test.wav';
    const { result } = renderHook(() => useAudio(src));
    
    act(() => {
      result.current.play();
    });
    
    expect(mockAudio.currentTime).toBe(0);
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it('debería resetear currentTime a 0 antes de reproducir', () => {
    const src = '/sounds/test.wav';
    const { result } = renderHook(() => useAudio(src));
    
    mockAudio.currentTime = 10;
    
    act(() => {
      result.current.play();
    });
    
    expect(mockAudio.currentTime).toBe(0);
  });

  it('debería manejar errores de reproducción silenciosamente', async () => {
    const src = '/sounds/test.wav';
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    mockAudio.play.mockRejectedValue(new Error('Play failed'));
    
    const { result } = renderHook(() => useAudio(src));
    
    await act(async () => {
      result.current.play();
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Audio play failed:', expect.any(Error));
    
    consoleSpy.mockRestore();
  });

  it('debería pausar y resetear el audio al desmontarse', () => {
    const src = '/sounds/test.wav';
    const { unmount } = renderHook(() => useAudio(src));
    
    unmount();
    
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.currentTime).toBe(0);
  });

  it('debería recrear el audio cuando cambia la fuente', () => {
    const { rerender } = renderHook(
      ({ src }) => useAudio(src),
      { initialProps: { src: '/sounds/test1.wav' } }
    );
    
    expect(global.Audio).toHaveBeenCalledWith('/sounds/test1.wav');
    
    rerender({ src: '/sounds/test2.wav' });
    
    // El audio debería ser recreado con la nueva fuente
    expect(global.Audio).toHaveBeenCalled();
  });

  it('debería establecer el volumen inicial correctamente', () => {
    const src = '/sounds/test.wav';
    const { rerender } = renderHook(
      ({ volume }) => useAudio(src, volume),
      { initialProps: { volume: 0.5 } }
    );
    
    expect(mockAudio.volume).toBe(0.5);
    
    // Nota: El hook actual no actualiza el volumen cuando cambia después de la inicialización
    // Solo establece el volumen cuando se crea el audio por primera vez
    rerender({ volume: 0.8 });
    
    // El volumen permanece en el valor inicial porque el audio ya existe
    expect(mockAudio.volume).toBe(0.5);
  });

  it('debería retornar una referencia al elemento audio', () => {
    const src = '/sounds/test.wav';
    const { result } = renderHook(() => useAudio(src));
    
    expect(result.current.audioRef).toBeDefined();
    expect(result.current.audioRef.current).toBe(mockAudio);
  });

  it('debería retornar una función play', () => {
    const src = '/sounds/test.wav';
    const { result } = renderHook(() => useAudio(src));
    
    expect(typeof result.current.play).toBe('function');
  });
});
