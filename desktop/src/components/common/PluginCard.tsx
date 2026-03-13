import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { Plugin } from '../../types';

interface PluginCardProps {
  plugin: Plugin;
  componentSummary: string;
  selected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (plugin: Plugin) => void;
}

export default function PluginCard({ plugin, componentSummary, selected, onToggleSelect, onDelete }: PluginCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={clsx(
        'group relative bg-[var(--color-card)] border rounded-xl p-5 hover:shadow-md transition-all',
        selected
          ? 'border-primary shadow-sm'
          : 'border-[var(--color-border)] hover:border-primary/30'
      )}
    >
      {/* Checkbox */}
      <div className="absolute top-4 left-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(plugin.id)}
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg)] text-primary focus:ring-primary cursor-pointer"
        />
      </div>

      {/* Content with left padding for checkbox */}
      <div className="pl-7">
        {/* Header: name + status */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold text-[var(--color-text)] truncate">{plugin.name}</h3>
          <span
            className={clsx(
              'px-1.5 py-0.5 text-xs rounded flex-shrink-0',
              plugin.status === 'installed'
                ? 'bg-status-success/10 text-status-success'
                : plugin.status === 'disabled'
                ? 'bg-status-warning/10 text-status-warning'
                : 'bg-status-error/10 text-status-error'
            )}
          >
            {plugin.status}
          </span>
        </div>

        {/* Description */}
        {plugin.description && (
          <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">{plugin.description}</p>
        )}

        {/* Version + Marketplace */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            v{plugin.version}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {plugin.marketplaceName || 'Unknown'}
          </span>
        </div>

        {/* Components summary */}
        {componentSummary !== '-' && (
          <div className="flex flex-wrap gap-1.5">
            {componentSummary.split(', ').map((part, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-xs bg-[var(--color-hover)] text-[var(--color-text-muted)] rounded-full"
              >
                {part}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hover action button */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(plugin);
          }}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-status-error hover:bg-status-error/10 transition-colors"
          title={t('plugins.uninstallPlugin')}
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
