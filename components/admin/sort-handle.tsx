"use client";
import { useRef } from "react";
import { GripVertical } from "lucide-react";

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const next = [...items];
  if (from === to || to < 0 || to >= next.length) return next;
  const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}

// Pointer events support mouse, pen and touch without making form fields draggable.
export function SortHandle({ index, group, label, onMove }: { index: number; group: string; label: string; onMove: (from: number, to: number) => void }) {
  const target = useRef(index);
  const moved = useRef(false);
  const highlighted = useRef<HTMLElement | null>(null);
  function clearHighlight() { highlighted.current?.removeAttribute("data-drop-target"); highlighted.current = null; }
  return <button type="button" aria-label={`Drag ${label}`} title="Drag to reorder; arrow keys also work" style={{ touchAction: "none", cursor: "grab" }}
    onPointerDown={event => { event.preventDefault(); target.current = index; moved.current = false; event.currentTarget.setPointerCapture(event.pointerId); }}
    onPointerMove={event => {
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
      const elements = document.elementsFromPoint(event.clientX, event.clientY);
      const item = elements.flatMap(element => {
        const parents: HTMLElement[] = [];
        for (let parent: Element | null = element; parent; parent = parent.parentElement) if (parent instanceof HTMLElement && parent.dataset.sortGroup === group) parents.push(parent);
        return parents;
      })[0];
      if (item) { clearHighlight(); target.current = Number(item.dataset.sortIndex); moved.current = target.current !== index; if (moved.current) { item.dataset.dropTarget = "true"; highlighted.current = item; } }
      if (event.clientY < 70) window.scrollBy(0, -20);
      else if (event.clientY > innerHeight - 70) window.scrollBy(0, 20);
    }}
    onPointerUp={event => { clearHighlight(); if (event.currentTarget.hasPointerCapture(event.pointerId)) { event.currentTarget.releasePointerCapture(event.pointerId); if (moved.current) onMove(index, target.current); } }}
    onPointerCancel={() => { clearHighlight(); moved.current = false; }}
    onKeyDown={event => { if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); onMove(index, index + (event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1)); } }}><GripVertical size={16} /></button>;
}
