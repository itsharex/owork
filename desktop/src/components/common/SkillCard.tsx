import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { Skill } from '../../types';

interface SkillCardProps {
  skill: Skill;
  sourceDisplay: { label: string; icon: string; color: string };
  onDelete?: (skill: Skill) => void;
}

function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export default function SkillCard({ skill, sourceDisplay, onDelete }: SkillCardProps) {
  const { t } = useTranslation();

  return (
    <div className="group relative bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-primary/30 hover:shadow-md transition-all">
      {/* Header: name + version */}
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-semibold text-[var(--color-text)] truncate">{skill.name}</h3>
        <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded flex-shrink-0">
          v{skill.version || '1.0.0'}
        </span>
      </div>

      {/* Description */}
      {skill.description && (
        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2 mb-3">{skill.description}</p>
      )}

      {/* Source badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className={clsx('material-symbols-outlined text-sm', sourceDisplay.color)}>
          {sourceDisplay.icon}
        </span>
        <span className={clsx('text-xs', sourceDisplay.color)}>{sourceDisplay.label}</span>
      </div>

      {/* Updated time */}
      <div className="text-xs text-[var(--color-text-muted)]">
        {formatDateTime(skill.updatedAt)}
      </div>

      {/* Hover action buttons */}
      {onDelete && (
        <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(skill);
            }}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-status-error hover:bg-status-error/10 transition-colors"
            title={t('skills.deleteSkill')}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      )}

      {/* Plugin managed indicator (non-deletable) */}
      {skill.sourceType === 'plugin' && (
        <div className="absolute top-3 right-3">
          <span className="text-xs text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
            {t('skills.source.plugin')}
          </span>
        </div>
      )}
    </div>
  );
}
