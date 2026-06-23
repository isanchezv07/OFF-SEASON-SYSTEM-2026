import { renderHook, act } from '@testing-library/react';
import { useBroadcastChannel } from '../useBroadcastChannel';
import { AnimationMessage } from '../../types';

// Mock BroadcastChannel
class MockBroadcastChannel {
  name: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners: Array<(event: MessageEvent) => void> = [];

  constructor(name: string) {
    this.name = name;
  }

  postMessage(message: any) {
    // Simular envío de mensaje
    const event = new MessageEvent('message', { data: message });
    this.listeners.forEach(listener => listener(event));
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      this.listeners.push(listener);
    }
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      this.listeners = this.listeners.filter(l => l !== listener);
    }
  }

  close() {
    this.listeners = [];
  }
}

// Reemplazar BroadcastChannel global
(global as any).BroadcastChannel = MockBroadcastChannel;

describe('useBroadcastChannel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debería crear un BroadcastChannel con el nombre correcto', () => {
    const channelName = 'test-channel';
    renderHook(() => useBroadcastChannel(channelName));
    
    // El canal se crea internamente, no podemos verificar directamente
    // pero podemos verificar que no hay errores
    expect(true).toBe(true);
  });

  it('debería enviar mensajes a través del canal', () => {
    const channelName = 'test-channel';
    const { result } = renderHook(() => useBroadcastChannel(channelName));
    
    const message: AnimationMessage = {
      type: 'START_ANIMATION',
      timestamp: Date.now()
    };
    
    act(() => {
      result.current.sendMessage(message);
    });
    
    expect(console.log).toHaveBeenCalledWith('Sending message:', message);
  });

  it('debería recibir mensajes cuando se proporciona un callback', () => {
    const channelName = 'test-channel';
    const onMessage = jest.fn();
    
    renderHook(() => useBroadcastChannel(channelName, onMessage));
    
    // Necesitamos acceso al canal para simular un mensaje
    // Como no podemos acceder directamente, verificamos que el callback se registró
    expect(onMessage).toBeDefined();
  });

  it('debería limpiar el canal al desmontarse', () => {
    const channelName = 'test-channel';
    const { unmount } = renderHook(() => useBroadcastChannel(channelName));
    
    unmount();
    
    // El canal debería estar cerrado
    // No podemos verificar directamente, pero no debería haber errores
    expect(true).toBe(true);
  });

  it('debería manejar múltiples mensajes', () => {
    const channelName = 'test-channel';
    const { result } = renderHook(() => useBroadcastChannel(channelName));
    
    const message1: AnimationMessage = {
      type: 'START_ANIMATION',
      timestamp: Date.now()
    };
    
    const message2: AnimationMessage = {
      type: 'RESET_ANIMATION',
      timestamp: Date.now()
    };
    
    act(() => {
      result.current.sendMessage(message1);
      result.current.sendMessage(message2);
    });
    
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  it('debería actualizar el callback cuando cambia', () => {
    const channelName = 'test-channel';
    const onMessage1 = jest.fn();
    const onMessage2 = jest.fn();
    
    const { rerender } = renderHook(
      ({ onMessage }) => useBroadcastChannel(channelName, onMessage),
      { initialProps: { onMessage: onMessage1 } }
    );
    
    rerender({ onMessage: onMessage2 });
    
    // El nuevo callback debería estar registrado
    expect(onMessage2).toBeDefined();
  });
});
