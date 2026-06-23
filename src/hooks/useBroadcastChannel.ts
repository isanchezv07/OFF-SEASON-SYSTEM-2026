import { useEffect, useCallback, useRef } from 'react';
import { AnimationMessage } from '../types';

export const useBroadcastChannel = (
  channelName: string,
  onMessage?: (message: AnimationMessage) => void
) => {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Initialize channel
  useEffect(() => {
    channelRef.current = new BroadcastChannel(channelName);
    
    return () => {
      if (channelRef.current) {
        channelRef.current.close();
      }
    };
  }, [channelName]);

  const sendMessage = useCallback((message: AnimationMessage) => {
    if (channelRef.current) {
      console.log('Sending message:', message);
      channelRef.current.postMessage(message);
    }
  }, []);

  useEffect(() => {
    if (onMessage && channelRef.current) {
      const handleMessage = (event: MessageEvent<AnimationMessage>) => {
        console.log('Received message:', event.data);
        onMessage(event.data);
      };

      channelRef.current.addEventListener('message', handleMessage);

      return () => {
        if (channelRef.current) {
          channelRef.current.removeEventListener('message', handleMessage);
        }
      };
    }
  }, [onMessage]);

  return { sendMessage };
};