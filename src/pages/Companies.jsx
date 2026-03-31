import { useState } from 'react';
import styles from "./Companies.module.css";
import { SC } from '../constants/stageConfig.js';
import { TC } from '../constants/typeConfig.js';
import Modal from '../components/Modal.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import CompanyForm from './CompanyForm.jsx';
import { formatSafeDate } from '../utils/dateUtils.js';
import LockBlock from '../components/LockBlock.jsx';

export default function Companies({ state, actions, showToast, user }) {
  const { companies, companiesLoading } = state;
  const { addCompany, updateCompany, deleteCompany } = actions;

  const [filterText, setFilterText] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const locked = !user;

  const filtered = companies.filter((c) => {
    const q = filterText.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
  });

  const total = companies.length;

  function handleAdd(data) {
    addCompany(data);
    showToast('Application added successfully', 'success');
    setModalMode(null);
  }

  function handleEdit(data) {
    updateCompany(editTarget.id, data);
    showToast('Application updated', 'success');
    setModalMode(null);
    setEditTarget(null);
  }

  function handleDelete(id) {
    deleteCompany(id);
    showToast('Application removed', 'warn');
  }

  function openEdit(company) {
    setEditTarget(company);
    setModalMode('edit');
  }

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          className={styles.filterInput}
          type="text"
          placeholder="Filter by name or role…"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <LockBlock locked={locked} message="Login to add">
          <button className={styles.addBtn} onClick={() => !locked && setModalMode('add')}>
            + Add Application
          </button>
        </LockBlock>
      </div>

      {/* Stage summary */}
      <div className={styles.stageSummary}>
        {SC.map((s) => (
          <ProgressBar
            key={s.id}
            label={s.label}
            value={companies.filter((c) => c.stage === s.id).length}
            max={total || 1}
            color={s.color}
          />
        ))}
      </div>

      {/* Table */}
      {companiesLoading ? (
        <div className={styles.loadingState}>
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
          <span className={styles.loadingDot} />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          {companies.length === 0
            ? locked
              ? 'Sign in to start tracking your applications.'
              : 'No applications tracked yet. Add your first application!'
            : 'No results match your filter.'}
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Type</th>
                <th>Stage</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const stage = SC.find((s) => s.id === c.stage);
                const type = TC.find((t) => t.id === c.type);
                return (
                  <tr key={c.id}>
                    <td className={styles.nameCell}>{c.name}</td>
                    <td>{c.role}</td>
                    <td>
                      <span className={styles.typeBadge} style={{ backgroundColor: type?.color }}>
                        {type?.label}
                      </span>
                    </td>
                    <td>
                      <span className={styles.stageBadge} style={{ backgroundColor: stage?.color }}>
                        {stage?.label}
                      </span>
                    </td>
                    <td className={styles.dateCell}>{formatSafeDate(c.date, { month: 'short', day: 'numeric', year: 'numeric' }, 'Not scheduled')}</td>
                    <td>
                      <LockBlock locked={locked} message="Login to edit">
                        <div className={styles.actions}>
                          <button className={styles.editBtn} onClick={() => !locked && openEdit(c)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => !locked && handleDelete(c.id)}>Delete</button>
                        </div>
                      </LockBlock>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal — only reachable when logged in */}
      <Modal isOpen={modalMode === 'add'} onClose={() => setModalMode(null)} title="Add Company">
        <CompanyForm onSubmit={handleAdd} onCancel={() => setModalMode(null)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={modalMode === 'edit'} onClose={() => { setModalMode(null); setEditTarget(null); }} title="Edit Company">
        <CompanyForm
          initialData={editTarget}
          onSubmit={handleEdit}
          onCancel={() => { setModalMode(null); setEditTarget(null); }}
        />
      </Modal>
    </div>
  );
}
