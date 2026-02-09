'use client';

import React, { useState, useCallback } from 'react';

type DeploymentProvider = 'vercel' | 'netlify' | 'railway';

interface ProviderConfig {
  id: DeploymentProvider;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  projectUrl?: string;
}

interface Deployment {
  id: string;
  provider: DeploymentProvider;
  status: 'building' | 'ready' | 'error' | 'queued';
  branch: string;
  commit: string;
  createdAt: number;
  url?: string;
}

export const DeploymentPanel: React.FC = () => {
  const [providers, setProviders] = useState<ProviderConfig[]>([
    { id: 'vercel', name: 'Vercel', icon: '▲', color: 'text-white', connected: false },
    { id: 'netlify', name: 'Netlify', icon: '◈', color: 'text-teal-400', connected: false },
    { id: 'railway', name: 'Railway', icon: '🚂', color: 'text-purple-400', connected: false },
  ]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<DeploymentProvider | null>(null);

  const handleConnect = useCallback(async (providerId: DeploymentProvider) => {
    // Simulate OAuth flow
    setProviders((prev) =>
      prev.map((p) =>
        p.id === providerId
          ? { ...p, connected: true, projectUrl: `https://${providerId}.app/my-project` }
          : p
      )
    );
  }, []);

  const handleDisconnect = useCallback((providerId: DeploymentProvider) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, connected: false, projectUrl: undefined } : p))
    );
  }, []);

  const handleDeploy = useCallback(async (providerId: DeploymentProvider) => {
    setIsDeploying(true);
    setSelectedProvider(providerId);

    // Create new deployment
    const newDeployment: Deployment = {
      id: `deploy-${Date.now()}`,
      provider: providerId,
      status: 'queued',
      branch: 'main',
      commit: 'abc1234',
      createdAt: Date.now(),
    };
    setDeployments((prev) => [newDeployment, ...prev]);

    // Simulate build process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setDeployments((prev) =>
      prev.map((d) => (d.id === newDeployment.id ? { ...d, status: 'building' } : d))
    );

    await new Promise((resolve) => setTimeout(resolve, 2000));
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === newDeployment.id
          ? {
              ...d,
              status: 'ready',
              url: `https://my-project-${Math.random().toString(36).slice(2, 8)}.${providerId}.app`,
            }
          : d
      )
    );

    setIsDeploying(false);
    setSelectedProvider(null);
  }, []);

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'queued':
        return { icon: 'schedule', color: 'text-gray-400' };
      case 'building':
        return { icon: 'progress_activity', color: 'text-yellow-400 animate-spin' };
      case 'ready':
        return { icon: 'check_circle', color: 'text-green-400' };
      case 'error':
        return { icon: 'error', color: 'text-red-400' };
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Header */}
      <div className="p-3 border-b border-[#3e3e42]">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
          Deployment
        </h3>
      </div>

      {/* Provider Cards */}
      <div className="p-3 border-b border-[#3e3e42]">
        <p className="text-xs text-gray-500 mb-2">Connect a provider</p>
        <div className="grid grid-cols-3 gap-2">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className={`p-3 rounded-lg border transition-all ${
                provider.connected
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-[#3e3e42] hover:border-[#4e4e52]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-lg ${provider.color}`}>{provider.icon}</span>
                {provider.connected && (
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[10px]">check</span>
                    Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-white mb-2">{provider.name}</p>
              {provider.connected ? (
                <div className="space-y-1">
                  <button
                    onClick={() => handleDeploy(provider.id)}
                    disabled={isDeploying}
                    className="w-full px-2 py-1 text-[10px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded flex items-center justify-center gap-1"
                  >
                    {isDeploying && selectedProvider === provider.id ? (
                      <>
                        <span className="material-symbols-outlined text-[12px] animate-spin">
                          progress_activity
                        </span>
                        Deploying...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[12px]">rocket_launch</span>
                        Deploy
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDisconnect(provider.id)}
                    className="w-full px-2 py-1 text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleConnect(provider.id)}
                  className="w-full px-2 py-1 text-[10px] bg-[#3e3e42] hover:bg-[#4e4e52] text-white rounded"
                >
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deployment History */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-2">Recent Deployments</p>
          {deployments.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-[48px] text-gray-600 mb-2">
                cloud_off
              </span>
              <p className="text-xs text-gray-500">No deployments yet</p>
              <p className="text-[10px] text-gray-600 mt-1">
                Connect a provider and deploy your project
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {deployments.map((deployment) => {
                const statusInfo = getStatusIcon(deployment.status);
                const provider = providers.find((p) => p.id === deployment.provider);

                return (
                  <div
                    key={deployment.id}
                    className="p-3 rounded-lg border border-[#3e3e42] hover:border-[#4e4e52] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={provider?.color}>{provider?.icon}</span>
                        <span className="text-xs text-white">{provider?.name}</span>
                      </div>
                      <span className={`flex items-center gap-1 text-[10px] ${statusInfo.color}`}>
                        <span
                          className={`material-symbols-outlined text-[12px] ${statusInfo.color}`}
                        >
                          {statusInfo.icon}
                        </span>
                        {deployment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">commit</span>
                        {deployment.commit}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">fork_right</span>
                        {deployment.branch}
                      </span>
                      <span>{formatTime(deployment.createdAt)}</span>
                    </div>
                    {deployment.url && deployment.status === 'ready' && (
                      <a
                        href={deployment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                        {deployment.url}
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
