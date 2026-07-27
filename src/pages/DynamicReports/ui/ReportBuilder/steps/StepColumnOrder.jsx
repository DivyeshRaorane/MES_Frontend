/**
 * Step 5 - Drag & Drop Column Ordering
 * Reorder columns via drag-and-drop
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GripVertical, MoveUp, MoveDown } from 'lucide-react';
import { setColumnOrder } from '../../../controller/reportBuilder.slice';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable item component
const SortableColumnItem = ({ id, displayName, index, totalCount }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all
        ${isDragging
          ? 'bg-blue-900/30 border-blue-500 shadow-lg shadow-blue-900/20'
          : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
        }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded text-slate-500 hover:text-slate-300"
      >
        <GripVertical size={14} />
      </button>

      {/* Position number */}
      <span className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-700 text-[10px] font-bold text-slate-300">
        {index + 1}
      </span>

      {/* Column info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate">{displayName}</p>
        <p className="text-[10px] text-slate-500 font-mono truncate">{id}</p>
      </div>
    </div>
  );
};

const StepColumnOrder = () => {
  const dispatch = useDispatch();
  const { wizard } = useSelector((state) => state.reportBuilder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = wizard.columnOrder.indexOf(active.id);
      const newIndex = wizard.columnOrder.indexOf(over.id);
      const newOrder = arrayMove(wizard.columnOrder, oldIndex, newIndex);
      dispatch(setColumnOrder(newOrder));
    }
  };

  const moveItem = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= wizard.columnOrder.length) return;
    const newOrder = arrayMove([...wizard.columnOrder], index, newIndex);
    dispatch(setColumnOrder(newOrder));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-600/20 flex items-center justify-center">
          <GripVertical size={20} className="text-cyan-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white">Column Order</h2>
          <p className="text-[11px] text-slate-400">
            Drag and drop to reorder columns. The report will display columns in this order.
          </p>
        </div>
      </div>

      {/* Sortable list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={wizard.columnOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
            {wizard.columnOrder.map((key, index) => (
              <div key={key} className="flex items-center gap-1">
                <div className="flex-1">
                  <SortableColumnItem
                    id={key}
                    displayName={wizard.columnDisplayNames[key] || key}
                    index={index}
                    totalCount={wizard.columnOrder.length}
                  />
                </div>
                {/* Move buttons (fallback for non-drag) */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <MoveUp size={11} />
                  </button>
                  <button
                    onClick={() => moveItem(index, 1)}
                    disabled={index === wizard.columnOrder.length - 1}
                    className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700 disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <MoveDown size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {wizard.columnOrder.length === 0 && (
        <div className="text-center py-8">
          <GripVertical size={32} className="mx-auto text-slate-600 mb-2" />
          <p className="text-xs text-slate-500">No columns selected yet. Go back to Step 3 to select columns.</p>
        </div>
      )}
    </div>
  );
};

export default StepColumnOrder;
