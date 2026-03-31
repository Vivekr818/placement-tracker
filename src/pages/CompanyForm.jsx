import { useState } from 'react';
import { SC } from '../constants/stageConfig.js';
import { TC } from '../constants/typeConfig.js';
import { todayStr, parseSafeDate } from '../utils/dateUtils.js';
import styles from './CompanyForm.module.css';

const EMPTY = { name: '', role: '', type: 'product', stage: 'applied', date: todayStr(), notes: '' };

/**
 * CompanyForm — reusable form for add/edit company inside Modal.
 * Handles its own validation state. Calls onSubmit with valid data.
 */
export default function CompanyForm({ initialData, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!initialData) return EMPTY;
    // Normalize existing date — handle null/invalid gracefully for the date input
    const safeDate = parseSafeDate(initialData.date);
    const dateStr = safeDate
      ? [safeDate.getFullYear(), String(safeDate.getMonth() + 1).padStart(2, '0'), String(safeDate.getDate()).padStart(2, '0')].join('-')
      : '';
    return { name: initialData.name, role: initialData.role, type: initialData.type,
             stage: initialData.stage, date: dateStr, notes: initialData.notes ?? '' };
  });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Company name is required';
    if (!form.role.trim())  e.role  = 'Role is required';
    if (!form.stage)        e.stage = 'Stage is required';
    if (!form.type)         e.type  = 'Type is required';
    if (!form.date)         e.date  = 'Date is required';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit({ ...form, name: form.name.trim(), role: form.role.trim(), date: form.date || null });
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label}>Company Name *</label>
        <input className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Google" />
        {errors.name && <span className={styles.error}>{errors.name}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Role *</label>
        <input className={`${styles.input} ${errors.role ? styles.inputError : ''}`}
          value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. SDE Intern" />
        {errors.role && <span className={styles.error}>{errors.role}</span>}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Type *</label>
          <select className={`${styles.input} ${errors.type ? styles.inputError : ''}`}
            value={form.type} onChange={(e) => set('type', e.target.value)}>
            {TC.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          {errors.type && <span className={styles.error}>{errors.type}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Stage *</label>
          <select className={`${styles.input} ${errors.stage ? styles.inputError : ''}`}
            value={form.stage} onChange={(e) => set('stage', e.target.value)}>
            {SC.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {errors.stage && <span className={styles.error}>{errors.stage}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Application Date *</label>
        <input type="date" className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
          value={form.date} onChange={(e) => set('date', e.target.value)} />
        {errors.date && <span className={styles.error}>{errors.date}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Notes</label>
        <textarea className={styles.textarea} rows={3}
          value={form.notes} onChange={(e) => set('notes', e.target.value)}
          placeholder="Optional notes…" />
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button type="submit" className={styles.submitBtn}>
          {initialData ? 'Save Changes' : 'Add Company'}
        </button>
      </div>
    </form>
  );
}
