"use client";

import { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import styles from "@/app/admin/admin.module.css";
import { SortHandle, moveItem } from "./sort-handle";

export type ReferenceOption = { id: string; label: string; detail?: string; image?: string };

export function ReferencePickerDialog({ open, title, options, selectedIds, onClose, onConfirm }: {
  open: boolean;
  title: string;
  options: ReferenceOption[];
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(selectedIds);
  const filtered = useMemo(() => options.filter(option => `${option.label} ${option.detail ?? ""}`.toLowerCase().includes(search.toLowerCase())), [options, search]);

  if (!open) return null;
  function toggle(id: string) { setSelected(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]); }

  return <div className={styles.editorBackdrop} role="dialog" aria-modal="true" onClick={onClose}><div className={`${styles.pickerDialog} ${styles.referenceDialog}`} onClick={event => event.stopPropagation()}>
    <header className={styles.editorHeader}><div><h2>{title}</h2><p>Choose existing CMS records.</p></div><button type="button" onClick={onClose}><X size={19} /></button></header>
    <div className={styles.pickerToolbar}><label className={styles.searchField}><Search size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search" /></label></div>
    {selected.length > 0 && <div style={{ padding: 12, maxHeight: 160, overflow: "auto" }}><small>Selected display order — drag to reorder</small>{selected.map((id, index) => <div key={id} data-sort-group="reference-selection" data-sort-index={index} className={styles.formSection}><SortHandle index={index} group="reference-selection" label={options.find(option => option.id === id)?.label || id} onMove={(from, to) => setSelected(moveItem(selected, from, to))} /> {index + 1}. {options.find(option => option.id === id)?.label || "Missing record"}</div>)}</div>}
    <div className={styles.referenceList}>{filtered.map(option => { const active = selected.includes(option.id); return <button key={option.id} type="button" className={active ? styles.referenceSelected : ""} onClick={() => toggle(option.id)}>{option.image ? <img src={option.image} alt="" /> : <span className={styles.referencePlaceholder} />}<span><strong>{option.label}</strong>{option.detail && <small>{option.detail}</small>}</span><i>{active && <Check size={14} />}</i></button>; })}</div>
    <footer className={styles.editorFooter}><span>{selected.length} selected</span><div><button type="button" className={styles.secondaryButton} onClick={onClose}>Cancel</button><button type="button" className={styles.primaryButton} onClick={() => { onConfirm(selected); onClose(); }}>Use selection</button></div></footer>
  </div></div>;
}
