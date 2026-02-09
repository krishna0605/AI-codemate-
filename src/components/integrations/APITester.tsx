'use client';

import React, { useState, useCallback } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface RequestHistoryItem {
  id: string;
  method: HttpMethod;
  url: string;
  timestamp: number;
  status?: number;
  duration?: number;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  duration: number;
}

export const APITester: React.FC = () => {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true },
  ]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<RequestHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'headers' | 'body' | 'history'>('headers');

  const handleAddHeader = useCallback(() => {
    setHeaders((prev) => [...prev, { key: '', value: '', enabled: true }]);
  }, []);

  const handleUpdateHeader = useCallback(
    (index: number, field: keyof Header, value: string | boolean) => {
      setHeaders((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
    },
    []
  );

  const handleRemoveHeader = useCallback((index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSend = useCallback(async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const requestHeaders: Record<string, string> = {};
      headers.forEach((h) => {
        if (h.enabled && h.key) {
          requestHeaders[h.key] = h.value;
        }
      });

      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method !== 'GET' && body) {
        fetchOptions.body = body;
      }

      const res = await fetch(url, fetchOptions);
      const duration = Math.round(performance.now() - startTime);

      // Get response headers
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Get response body
      let responseBody = '';
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await res.json();
        responseBody = JSON.stringify(json, null, 2);
      } else {
        responseBody = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: responseBody,
        duration,
      });

      // Add to history
      const historyItem: RequestHistoryItem = {
        id: `req-${Date.now()}`,
        method,
        url,
        timestamp: Date.now(),
        status: res.status,
        duration,
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      setError(err instanceof Error ? err.message : 'Request failed');

      // Add failed request to history
      const historyItem: RequestHistoryItem = {
        id: `req-${Date.now()}`,
        method,
        url,
        timestamp: Date.now(),
        duration,
      };
      setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);
    } finally {
      setIsLoading(false);
    }
  }, [method, url, headers, body]);

  const handleLoadFromHistory = useCallback((item: RequestHistoryItem) => {
    setMethod(item.method);
    setUrl(item.url);
  }, []);

  const getMethodColor = (m: HttpMethod) => {
    switch (m) {
      case 'GET':
        return 'text-green-400';
      case 'POST':
        return 'text-yellow-400';
      case 'PUT':
        return 'text-blue-400';
      case 'PATCH':
        return 'text-purple-400';
      case 'DELETE':
        return 'text-red-400';
    }
  };

  const getStatusColor = (status?: number) => {
    if (!status) return 'text-gray-400';
    if (status < 300) return 'text-green-400';
    if (status < 400) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42]">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">api</span>
          API Tester
        </h3>
      </div>

      {/* Request Builder */}
      <div className="p-3 border-b border-[#3e3e42] space-y-3">
        {/* Method + URL */}
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className="bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map((m) => (
              <option key={m} value={m} className={getMethodColor(m)}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 bg-[#252526] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded flex items-center gap-1"
          >
            {isLoading ? (
              <span className="material-symbols-outlined text-[14px] animate-spin">
                progress_activity
              </span>
            ) : (
              <span className="material-symbols-outlined text-[14px]">send</span>
            )}
            Send
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 bg-[#252526] rounded p-0.5">
          {(['headers', 'body', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-1 text-xs rounded transition-colors ${
                activeTab === tab ? 'bg-[#3e3e42] text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'history' && history.length > 0 && (
                <span className="ml-1 text-[10px] text-gray-500">({history.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="max-h-40 overflow-y-auto">
          {activeTab === 'headers' && (
            <div className="space-y-1">
              {headers.map((header, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => handleUpdateHeader(idx, 'enabled', e.target.checked)}
                    className="w-3 h-3"
                  />
                  <input
                    type="text"
                    value={header.key}
                    onChange={(e) => handleUpdateHeader(idx, 'key', e.target.value)}
                    placeholder="Key"
                    className="flex-1 bg-[#252526] border border-[#3e3e42] rounded px-2 py-1 text-[10px] text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={header.value}
                    onChange={(e) => handleUpdateHeader(idx, 'value', e.target.value)}
                    placeholder="Value"
                    className="flex-1 bg-[#252526] border border-[#3e3e42] rounded px-2 py-1 text-[10px] text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRemoveHeader(idx)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddHeader}
                className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">add</span>
                Add Header
              </button>
            </div>
          )}

          {activeTab === 'body' && (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="w-full h-32 bg-[#252526] border border-[#3e3e42] rounded p-2 text-xs text-white font-mono placeholder:text-gray-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          )}

          {activeTab === 'history' && (
            <div className="space-y-1">
              {history.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No requests yet</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadFromHistory(item)}
                    className="flex items-center justify-between p-2 rounded hover:bg-[#2a2d2e] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${getMethodColor(item.method)}`}>
                        {item.method}
                      </span>
                      <span className="text-xs text-white truncate max-w-[150px]">{item.url}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className={getStatusColor(item.status)}>{item.status || 'ERR'}</span>
                      <span className="text-gray-500">{item.duration}ms</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Response Viewer */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && (
          <div className="m-3 p-3 bg-red-900/20 border border-red-500/30 rounded">
            <p className="text-xs text-red-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">error</span>
              {error}
            </p>
          </div>
        )}

        {response && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Response Status */}
            <div className="p-2 border-b border-[#3e3e42] flex items-center gap-3">
              <span className={`text-sm font-medium ${getStatusColor(response.status)}`}>
                {response.status} {response.statusText}
              </span>
              <span className="text-xs text-gray-500">{response.duration}ms</span>
            </div>

            {/* Response Body */}
            <div className="flex-1 overflow-auto p-3 bg-[#252526]">
              <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                {response.body}
              </pre>
            </div>
          </div>
        )}

        {!response && !error && !isLoading && (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p className="text-xs">Send a request to see the response</p>
          </div>
        )}
      </div>
    </div>
  );
};
