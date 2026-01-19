import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, PlacedCard } from '@/types/game';

export type SelectedCardSource = 'hand' | 'classification' | 'placed' | 'audited' | null;

interface MobileGameState {
  isMobile: boolean;
  selectedCard: Card | null;
  selectedCardSource: SelectedCardSource;
  placedCardData: {
    placedCard?: PlacedCard;
    sourceType?: 'switch' | 'cable' | 'computer' | 'floating-cable' | 'floating-computer';
    sourceId?: string;
    parentId?: string;
    auditedIndex?: number;
    classificationId?: string;
  } | null;
  setSelectedCard: (card: Card | null, source?: SelectedCardSource, placedData?: MobileGameState['placedCardData']) => void;
  clearSelection: () => void;
}

const MobileGameContext = createContext<MobileGameState | undefined>(undefined);

interface MobileGameProviderProps {
  children: ReactNode;
}

export function MobileGameProvider({ children }: MobileGameProviderProps) {
  const isMobile = useIsMobile();
  const [selectedCard, setSelectedCardState] = useState<Card | null>(null);
  const [selectedCardSource, setSelectedCardSource] = useState<SelectedCardSource>(null);
  const [placedCardData, setPlacedCardData] = useState<MobileGameState['placedCardData']>(null);

  const setSelectedCard = useCallback((
    card: Card | null, 
    source: SelectedCardSource = null,
    placedData: MobileGameState['placedCardData'] = null
  ) => {
    setSelectedCardState(card);
    setSelectedCardSource(source);
    setPlacedCardData(placedData);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCardState(null);
    setSelectedCardSource(null);
    setPlacedCardData(null);
  }, []);

  return (
    <MobileGameContext.Provider 
      value={{ 
        isMobile, 
        selectedCard, 
        selectedCardSource, 
        placedCardData,
        setSelectedCard, 
        clearSelection 
      }}
    >
      {children}
    </MobileGameContext.Provider>
  );
}

export function useMobileGame() {
  const context = useContext(MobileGameContext);
  if (context === undefined) {
    throw new Error('useMobileGame must be used within a MobileGameProvider');
  }
  return context;
}

// Optional hook that doesn't throw if outside provider (for use in shared components)
export function useMobileGameOptional() {
  return useContext(MobileGameContext);
}
