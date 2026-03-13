import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SearchBar,
  Button,
  Modal,
  ConfirmDialog,
  PluginCard,
} from '../components/common';
import type { Plugin } from '../types';
import { pluginsService } from '../services/plugins';


export default function PluginsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deletePluginTarget, setDeletePluginTarget] = useState<Plugin | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBatchDeleteOpen, setIsBatchDeleteOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch installed plugins
  const { data: plugins = [], isLoading: isLoadingPlugins } = useQuery({
    queryKey: ['plugins'],
    queryFn: pluginsService.listPlugins,
  });


  // Uninstall plugin mutation
  const uninstallMutation = useMutation({
    mutationFn: pluginsService.uninstallPlugin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      setDeletePluginTarget(null);
    },
  });

  // Batch uninstall mutation
  const batchUninstallMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await pluginsService.uninstallPlugin(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      setSelectedIds(new Set());
      setIsBatchDeleteOpen(false);
    },
  });

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Filter plugins by search
  const filteredPlugins = plugins.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Count installed components for a plugin
  const getComponentSummary = (plugin: Plugin) => {
    const parts = [];
    if (plugin.installedSkills.length > 0) parts.push(`${plugin.installedSkills.length} skills`);
    if (plugin.installedCommands.length > 0) parts.push(`${plugin.installedCommands.length} cmds`);
    if (plugin.installedHooks.length > 0) parts.push(`${plugin.installedHooks.length} hooks`);
    if (plugin.installedAgents.length > 0) parts.push(`${plugin.installedAgents.length} agents`);
    return parts.length > 0 ? parts.join(', ') : '-';
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('plugins.title')}</h1>
          <p className="text-[var(--color-text-muted)] mt-1">{t('plugins.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <Button
              variant="secondary"
              icon="delete"
              onClick={() => setIsBatchDeleteOpen(true)}
              className="!text-status-error !border-status-error/30 hover:!bg-status-error/10"
            >
              {t('common.button.delete')} ({selectedIds.size})
            </Button>
          )}
          <Button icon="add" onClick={() => setIsInstallModalOpen(true)}>
            {t('common.button.install')} Plugin
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={t('plugins.searchPlaceholder')}
          className="max-w-md"
        />
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoadingPlugins ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-[var(--color-hover)] rounded w-2/3 mb-3" />
              <div className="h-3 bg-[var(--color-hover)] rounded w-full mb-2" />
              <div className="h-3 bg-[var(--color-hover)] rounded w-1/2 mb-3" />
              <div className="flex gap-1.5">
                <div className="h-5 bg-[var(--color-hover)] rounded-full w-16" />
                <div className="h-5 bg-[var(--color-hover)] rounded-full w-12" />
              </div>
            </div>
          ))
        ) : filteredPlugins.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-[var(--color-text-muted)] mb-4">extension</span>
            <p className="text-[var(--color-text)] font-medium mb-1">{t('plugins.noPlugins')}</p>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">{t('plugins.subtitle')}</p>
            {!searchQuery && (
              <Button icon="add" onClick={() => setIsInstallModalOpen(true)}>
                {t('common.button.install')} Plugin
              </Button>
            )}
          </div>
        ) : (
          filteredPlugins.map((plugin) => (
            <PluginCard
              key={plugin.id}
              plugin={plugin}
              componentSummary={getComponentSummary(plugin)}
              selected={selectedIds.has(plugin.id)}
              onToggleSelect={toggleSelect}
              onDelete={setDeletePluginTarget}
            />
          ))
        )}
      </div>

      {/* Plugin Uninstall Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deletePluginTarget !== null}
        onClose={() => setDeletePluginTarget(null)}
        onConfirm={() => deletePluginTarget && uninstallMutation.mutate(deletePluginTarget.id)}
        title={t('plugins.uninstallPlugin')}
        message={
          <>
            {t('common.message.confirmDelete')}{' '}
            <strong className="text-[var(--color-text)]">{deletePluginTarget?.name}</strong>?
            <br />
            <span className="text-sm text-[var(--color-text-muted)]">
              {t('common.message.cannotUndo')}
            </span>
          </>
        }
        confirmText={t('common.button.uninstall')}
        cancelText={t('common.button.cancel')}
        isLoading={uninstallMutation.isPending}
      />

      {/* Batch Uninstall Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isBatchDeleteOpen}
        onClose={() => setIsBatchDeleteOpen(false)}
        onConfirm={() => batchUninstallMutation.mutate(Array.from(selectedIds))}
        title={t('plugins.uninstallPlugins', { count: selectedIds.size })}
        message={
          <>
            {t('common.message.confirmDelete')}{' '}
            <strong className="text-[var(--color-text)]">{selectedIds.size} plugins</strong>?
            <br />
            <span className="text-sm text-[var(--color-text-muted)]">
              {t('common.message.cannotUndo')}
            </span>
          </>
        }
        confirmText={`${t('common.button.uninstall')} ${selectedIds.size} Plugins`}
        cancelText={t('common.button.cancel')}
        isLoading={batchUninstallMutation.isPending}
      />

      {/* Install Plugin Modal */}
      <Modal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        title={t('plugins.install.title')}
        size="md"
      >
        <InstallPluginModal
          onClose={() => setIsInstallModalOpen(false)}
          onSuccess={() => {}}
        />
      </Modal>
    </div>
  );
}

