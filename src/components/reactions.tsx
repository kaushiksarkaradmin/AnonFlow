'use client';

import { cn } from '@/lib/utils';
import type { Reactions, ReactionType } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface ReactionsProps {
  reactions?: Reactions;
  onReact: (reaction: ReactionType) => void;
  userDigitalToken: string | null;
}

const reactionColors = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
};

const reactionRingColors = {
    red: 'ring-red-500',
    yellow: 'ring-yellow-500',
    green: 'ring-green-500',
}

export function Reactions({ reactions, onReact, userDigitalToken }: ReactionsProps) {
  const reactionTypes: ReactionType[] = ['red', 'yellow', 'green'];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-4">
        {reactionTypes.map((type) => {
          const count = reactions?.[type]?.length || 0;
          const hasReacted = userDigitalToken ? reactions?.[type]?.includes(userDigitalToken) : false;

          return (
            <Tooltip key={type}>
              <div className="flex flex-col items-center gap-1">
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onReact(type)}
                    className={cn(
                      'h-8 w-8 rounded-full transition-all duration-200 ease-in-out',
                      reactionColors[type],
                      hasReacted ? 'ring-2 ring-offset-2' : 'hover:scale-110',
                      reactionRingColors[type]
                    )}
                    aria-label={`React with ${type}`}
                  />
                </TooltipTrigger>
                <span className="text-xs font-semibold text-muted-foreground">{count}</span>
              </div>
              <TooltipContent>
                <p>{type.charAt(0).toUpperCase() + type.slice(1)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
