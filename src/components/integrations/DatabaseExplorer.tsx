'use client';

import React, { useState, useCallback } from 'react';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'supabase' | 'postgresql' | 'sqlite';
  host?: string;
  database?: string;
  connected: boolean;
}

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
}

interface Table {
  name: string;
  rowCount?: number;
  columns?: TableColumn[];
}

// Mock data for demo
const MOCK_TABLES: Table[] = [
  { name: 'users', rowCount: 1250 },
  { name: 'projects', rowCount: 45 },
  { name: 'files', rowCount: 3420 },
  { name: 'comments', rowCount: 892 },
  { name: 'sessions', rowCount: 156 },
];

const MOCK_COLUMNS: TableColumn[] = [
  { name: 'id', type: 'uuid', nullable: false, isPrimaryKey: true },
  { name: 'email', type: 'varchar(255)', nullable: false, isPrimaryKey: false },
  { name: 'name', type: 'varchar(100)', nullable: true, isPrimaryKey: false },
  { name: 'created_at', type: 'timestamp', nullable: false, isPrimaryKey: false },
  { name: 'updated_at', type: 'timestamp', nullable: true, isPrimaryKey: false },
];

export const DatabaseExplorer: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    { id: 'supabase-1', name: 'Supabase (Production)', type: 'supabase', connected: false },
  ]);
  const [selectedConnection, setSelectedConnection] = useState<DatabaseConnection | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewConnection, setShowNewConnection] = useState(false);
  const [newConnectionForm, setNewConnectionForm] = useState({
    name: '',
    type: 'postgresql' as 'supabase' | 'postgresql' | 'sqlite',
    host: '',
    database: '',
  });

  const handleConnect = useCallback(async (connection: DatabaseConnection) => {
    setIsLoading(true);
    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setConnections((prev) =>
      prev.map((c) => (c.id === connection.id ? { ...c, connected: true } : c))
    );
    setSelectedConnection({ ...connection, connected: true });
    setTables(MOCK_TABLES);
    setIsLoading(false);
  }, []);

  const handleDisconnect = useCallback(
    (connection: DatabaseConnection) => {
      setConnections((prev) =>
        prev.map((c) => (c.id === connection.id ? { ...c, connected: false } : c))
      );
      if (selectedConnection?.id === connection.id) {
        setSelectedConnection(null);
        setTables([]);
        setSelectedTable(null);
      }
    },
    [selectedConnection]
  );

  const handleSelectTable = useCallback((table: Table) => {
    setSelectedTable({
      ...table,
      columns: MOCK_COLUMNS,
    });
  }, []);

  const handleRunQuery = useCallback(async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 500));

    setQueryResult(
      JSON.stringify(
        [
          { id: '1', email: 'alice@example.com', name: 'Alice', created_at: '2024-01-15' },
          { id: '2', email: 'bob@example.com', name: 'Bob', created_at: '2024-01-16' },
          { id: '3', email: 'carol@example.com', name: 'Carol', created_at: '2024-01-17' },
        ],
        null,
        2
      )
    );
    setIsLoading(false);
  }, [query]);

  const handleAddConnection = useCallback(() => {
    if (!newConnectionForm.name) return;

    const newConnection: DatabaseConnection = {
      id: `conn-${Date.now()}`,
      name: newConnectionForm.name,
      type: newConnectionForm.type,
      host: newConnectionForm.host,
      database: newConnectionForm.database,
      connected: false,
    };
    setConnections((prev) => [...prev, newConnection]);
    setShowNewConnection(false);
    setNewConnectionForm({ name: '', type: 'postgresql', host: '', database: '' });
  }, [newConnectionForm]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'supabase':
        return '⚡';
      case 'postgresql':
        return '🐘';
      case 'sqlite':
        return '📦';
      default:
        return '🗄️';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">database</span>
          Database Explorer
        </h3>
        <button
          onClick={() => setShowNewConnection(true)}
          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          + Add Connection
        </button>
      </div>

      {/* New Connection Modal */}
      {showNewConnection && (
        <div className="p-3 border-b border-[#3e3e42] bg-[#252526] space-y-2">
          <input
            type="text"
            placeholder="Connection name"
            value={newConnectionForm.name}
            onChange={(e) => setNewConnectionForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={newConnectionForm.type}
            onChange={(e) =>
              setNewConnectionForm((prev) => ({
                ...prev,
                type: e.target.value as 'supabase' | 'postgresql' | 'sqlite',
              }))
            }
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="postgresql">PostgreSQL</option>
            <option value="supabase">Supabase</option>
            <option value="sqlite">SQLite</option>
          </select>
          <input
            type="text"
            placeholder="Host (e.g., localhost:5432)"
            value={newConnectionForm.host}
            onChange={(e) => setNewConnectionForm((prev) => ({ ...prev, host: e.target.value }))}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-2 py-1.5 text-xs text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddConnection}
              className="flex-1 px-2 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Add
            </button>
            <button
              onClick={() => setShowNewConnection(false)}
              className="px-2 py-1.5 text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Connections & Tables */}
        <div className="w-48 border-r border-[#3e3e42] overflow-y-auto">
          {/* Connections */}
          <div className="p-2 border-b border-[#3e3e42]">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Connections</p>
            {connections.map((conn) => (
              <div
                key={conn.id}
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedConnection?.id === conn.id ? 'bg-blue-600/20' : 'hover:bg-[#2a2d2e]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white flex items-center gap-1">
                    {getTypeIcon(conn.type)} {conn.name}
                  </span>
                  {conn.connected ? (
                    <button
                      onClick={() => handleDisconnect(conn)}
                      className="text-green-400 hover:text-red-400"
                    >
                      <span className="material-symbols-outlined text-[12px]">power</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleConnect(conn)}
                      className="text-gray-500 hover:text-green-400"
                    >
                      <span className="material-symbols-outlined text-[12px]">power_off</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Tables */}
          {selectedConnection?.connected && (
            <div className="p-2">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Tables</p>
              {tables.map((table) => (
                <div
                  key={table.name}
                  onClick={() => handleSelectTable(table)}
                  className={`p-1.5 rounded cursor-pointer transition-colors flex items-center justify-between ${
                    selectedTable?.name === table.name ? 'bg-blue-600/20' : 'hover:bg-[#2a2d2e]'
                  }`}
                >
                  <span className="text-xs text-white flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] text-gray-500">
                      table
                    </span>
                    {table.name}
                  </span>
                  <span className="text-[10px] text-gray-500">{table.rowCount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Query Editor */}
          <div className="p-2 border-b border-[#3e3e42]">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-xs text-gray-400">Query Editor</p>
              <button
                onClick={handleRunQuery}
                disabled={isLoading || !selectedConnection?.connected}
                className="ml-auto px-2 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[12px]">play_arrow</span>
                Run
              </button>
            </div>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT * FROM table_name;"
              className="w-full h-20 bg-[#252526] border border-[#3e3e42] rounded p-2 text-xs text-white font-mono placeholder:text-gray-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* Results / Table Structure */}
          <div className="flex-1 overflow-auto p-2">
            {selectedTable?.columns && !queryResult && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Table: {selectedTable.name}</p>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="p-1">Column</th>
                      <th className="p-1">Type</th>
                      <th className="p-1">Nullable</th>
                      <th className="p-1">Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="border-t border-[#3e3e42]">
                        <td className="p-1 text-white">{col.name}</td>
                        <td className="p-1 text-blue-400">{col.type}</td>
                        <td className="p-1 text-gray-400">{col.nullable ? 'Yes' : 'No'}</td>
                        <td className="p-1">
                          {col.isPrimaryKey && <span className="text-yellow-400">🔑</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {queryResult && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Query Result</p>
                <pre className="text-xs text-gray-300 font-mono bg-[#252526] p-2 rounded overflow-auto">
                  {queryResult}
                </pre>
              </div>
            )}

            {!selectedConnection?.connected && (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p className="text-xs">Connect to a database to explore</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
