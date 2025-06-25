
import React from 'react';

export const CablingIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Two ethernet cables */}
      <div className="flex space-x-8">
        <div className="flex flex-col items-center">
          {/* Cable 1 */}
          <div className="w-2 h-24 bg-black rounded-full"></div>
          <div className="w-8 h-12 bg-gray-600 rounded-sm relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-400 rounded-sm"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gray-400 rounded-sm"></div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {/* Cable 2 */}
          <div className="w-2 h-24 bg-black rounded-full"></div>
          <div className="w-8 h-12 bg-gray-600 rounded-sm relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-400 rounded-sm"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gray-400 rounded-sm"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const TripleCablingIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Three ethernet cables */}
      <div className="flex space-x-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="w-2 h-20 bg-black rounded-full"></div>
            <div className="w-7 h-10 bg-gray-600 rounded-sm relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-2 bg-yellow-400 rounded-sm"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-gray-400 rounded-sm"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ComputerIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative flex items-end space-x-2">
      {/* Monitor */}
      <div className="relative">
        <div className="w-24 h-16 bg-gray-800 border-4 border-black rounded-sm">
          <div className="w-full h-full bg-gray-600 rounded-sm"></div>
        </div>
        <div className="w-16 h-3 bg-gray-700 mx-auto rounded-sm"></div>
        <div className="w-8 h-2 bg-gray-800 mx-auto rounded-sm"></div>
      </div>
      
      {/* Desktop Tower */}
      <div className="w-12 h-20 bg-gray-500 border-2 border-black rounded-sm relative">
        <div className="absolute top-2 right-1 w-2 h-1 bg-gray-700 rounded-full"></div>
        <div className="absolute top-4 left-1 right-1 h-0.5 bg-gray-700"></div>
        <div className="absolute top-6 left-1 right-1 h-0.5 bg-gray-700"></div>
      </div>
      
      {/* Keyboard */}
      <div className="absolute -bottom-2 left-0 w-20 h-4 bg-gray-700 border-2 border-black rounded-sm">
        <div className="grid grid-cols-8 gap-0.5 p-0.5 h-full">
          {Array.from({length: 16}).map((_, i) => (
            <div key={i} className="bg-gray-600 rounded-xs"></div>
          ))}
        </div>
      </div>
      
      {/* Mouse */}
      <div className="absolute -bottom-1 right-0 w-3 h-4 bg-gray-700 border border-black rounded-lg"></div>
    </div>
  </div>
);

export const HackedIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Monitor with hack message */}
      <div className="relative">
        <div className="w-32 h-20 bg-gray-800 border-4 border-black rounded-sm">
          <div className="w-full h-full bg-gray-900 rounded-sm flex items-center justify-center">
            <div className="text-green-400 text-xs font-mono text-center leading-tight">
              C:\I'm<br/>in your base...
            </div>
          </div>
        </div>
        <div className="w-20 h-3 bg-gray-700 mx-auto rounded-sm"></div>
        <div className="w-10 h-2 bg-gray-800 mx-auto rounded-sm"></div>
      </div>
      
      {/* Keyboard */}
      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-gray-700 border-2 border-black rounded-sm">
        <div className="grid grid-cols-10 gap-0.5 p-0.5 h-full">
          {Array.from({length: 20}).map((_, i) => (
            <div key={i} className="bg-gray-600 rounded-xs"></div>
          ))}
        </div>
      </div>
      
      {/* Mouse */}
      <div className="absolute -bottom-1 right-4 w-3 h-4 bg-gray-700 border border-black rounded-lg"></div>
    </div>
  </div>
);

export const FacilitiesIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Stick figure with lightbulb */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-8 h-8 border-2 border-black rounded-full bg-white"></div>
        
        {/* Body with tie */}
        <div className="w-1 h-12 bg-black relative">
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-blue-600"></div>
        </div>
        
        {/* Arms */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
          <div className="flex">
            <div className="w-6 h-1 bg-black transform -rotate-45 origin-right"></div>
            <div className="w-6 h-1 bg-black transform rotate-45 origin-left"></div>
          </div>
        </div>
        
        {/* Lightbulb in hand */}
        <div className="absolute top-6 right-0">
          <div className="w-4 h-5 bg-yellow-400 rounded-full border-2 border-black relative">
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black"></div>
            <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-yellow-600 rounded-full"></div>
            <div className="absolute -top-2 left-0 w-1 h-1 bg-black transform rotate-45"></div>
            <div className="absolute -top-2 right-0 w-1 h-1 bg-black transform -rotate-45"></div>
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black"></div>
          </div>
        </div>
        
        {/* Legs */}
        <div className="flex space-x-2">
          <div className="w-6 h-1 bg-black transform rotate-45 origin-left"></div>
          <div className="w-6 h-1 bg-black transform -rotate-45 origin-right"></div>
        </div>
      </div>
    </div>
  </div>
);

export const FieldTechIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Stick figure with cart */}
      <div className="flex items-end space-x-2">
        {/* Stick figure */}
        <div className="flex flex-col items-center">
          {/* Head */}
          <div className="w-6 h-6 border-2 border-black rounded-full bg-white"></div>
          
          {/* Body with tie */}
          <div className="w-1 h-10 bg-black relative">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1.5 h-4 bg-blue-600"></div>
          </div>
          
          {/* Arms - one pulling cart */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-1 bg-black transform rotate-12 origin-left"></div>
          </div>
          
          {/* Legs - walking pose */}
          <div className="flex space-x-1">
            <div className="w-4 h-1 bg-black transform rotate-12 origin-left"></div>
            <div className="w-4 h-1 bg-black transform -rotate-12 origin-right"></div>
          </div>
        </div>
        
        {/* Cart with equipment */}
        <div className="relative">
          <div className="w-8 h-4 bg-red-500 border-2 border-black rounded-sm">
            {/* Computer equipment on cart */}
            <div className="absolute -top-2 left-1 w-2 h-2 bg-gray-600 border border-black"></div>
            <div className="absolute -top-3 right-1 w-3 h-2 bg-gray-700 border border-black"></div>
          </div>
          {/* Wheels */}
          <div className="absolute -bottom-1 left-0 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute -bottom-1 right-0 w-2 h-2 bg-black rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);
