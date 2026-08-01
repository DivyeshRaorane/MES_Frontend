/**
 * Sheet Manager Component
 * Provides tab-based UI for managing sheets within a multi-sheet report.
 * Supports: Add, Rename, Delete, Reorder (drag) sheets.
 */
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, X, GripVertical, Edit3, Check, AlertTriangle,
} from 'lucide-react';
import {
  msAddSheet,
  msRemoveSheet,
  msRenameSheet,
  msReorderSheets,
  msSetActiveSheet,
} from '../../../controller/reportBuilder.slice';

const SheetManager = () => {
  const dispatch = useDispatch();
  const { sheets, activeSheetIndex } = useSelector((state) => state.reportBuilder.wizard);

  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const renameInputRef = useRef(null);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddSheet = () => {
    dispatch(msAddSheet());
  };

  const handleSelectSheet = (index) => {
    if (renamingIndex !== null) return;
    dispatch(msSetActiveSheet(index));
  };

  const handleStartRename = (index, e) => {
    e.stopPropagation();
    setRenamingIndex(index);
    setRenameValue(sheets[index].sheetName);
    setTimeout(() => renameInputRef.current?.focus(), 50);
  };

  const handleConfirmRename = () => {
    if (renamingIndex === null) return;
    const trimmed = renameValue.trim();
    if (trimmed) {
      // Check uniqueness
      const isDuplicate = sheets.some(
        (s, i) => i !== renamingIndex && s.sheetName.toLowerCase() === trimmed.toLowerCase()
      );
      if (!isDuplicate) {
        dispatch(msRenameSheet({ index: renamingIndex, name: trimmed }));
      }
    }
    setRenamingIndex(null);
    setRenameValue('');
  };

  const handleCancelRename = () => {
    setRenamingIndex(null);
    setRenameValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirmRename();
    if (e.key === 'Escape') handleCancelRename();
  };

  const handleDeleteSheet = (index, e) => {
    e.stopPropagation();
    if (sheets.length <= 1) return;
    setDeleteConfirm(index);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm !== null) {
      dispatch(msRemoveSheet(deleteConfirm));
      setDeleteConfirm(null);
    }
  };

  // ── Drag & Drop for Reordering ──────────────────────────────────────────

  const handleDragStart = (index, e) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (toIndex, e) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      dispatch(msReorderSheets({ fromIndex: dragIndex, toIndex }));
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col">
      {/* Sheet Tabs Bar */}
      <div className="flex items-center bg-slate-100 border-b border-slate-200 px-2 py-1 overflow-x-auto gap-1">
        {sheets.map((sheet, index) => {
          const isActive = index === activeSheetIndex;
          const isDragOver = index === dragOverIndex;

          return (
            <div
              key={sheet.id || index}
              draggable
              onDragStart={(e) => handleDragStart(index, e)}
              onDragOver={(e) => handleDragOver(index, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(index, e)}
              onDragEnd={handleDragEnd}
              onClick={() => handleSelectSheet(index)}
              className={`
                group flex items-center gap-1 px-3 py-1.5 rounded-t-md text-[11px] font-medium
                cursor-pointer select-none transition-all min-w-0
                ${isActive
                  ? 'bg-white border border-b-0 border-slate-200 text-blue-700 shadow-sm -mb-px z-10'
                  : 'bg-slate-50 border border-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-800'}
                ${isDragOver ? 'border-blue-400 bg-blue-50' : ''}
                ${dragIndex === index ? 'opacity-50' : ''}
              `}
            >
              {/* Drag Handle */}
              <GripVertical
                size={10}
                className="text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0"
              />

              {/* Sheet Name (editable) */}
              {renamingIndex === index ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={renameInputRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleConfirmRename}
                    maxLength={31}
                    className="w-24 px-1 py-0.5 text-[11px] border border-blue-300 rounded
                      focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleConfirmRename(); }}
                    className="p-0.5 rounded text-emerald-600 hover:bg-emerald-50"
                  >
                    <Check size={10} />
                  </button>
                </div>
              ) : (
                <span className="truncate max-w-[100px]" title={sheet.sheetName}>
                  {sheet.sheetName}
                </span>
              )}

              {/* Action Buttons (visible on hover or active) */}
              {renamingIndex !== index && (
                <div className={`flex items-center gap-0.5 ml-1 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                  <button
                    onClick={(e) => handleStartRename(index, e)}
                    className="p-0.5 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    title="Rename sheet"
                  >
                    <Edit3 size={9} />
                  </button>
                  {sheets.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSheet(index, e)}
                      className="p-0.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete sheet"
                    >
                      <X size={9} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Sheet Button */}
        <button
          onClick={handleAddSheet}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-semibold
            text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0"
          title="Add new sheet"
        >
          <Plus size={12} />
          <span>Add Sheet</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">Delete Sheet</h3>
            </div>
            <p className="text-xs text-slate-500 mb-1">
              Are you sure you want to delete <span className="font-semibold text-slate-700">"{sheets[deleteConfirm]?.sheetName}"</span>?
            </p>
            <p className="text-[10px] text-slate-400 mb-4">
              All tables within this sheet will also be removed. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SheetManager;
