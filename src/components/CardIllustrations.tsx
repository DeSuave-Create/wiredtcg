import React from 'react';
export const CablingIllustration = () => <div className="w-full h-full flex items-center justify-center py-0 px-0 my-0 mx-[31px]">
    <div className="relative">
      {/* Three ethernet cables matching the green card design */}
      <div className="flex space-x-4 my-[2px] py-0 px-0 mx-[14px]">
        {[1, 2, 3].map(i => <div key={i} className="flex flex-col items-center">
            {/* Cable body */}
            <div className="w-3 h-32 bg-gray-800 rounded-full relative">
              {/* Cable stripes */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-600 rounded-full"></div>
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-600 rounded-full"></div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-gray-600 rounded-full"></div>
            </div>
            {/* RJ45 connector */}
            <div className="w-6 h-10 bg-gray-600 border-2 border-gray-800 rounded-sm relative">
              {/* Connector tabs */}
              <div className="absolute top-1 left-1 right-1 h-2 bg-gray-500 rounded-sm"></div>
              <div className="absolute bottom-1 left-1 right-1 h-2 bg-gray-500 rounded-sm"></div>
              {/* Yellow/gold pins */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-yellow-400"></div>
            </div>
          </div>)}
      </div>
    </div>
  </div>;
export const TripleCablingIllustration = () => <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Three ethernet cables matching the green card design */}
      <div className="flex space-x-3">
        {[1, 2, 3].map(i => <div key={i} className="flex flex-col items-center">
            {/* Cable body */}
            <div className="w-2 h-28 bg-gray-800 rounded-full relative">
              {/* Cable stripes */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-gray-600 rounded-full"></div>
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-gray-600 rounded-full"></div>
            </div>
            {/* RJ45 connector */}
            <div className="w-5 h-8 bg-gray-600 border-2 border-gray-800 rounded-sm relative">
              {/* Connector tabs */}
              <div className="absolute top-1 left-1 right-1 h-1 bg-gray-500 rounded-sm"></div>
              <div className="absolute bottom-1 left-1 right-1 h-1 bg-gray-500 rounded-sm"></div>
              {/* Yellow/gold pins */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 bg-yellow-400"></div>
            </div>
          </div>)}
      </div>
    </div>
  </div>;
export const ComputerIllustration = () => <div className="w-full h-full flex items-center justify-center">
    <div className="relative flex flex-col items-center space-y-3">
      {/* Top row: Monitor and Desktop Tower */}
      <div className="flex items-end space-x-3">
        {/* Monitor */}
        <div className="relative">
          <div className="w-28 h-20 bg-gray-600 border-4 border-gray-900 rounded-sm relative">
            <div className="w-full h-full bg-gray-700 rounded-sm border-2 border-gray-800"></div>
          </div>
          {/* Monitor stand */}
          <div className="w-20 h-2 bg-gray-700 mx-auto rounded-sm border border-gray-800"></div>
          <div className="w-12 h-4 bg-gray-800 mx-auto rounded-sm"></div>
        </div>
        
        {/* Desktop Tower */}
        <div className="w-16 h-24 bg-gray-400 border-4 border-gray-900 rounded-sm relative">
          {/* Power button */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-gray-800 rounded-full border border-gray-600"></div>
          {/* Drive slots */}
          <div className="absolute top-6 left-2 right-2 h-1 bg-gray-800 rounded-sm"></div>
          <div className="absolute top-8 left-2 right-2 h-1 bg-gray-800 rounded-sm"></div>
          {/* Ventilation grilles */}
          <div className="absolute bottom-4 left-2 right-2 space-y-1">
            <div className="h-0.5 bg-gray-600 rounded-sm"></div>
            <div className="h-0.5 bg-gray-600 rounded-sm"></div>
            <div className="h-0.5 bg-gray-600 rounded-sm"></div>
          </div>
        </div>
      </div>
      
      {/* Bottom row: Keyboard and Mouse */}
      <div className="flex items-center space-x-4">
        {/* Keyboard */}
        <div className="w-32 h-10 bg-gray-600 border-2 border-gray-800 rounded-sm relative">
          {/* Keys grid */}
          <div className="absolute inset-1 grid grid-cols-10 gap-0.5">
            {Array.from({
            length: 30
          }).map((_, i) => <div key={i} className="bg-gray-500 rounded-sm"></div>)}
          </div>
        </div>
        
        {/* Mouse */}
        <div className="w-6 h-10 bg-gray-600 border-2 border-gray-800 rounded-full relative">
          {/* Mouse buttons */}
          <div className="absolute top-1 left-1 w-2 h-3 bg-gray-500 rounded-sm"></div>
          <div className="absolute top-1 right-1 w-2 h-3 bg-gray-500 rounded-sm"></div>
          {/* Scroll wheel */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>;
export const HackedIllustration = () => <div className="w-full h-full flex items-center justify-center">
    <div className="relative flex flex-col items-center space-y-2">
      {/* Top row: Monitor */}
      <div className="relative">
        <div className="w-32 h-24 bg-gray-600 border-4 border-gray-900 rounded-sm relative">
          <div className="w-full h-full bg-gray-900 rounded-sm flex items-center justify-center border-2 border-gray-800">
            <div className="text-green-600 text-xs font-mono text-center leading-tight">
              C:\I'm<br />in your base...
            </div>
          </div>
        </div>
        {/* Monitor stand */}
        <div className="w-24 h-2 bg-gray-700 mx-auto rounded-sm border border-gray-800"></div>
        <div className="w-16 h-3 bg-gray-800 mx-auto rounded-sm"></div>
      </div>
      
      {/* Bottom row: Keyboard and Mouse */}
      <div className="flex items-center space-x-3">
        {/* Keyboard */}
        <div className="w-28 h-8 bg-gray-600 border-2 border-gray-800 rounded-sm relative">
          {/* Keys grid */}
          <div className="absolute inset-1 grid grid-cols-8 gap-0.5">
            {Array.from({
            length: 24
          }).map((_, i) => <div key={i} className="bg-gray-500 rounded-sm"></div>)}
          </div>
        </div>
        
        {/* Mouse */}
        <div className="w-5 h-8 bg-gray-600 border-2 border-gray-800 rounded-full relative">
          {/* Mouse buttons */}
          <div className="absolute top-1 left-0.5 w-1.5 h-2 bg-gray-500 rounded-sm"></div>
          <div className="absolute top-1 right-0.5 w-1.5 h-2 bg-gray-500 rounded-sm"></div>
          {/* Scroll wheel */}
          <div className="absolute top-1.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </div>
  </div>;
export const FacilitiesIllustration = () => <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Simple stick figure character holding lightbulb */}
      <div className="flex flex-col items-center">
        {/* Head */}
        <div className="w-16 h-16 bg-white rounded-full border-4 border-black relative">
          {/* Face features */}
          <div className="absolute top-5 left-5 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-5 right-5 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-black rounded-full"></div>
        </div>
        
        {/* Body */}
        <div className="w-1 h-16 bg-black"></div>
        
        {/* Arms */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 flex items-center w-24">
          {/* Left arm */}
          <div className="w-12 h-1 bg-black transform -rotate-12 origin-right"></div>
          {/* Right arm holding lightbulb */}
          <div className="w-12 h-1 bg-black transform rotate-12 origin-left relative">
            {/* Hand */}
            <div className="absolute -right-2 -top-1 w-2 h-2 bg-black rounded-full"></div>
            {/* Lightbulb */}
            <div className="absolute -right-6 -top-6">
              <div className="w-8 h-10 bg-yellow-400 rounded-full border-2 border-black relative">
                {/* Lightbulb base */}
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-2 bg-black rounded"></div>
                {/* Light rays */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-black"></div>
                <div className="absolute -top-1 left-1 w-3 h-0.5 bg-black transform rotate-45"></div>
                <div className="absolute -top-1 right-1 w-3 h-0.5 bg-black transform -rotate-45"></div>
                <div className="absolute top-2 -left-2 w-3 h-0.5 bg-black"></div>
                <div className="absolute top-2 -right-2 w-3 h-0.5 bg-black"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Blue tie */}
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-3 h-12 bg-blue-500 clip-path-triangle"></div>
        
        {/* Tool belt */}
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-brown-600 border border-black rounded"></div>
        
        {/* Legs */}
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 flex space-x-4">
          <div className="w-1 h-16 bg-black transform rotate-12"></div>
          <div className="w-1 h-16 bg-black transform -rotate-12"></div>
        </div>
      </div>
    </div>
  </div>;
export const FieldTechIllustration = () => <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      {/* Simple stick figure character with wagon */}
      <div className="flex items-end space-x-8">
        {/* Character */}
        <div className="flex flex-col items-center">
          {/* Head */}
          <div className="w-14 h-14 bg-white rounded-full border-4 border-black relative">
            {/* Face features */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute top-4 right-4 w-2 h-2 bg-black rounded-full"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-black rounded-full"></div>
          </div>
          
          {/* Body */}
          <div className="w-1 h-14 bg-black"></div>
          
          {/* Arms - one holding walkie-talkie */}
          <div className="absolute top-18 left-1/2 transform -translate-x-1/2 flex items-center w-20">
            {/* Left arm */}
            <div className="w-10 h-1 bg-black transform -rotate-12 origin-right"></div>
            {/* Right arm with walkie-talkie */}
            <div className="w-10 h-1 bg-black transform rotate-12 origin-left relative">
              {/* Hand */}
              <div className="absolute -right-1 -top-1 w-2 h-2 bg-black rounded-full"></div>
              {/* Walkie-talkie */}
              <div className="absolute -right-3 -top-4 w-2 h-6 bg-black rounded border border-gray-700 relative">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-gray-600"></div>
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-0.5 bg-blue-400"></div>
              </div>
            </div>
          </div>
          
          {/* Blue tie */}
          <div className="absolute top-14 left-1/2 transform -translate-x-1/2 w-2 h-10 bg-blue-500"></div>
          
          {/* Legs */}
          <div className="absolute top-28 left-1/2 transform -translate-x-1/2 flex space-x-3">
            <div className="w-1 h-14 bg-black transform rotate-12"></div>
            <div className="w-1 h-14 bg-black transform -rotate-12"></div>
          </div>
        </div>
        
        {/* Red wagon with IT equipment */}
        <div className="relative">
          <div className="w-16 h-6 bg-red-600 border-2 border-black rounded-sm relative">
            {/* Computer monitor on wagon */}
            <div className="absolute -top-6 left-2 w-6 h-6 bg-white border-2 border-black rounded-sm">
              {/* Monitor screen */}
              <div className="w-full h-3 bg-gray-200 rounded-t-sm"></div>
            </div>
            {/* Computer tower on wagon */}
            <div className="absolute -top-8 right-2 w-4 h-8 bg-white border-2 border-black rounded-sm">
              {/* Tower details */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
              <div className="absolute bottom-2 left-1 right-1 h-0.5 bg-black"></div>
            </div>
            {/* Handle */}
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 w-6 h-0.5 bg-black"></div>
          </div>
          {/* Wheels */}
          <div className="absolute -bottom-2 left-2 w-3 h-3 bg-black rounded-full">
            <div className="absolute inset-0.5 bg-white rounded-full"></div>
          </div>
          <div className="absolute -bottom-2 right-2 w-3 h-3 bg-black rounded-full">
            <div className="absolute inset-0.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>;