// Install Plugin Modal Component
function InstallPluginModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { t } = useTranslation();
  const [gitUrl, setGitUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Install from Git mutation - creates marketplace, syncs, and installs all plugins
  const installMutation = useMutation({
    mutationFn: async (data: { url: string; branch: string }) => {
      setError(null);

      // Extract name from URL
      const urlParts = data.url.replace(/\.git$/, '').split('/');
      const name = urlParts.slice(-2).join('/');

      // Create marketplace
      const marketplace = await pluginsService.createMarketplace({
        name,
        type: 'git',
        url: data.url,
        branch: data.branch,
      });

      // Sync to get available plugins
      const syncResult = await pluginsService.syncMarketplace(marketplace.id);

      // Install all plugins found
      const plugins = syncResult.plugins || [];
      if (plugins.length === 0) {
        throw new Error('No plugins found in repository. Repository must contain a plugin.yaml file with skills in a skills/ directory.');
      }

      for (const plugin of plugins) {
        await pluginsService.installPlugin({
          pluginName: plugin.name,
          marketplaceId: marketplace.id,
        });
      }

      return { marketplace, installedCount: plugins.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaces'] });
      onSuccess();
      onClose();
    },
    onError: (err: Error) => {
      setError(err.message || t('plugins.install.installFailed'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUrl.trim()) return;
    installMutation.mutate({ url: gitUrl.trim(), branch: branch.trim() || 'main' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Git Repository URL */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {t('plugins.install.gitUrl')} <span className="text-status-error">*</span>
        </label>
        <input
          type="text"
          value={gitUrl}
          onChange={(e) => setGitUrl(e.target.value)}
          placeholder={t('plugins.install.gitUrlPlaceholder')}
          className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-primary"
          disabled={installMutation.isPending}
        />
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">
          {t('plugins.install.gitUrlHelp')}
        </p>
      </div>

      {/* Branch / Tag / Commit */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {t('plugins.install.branch')}
        </label>
        <input
          type="text"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder={t('plugins.install.branchPlaceholder')}
          className="w-full px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-primary"
          disabled={installMutation.isPending}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-status-error/10 border border-status-error/30 rounded-lg">
          <p className="text-sm text-status-error">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={installMutation.isPending}
        >
          {t('common.button.cancel')}
        </Button>
        <Button
          type="submit"
          isLoading={installMutation.isPending}
          disabled={!gitUrl.trim()}
        >
          {t('plugins.install.installButton')}
        </Button>
      </div>
    </form>
  );
}
