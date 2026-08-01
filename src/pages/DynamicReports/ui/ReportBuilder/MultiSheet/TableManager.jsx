/**
 * Table Manager Component
 * Card-based UI for managing tables within the active sheet.
 * Supports: Add, Edit (opens config modal), Delete, Duplicate, Reorder tables.
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Edit3, Trash2, Copy, GripVertical, Database,
  Columns3, Filter, Link2, Calculator, ArrowUpDown,
  AlertTriangle, Table2,
} from 'lucide-react';
import {
  msAddTable,
  msRemoveTable,
  msDuplicateTable,
  msReorderTables,
  msStartEditingTable,
} from '../../../controller/reportBuilder.slice';

const TableManager = () => {
  const dispatch = useDispatch();
  const { sheets, activeSheetIndex } = useSelector((state) => state.reportBuilder.wizard);
  const activeSheet = sheets[activeSheetIndex] || null;
  const tables = activeSheet?.tables || [];

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleAddTable = () => {
    dispatch(msAddTable());
  };

  const handleEditTable = (tableIndex) => {
    dispatch(msStartEditingTable({ sheetIndex: activeSheetIndex, tableIndex }));
  };

  const handleDeleteTable = (tableIndex, e) => {
    e.stopPropagation();
    setDeleteConfirm(tableIndex);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm !== null) {
      dispatch(msRemoveTable({ sheetIndex: activeSheetIndex, tableIndex: deleteConfirm }));
      setDeleteConfirm(null);
    }
  };

  const handleDuplicateTable = (tableIndex, e) => {
    e.stopPropagation();
    dispatch(msDuplicateTable({ sheetIndex: activeSheetIndex, tableIndex }));
  };

  // ── Drag & Drop ─────────────────────────────────────────────────────────

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
      dispatch(msReorderTables({ sheetIndex: activeSheetIndex, fromIndex: dragIndex, toIndex }));
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  // ── Helper: Table summary badges ────────────────────────────────────────

  const getTableBadges = (table) => {
    const badges = [];
    if (table.mainTable) badges.push({ icon: Database, label: table.mainTable, color: 'text-blue-500' });
    if (table.selectedColumns.length > 0) badges.push({ icon: Columns3, label: `${table.selectedColumns.length} cols`, color: 'text-emerald-500' });
    if (table.joins.length > 0) badges.push({ icon: Link2, label: `${table.joins.length} join(s)`, color: 'text-purple-500' });
    if (table.filters.length > 0) badges.push({ icon: Filter, label: `${table.filters.length} filter(s)`, color: 'text-amber-500' });
    if (table.expressions.length > 0) badges.push({ icon: Calculator, label: `${table.expressions.length} expr`, color: 'text-cyan-500' });
    if (table.sorting.length > 0 || table.groupBy.length > 0) badges.push({ icon: ArrowUpDown, label: 'Sort/Group', color: 'text-slate-400' });
    return badges;
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (!activeSheet) {
    return (
      <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
        No sheet selected
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-700">
            Tables in "{activeSheet.sheetName}"
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {tables.length} table(s) configured. Each table has its own query and formatting.
          </p>
        </div>
        <button
          onClick={handleAddTable}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold
            text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={12} /> Add Table
        </button>
      </div>

      {/* Table Cards */}
      {tables.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <Table2 size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs text-slate-500 mb-1">No tables in this sheet yet</p>
          <p className="text-[10px] text-slate-400 mb-3">
            Add a table to configure its data source, columns, and filters.
          </p>
          <button
            onClick={handleAddTable}
            className="px-3 py-1.5 rounded-md text-[11px] font-semibold text-blue-600
              bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <Plus size={11} className="inline mr-1" /> Add First Table
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {tables.map((table, index) => {
            const badges = getTableBadges(table);
            const isDragOver = index === dragOverIndex;
            const isConfigured = table.mainTable && table.selectedColumns.length > 0;

            return (
              <div
                key={table.id || index}
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(index, e)}
                onDragEnd={handleDragEnd}
                className={`
                  group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                  ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}
                  ${dragIndex === index ? 'opacity-50' : ''}
                `}
                onClick={() => handleEditTable(index)}
              >
                {/* Drag Handle */}
                <div className="flex-shrink-0 cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} className="text-slate-300" />
                </div>

                {/* Order Badge */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-500">{index + 1}</span>
                </div>

                {/* Table Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[11px] font-bold text-slate-700 truncate">
                      {table.tableName || `Table ${index + 1}`}
                    </h4>
                    {!isConfigured && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                        Not configured
                      </span>
                    )}
                    {isConfigured && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-medium">
                        Ready
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  {badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {badges.map((badge, bIdx) => {
                        const Icon = badge.icon;
                        return (
                          <span key={bIdx} className="flex items-center gap-0.5 text-[9px] text-slate-500">
                            <Icon size={9} className={badge.color} />
                            {badge.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditTable(index); }}
                    title="Configure table"
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDuplicateTable(index, e)}
                    title="Duplicate table"
                    className="p-1.5 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteTable(index, e)}
                    title="Delete table"
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full mx-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">Delete Table</h3>
            </div>
            <p className="text-xs text-slate-500 mb-1">
              Are you sure you want to delete <span className="font-semibold text-slate-700">
                "{tables[deleteConfirm]?.tableName || `Table ${deleteConfirm + 1}`}"
              </span>?
            </p>
            <p className="text-[10px] text-slate-400 mb-4">
              All configuration (columns, filters, joins) for this table will be lost.
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

export default TableManager;
