
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
      {/* Professional character with lightbulb */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-16 h-16 bg-orange-200 rounded-full border-3 border-orange-300 relative">
          {/* Face features */}
          <div className="absolute top-4 left-4 w-2 h-2 bg-gray-800 rounded-full"></div>
          <div className="absolute top-4 right-4 w-2 h-2 bg-gray-800 rounded-full"></div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-gray-800 rounded-full"></div>
          {/* Cap/Hard hat */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-18 h-6 bg-yellow-500 rounded-full border-2 border-yellow-600"></div>
        </div>
        
        {/* Body with uniform */}
        <div className="w-20 h-24 bg-blue-600 rounded-lg relative mt-2">
          {/* Tool belt */}
          <div className="absolute bottom-2 left-0 right-0 h-4 bg-brown-600 border-2 border-brown-700 rounded">
            <div className="absolute left-2 top-1 w-2 h-2 bg-gray-700 rounded"></div>
            <div className="absolute right-2 top-1 w-2 h-2 bg-gray-700 rounded"></div>
          </div>
          {/* Badge */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-400 rounded border border-yellow-500"></div>
        </div>
        
        {/* Arms */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center w-32">
          {/* Left arm */}
          <div className="w-6 h-12 bg-orange-200 rounded-lg transform -rotate-12 origin-bottom"></div>
          {/* Right arm holding lightbulb */}
          <div className="w-6 h-12 bg-orange-200 rounded-lg transform rotate-12 origin-bottom relative ml-8">
            {/* Lightbulb */}
            <div className="absolute -top-6 -right-3">
              <div className="w-8 h-10 bg-yellow-400 rounded-full border-3 border-yellow-500 relative">
                {/* Lightbulb base */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-3 bg-gray-700 border border-gray-800 rounded"></div>
                {/* Light rays */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-yellow-300"></div>
                <div className="absolute -top-2 left-0 w-3 h-1 bg-yellow-300 transform rotate-45"></div>
                <div className="absolute -top-2 right-0 w-3 h-1 bg-yellow-300 transform -rotate-45"></div>
                <div className="absolute top-2 -left-3 w-3 h-1 bg-yellow-300"></div>
                <div className="absolute top-2 -right-3 w-3 h-1 bg-yellow-300"></div>
                {/* Glowing effect */}
                <div className="absolute inset-0 bg-yellow-300 rounded-full opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Legs */}
        <div className="flex space-x-2 mt-2">
          <div className="w-8 h-16 bg-gray-700 rounded-lg"></div>
          <div className="w-8 h-16 bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  </div>
);

export const FieldTechIllustration = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Professional character with red wagon */}
      <div className="flex items-end space-x-6">
        {/* Character */}
        <div className="flex flex-col items-center">
          {/* Head */}
          <div className="w-14 h-14 bg-peach-200 rounded-full border-3 border-peach-300 relative">
            {/* Face features */}
            <div className="absolute top-3 left-3 w-2 h-2 bg-gray-800 rounded-full"></div>
            <div className="absolute top-3 right-3 w-2 h-2 bg-gray-800 rounded-full"></div>
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-800 rounded-full"></div>
          </div>
          
          {/* Body with polo shirt */}
          <div className="w-18 h-20 bg-blue-500 rounded-lg relative mt-1">
            {/* Collar */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-blue-600 rounded-t-lg border-2 border-blue-700"></div>
            {/* Company logo/badge */}
            <div className="absolute top-2 left-2 w-3 h-2 bg-white rounded border border-gray-300"></div>
          </div>
          
          {/* Arms - one holding walkie-talkie */}
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 flex items-center w-28">
            {/* Left arm */}
            <div className="w-5 h-10 bg-peach-200 rounded-lg transform -rotate-12 origin-bottom"></div>
            {/* Right arm with walkie-talkie */}
            <div className="w-5 h-10 bg-peach-200 rounded-lg transform rotate-12 origin-bottom relative ml-6">
              {/* Walkie-talkie */}
              <div className="absolute -top-4 -right-2 w-3 h-6 bg-gray-800 rounded border border-gray-900 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-600"></div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-green-400"></div>
              </div>
            </div>
          </div>
          
          {/* Legs */}
          <div className="flex space-x-1 mt-1">
            <div className="w-7 h-14 bg-gray-700 rounded-lg"></div>
            <div className="w-7 h-14 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
        
        {/* Red wagon with IT equipment */}
        <div className="relative">
          <div className="w-16 h-8 bg-red-600 border-3 border-red-700 rounded-lg relative">
            {/* Equipment on wagon */}
            <div className="absolute -top-4 left-1 w-4 h-4 bg-gray-200 border-2 border-gray-800 rounded">
              {/* Monitor screen */}
              <div className="w-full h-2/3 bg-blue-900 rounded-t"></div>
            </div>
            <div className="absolute -top-5 right-1 w-5 h-4 bg-gray-300 border-2 border-gray-800 rounded">
              {/* Computer tower details */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-green-400 rounded-full"></div>
              <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-gray-600"></div>
            </div>
            {/* Handle */}
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-6 h-1 bg-gray-800 rounded-full"></div>
          </div>
          {/* Wheels */}
          <div className="absolute -bottom-3 left-2 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-700">
            <div className="absolute inset-1 bg-gray-600 rounded-full"></div>
          </div>
          <div className="absolute -bottom-3 right-2 w-4 h-4 bg-gray-900 rounded-full border-2 border-gray-700">
            <div className="absolute inset-1 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
