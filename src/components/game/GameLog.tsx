import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';

interface GameLogProps {
  messages: string[];
}

export function GameLog({ messages }: GameLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="bg-black/40 rounded-lg border border-gray-700 h-48">
      <div className="p-2 border-b border-gray-700">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Game Log</h4>
      </div>
      <ScrollArea className="h-36 p-2" ref={scrollRef}>
        <div className="space-y-1">
          {messages.map((msg, i) => (
            <div 
              key={i} 
              className={`text-xs ${
                msg.startsWith('---') 
                  ? 'text-yellow-400 font-semibold mt-2' 
                  : msg.includes('🎉')
                    ? 'text-green-400 font-bold'
                    : 'text-gray-400'
              }`}
            >
              {msg}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
