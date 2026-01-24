'use client';

import { useDebug } from '@/contexts/DebugContext';
import { useState } from 'react';

export default function DebugPanel() {
  const { debugData, isOpen, setIsOpen, clearDebug } = useDebug();
  const [collapsed, setCollapsed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black text-white text-xs font-mono">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
          >
            {collapsed ? '▼' : '▲'} DEBUG
          </button>
          <button
            onClick={clearDebug}
            className="px-2 py-1 bg-red-900 hover:bg-red-800 rounded text-xs"
          >
            Clear
          </button>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="px-2 py-1 bg-red-900 hover:bg-red-800 rounded"
        >
          ✕
        </button>
      </div>

      {!collapsed && (
        <div className="max-h-32 overflow-y-auto bg-black p-3 border-t border-gray-700 space-y-1">
          {Object.keys(debugData).length === 0 ? (
            <div className="text-gray-500">No debug data</div>
          ) : (
            Object.entries(debugData).map(([key, value]) => (
              <div key={key} className="break-all">
                <span className="text-blue-400">{key}:</span> 
                <span className="text-green-400 ml-2">
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
