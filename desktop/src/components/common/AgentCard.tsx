import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { Agent } from '../../types';

interface AgentCardProps {
  agent: Agent;
  skillNames: string;
  mcpNames: string;
  onChat: (agentId: string) => void;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
}

export default function AgentCard({ agent, skillNames, mcpNames, onChat, onEdit, onDelete }: AgentCardProps) {
  const { t } = useTranslation();

  const skillChips = skillNames === '-' ? [] : skillNames.split(', ');
  const maxVisibleChips = 3;
  const visibleChips = skillChips.slice(0, maxVisibleChips);
  const overflowCount = skillChips.length - maxVisibleChips;

  return (
    <div className="group relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-accent)]/50 hover:shadow-md transition-all">
      {/* Header: name + status dot */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-semibold text-[var(--color-text)] truncate">{agent.name}</h3>
        <span
          className={clsx(
            'w-2 h-2 rounded-full flex-shrink-0',
            agent.status === 'active' ? 'bg-status-online' : 'bg-status-offline'
          )}
        />
      </div>

      {/* Description */}
      {agent.description && (
        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">{agent.description}</p>
      )}

      {/* Model label */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-[var(--color-hover)] text-[var(--color-text-muted)] rounded">
          <span className="material-symbols-outlined text-xs">model_training</span>
          {agent.model || 'Default'}
        </span>
      </div>

      {/* Skill chips */}
      {skillChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {visibleChips.map((name, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full"
            >
              {name}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-[var(--color-hover)] text-[var(--color-text-muted)] rounded-full">
              +{overflowCount}
            </span>
          )}
        </div>
      )}

      {/* MCP indicator */}
      {mcpNames !== '-' && (
        <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
          <span className="material-symbols-outlined text-sm">widgets</span>
          <span className="truncate">{mcpNames}</span>
        </div>
      )}

      {/* Hover action buttons */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onChat(agent.id);
          }}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors"
          title={t('agents.startChat')}
        >
          <span className="material-symbols-outlined text-lg">chat</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(agent);
          }}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-hover)] transition-colors"
          title={t('chat.editAgent')}
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(agent);
          }}
          className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-status-error hover:bg-status-error/10 transition-colors"
          title={t('agents.deleteAgent')}
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>
    </div>
  );
}
