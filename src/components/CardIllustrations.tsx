
import React from 'react';

export const CablingIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Two ethernet cables */}
      <div className="flex space-x-8">
        <div className="flex flex-col items-center">
          {/* Cable 1 */}
          <div className="w-2 h-24 bg-gray-800 rounded-full"></div>
          <div className="w-8 h-12 bg-gray-700 rounded-sm relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-400 rounded-sm"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gray-500 rounded-sm"></div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          {/* Cable 2 */}
          <div className="w-2 h-24 bg-gray-800 rounded-full"></div>
          <div className="w-8 h-12 bg-gray-700 rounded-sm relative">
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-yellow-400 rounded-sm"></div>
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gray-500 rounded-sm"></div>
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
            <div className="w-2 h-20 bg-gray-800 rounded-full"></div>
            <div className="w-7 h-10 bg-gray-700 rounded-sm relative">
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-5 h-2 bg-yellow-400 rounded-sm"></div>
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-5 bg-gray-500 rounded-sm"></div>
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
        <div className="w-24 h-16 bg-gray-800 border-4 border-gray-900 rounded-sm">
          <div className="w-full h-full bg-gray-200 rounded-sm"></div>
        </div>
        <div className="w-16 h-3 bg-gray-700 mx-auto rounded-sm"></div>
        <div className="w-8 h-2 bg-gray-800 mx-auto rounded-sm"></div>
      </div>
      
      {/* Desktop Tower */}
      <div className="w-12 h-20 bg-gray-200 border-3 border-gray-900 rounded-sm relative">
        <div className="absolute top-2 right-1 w-2 h-1 bg-gray-800 rounded-full"></div>
        <div className="absolute top-4 left-1 right-1 h-0.5 bg-gray-800"></div>
        <div className="absolute top-6 left-1 right-1 h-0.5 bg-gray-800"></div>
      </div>
    </div>
  </div>
);

export const HackedIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Monitor with hack message */}
      <div className="relative">
        <div className="w-32 h-20 bg-gray-800 border-4 border-gray-900 rounded-sm">
          <div className="w-full h-full bg-gray-900 rounded-sm flex items-center justify-center">
            <div className="text-green-400 text-xs font-mono text-center leading-tight">
              SYSTEM<br/>HACKED
            </div>
          </div>
        </div>
        <div className="w-20 h-3 bg-gray-700 mx-auto rounded-sm"></div>
        <div className="w-10 h-2 bg-gray-800 mx-auto rounded-sm"></div>
      </div>
    </div>
  </div>
);

export const FacilitiesIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Simple stick figure with lightbulb - matching reference style */}
      <div className="flex flex-col items-center">
        {/* Head - simple circle */}
        <div className="w-12 h-12 border-4 border-gray-900 rounded-full bg-white"></div>
        
        {/* Body - simple line with blue tie */}
        <div className="w-1 h-16 bg-gray-900 relative">
          {/* Blue tie */}
          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-3 h-8 bg-blue-600 clip-path-triangle"></div>
        </div>
        
        {/* Arms - simple lines */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center">
            {/* Left arm */}
            <div className="w-8 h-1 bg-gray-900 transform -rotate-12 origin-right"></div>
            {/* Right arm holding lightbulb */}
            <div className="w-8 h-1 bg-gray-900 transform rotate-12 origin-left relative">
              {/* Lightbulb at end of arm */}
              <div className="absolute -top-3 -right-2">
                <div className="w-6 h-8 bg-yellow-400 rounded-full border-3 border-gray-900 relative">
                  {/* Lightbulb base */}
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-gray-700 border border-gray-900"></div>
                  {/* Light rays */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-900"></div>
                  <div className="absolute -top-1 left-0 w-2 h-1 bg-gray-900 transform rotate-45"></div>
                  <div className="absolute -top-1 right-0 w-2 h-1 bg-gray-900 transform -rotate-45"></div>
                  <div className="absolute top-1 -left-2 w-2 h-1 bg-gray-900"></div>
                  <div className="absolute top-1 -right-2 w-2 h-1 bg-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legs - simple lines in walking pose */}
        <div className="flex space-x-1">
          <div className="w-8 h-1 bg-gray-900 transform rotate-12 origin-left"></div>
          <div className="w-8 h-1 bg-gray-900 transform -rotate-12 origin-right"></div>
        </div>
      </div>
    </div>
  </div>
);

export const FieldTechIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Simple stick figure with cart - matching reference style */}
      <div className="flex items-end space-x-4">
        {/* Stick figure */}
        <div className="flex flex-col items-center">
          {/* Head - simple circle */}
          <div className="w-10 h-10 border-3 border-gray-900 rounded-full bg-white"></div>
          
          {/* Body with blue tie */}
          <div className="w-1 h-14 bg-gray-900 relative">
            {/* Blue tie */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-6 bg-blue-600"></div>
          </div>
          
          {/* Arms - one reaching toward cart */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center">
              {/* Left arm */}
              <div className="w-6 h-1 bg-gray-900 transform -rotate-12"></div>
              {/* Right arm pointing to cart */}
              <div className="w-6 h-1 bg-gray-900 transform rotate-12">
                {/* Hand holding device */}
                <div className="absolute -top-1 -right-1 w-2 h-3 bg-gray-900 rounded"></div>
              </div>
            </div>
          </div>
          
          {/* Legs - walking pose */}
          <div className="flex space-x-1">
            <div className="w-6 h-1 bg-gray-900 transform rotate-12 origin-left"></div>
            <div className="w-6 h-1 bg-gray-900 transform -rotate-12 origin-right"></div>
          </div>
        </div>
        
        {/* Red cart with equipment */}
        <div className="relative">
          <div className="w-12 h-6 bg-red-600 border-3 border-gray-900 rounded-sm">
            {/* Computer equipment on cart - simple rectangles */}
            <div className="absolute -top-3 left-1 w-3 h-3 bg-white border-2 border-gray-900"></div>
            <div className="absolute -top-4 right-1 w-4 h-3 bg-white border-2 border-gray-900"></div>
          </div>
          {/* Wheels - simple circles */}
          <div className="absolute -bottom-2 left-1 w-3 h-3 bg-gray-900 rounded-full"></div>
          <div className="absolute -bottom-2 right-1 w-3 h-3 bg-gray-900 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>
);
