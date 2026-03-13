import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { SearchBar, Button, ConfirmDialog, AgentFormModal, AgentCard } from '../components/common';
import type { Agent, AgentCreateRequest, Skill, MCPServer } from '../types';
import { agentsService } from '../services/agents';
import { skillsService } from '../services/skills';
import { mcpService } from '../services/mcp';

export default function AgentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Skills, MCPs for table display
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mcpServers, setMcpServers] = useState<MCPServer[]>([]);

  // Fetch agents on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const agentsData = await agentsService.list();
        setAgents(agentsData);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch skills and MCPs on mount for table display
  useEffect(() => {
    const fetchSkillsAndMCPs = async () => {
      try {
        const [skillsData, mcpsData] = await Promise.all([
          skillsService.list(),
          mcpService.list(),
        ]);
        setSkills(skillsData);
        setMcpServers(mcpsData);
      } catch (error) {
        console.error('Failed to fetch skills/MCPs:', error);
      }
    };
    fetchSkillsAndMCPs();
  }, []);

  // Helper functions to get names from IDs
  const getSkillNames = (agent: Agent) => {
    if (agent.allowAllSkills) return t('agents.allSkills');
    if (!agent.skillIds || agent.skillIds.length === 0) return '-';
    const names = agent.skillIds
      .map((id) => skills.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '-';
  };

  const getMcpNames = (mcpIds: string[]) => {
    if (!mcpIds || mcpIds.length === 0) return '-';
    const names = mcpIds
      .map((id) => mcpServers.find((m) => m.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '-';
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.model?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (agent: Agent) => {
    setDeleteTarget(agent);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await agentsService.delete(deleteTarget.id);
      setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      // Invalidate React Query cache so other pages (like ChatPage) get updated data
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    } catch (error) {
      console.error('Failed to delete agent:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStartChat = (agentId: string) => {
    navigate(`/chat?agentId=${agentId}`);
  };

  const handleCreateAgent = async (data: Agent | AgentCreateRequest) => {
    // For create mode, data will always be AgentCreateRequest (no id property)
    if (!('id' in data)) {
      const created = await agentsService.create(data);
      setAgents((prev) => [...prev, created]);
      // Invalidate React Query cache so other pages get updated data
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  };

  const handleEditAgent = async (data: Agent | AgentCreateRequest) => {
    // For edit mode, data will always be Agent (has id property)
    if ('id' in data) {
      const updated = await agentsService.update(data.id, data);
      setAgents((prev) =>
        prev.map((agent) => (agent.id === updated.id ? updated : agent))
      );
      // Invalidate React Query cache so other pages get updated data
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    }
  };

  const handleOpenEditModal = (agent: Agent) => {
    setEditingAgent(agent);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">{t('agents.title')}</h1>
          <p className="text-[var(--color-text-muted)] mt-1">{t('agents.subtitle')}</p>
        </div>
        <Button icon="add" onClick={() => setIsCreateModalOpen(true)}>
          {t('agents.addAgent')}
        </Button>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder={t('agents.searchPlaceholder')}
        className="mb-4"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isInitialLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 animate-pulse">
              <div className="h-5 bg-[var(--color-hover)] rounded w-2/3 mb-3" />
              <div className="h-3 bg-[var(--color-hover)] rounded w-full mb-2" />
              <div className="h-3 bg-[var(--color-hover)] rounded w-1/2 mb-4" />
              <div className="flex gap-1.5">
                <div className="h-5 bg-[var(--color-hover)] rounded-full w-16" />
                <div className="h-5 bg-[var(--color-hover)] rounded-full w-12" />
              </div>
            </div>
          ))
        ) : filteredAgents.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <span className="material-symbols-outlined text-4xl text-[var(--color-text-muted)] mb-2">smart_toy</span>
            <p className="text-[var(--color-text-muted)]">{t('agents.noAgents')}</p>
          </div>
        ) : (
          filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              skillNames={getSkillNames(agent)}
              mcpNames={getMcpNames(agent.mcpIds)}
              onChat={handleStartChat}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </div>

      {/* Create Modal */}
      <AgentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateAgent}
        agent={null}
      />

      {/* Edit Modal */}
      <AgentFormModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAgent(null);
        }}
        onSave={handleEditAgent}
        agent={editingAgent}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t('agents.deleteAgent')}
        message={
          <>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
            <br />
            <span className="text-sm">This action cannot be undone.</span>
          </>
        }
        confirmText={t('common.button.delete')}
        cancelText={t('common.button.cancel')}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
