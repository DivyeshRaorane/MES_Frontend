/**
 * Step: Multi-Sheet Configuration
 * Shows Sheet Manager (tabs) + Table Manager (cards) + Table Config Modal (overlay)
 * This step replaces steps 2-9 when isMultiSheet is true.
 */
import React from 'react';
import { useSelector } from 'react-redux';
import SheetManager from '../MultiSheet/SheetManager';
import TableManager from '../MultiSheet/TableManager';
import TableConfigModal from '../MultiSheet/TableConfigModal';

const StepMultiSheetConfig = () => {
  const { editingTableConfig } = useSelector((state) => state.reportBuilder.wizard);

  return (
    <div className="space-y-0 -mx-6 -mt-6">
      {/* Sheet tabs at the top */}
      <SheetManager />

      {/* Table cards for the active sheet */}
      <TableManager />

      {/* Table configuration modal (full screen overlay when editing a table) */}
      {editingTableConfig && <TableConfigModal />}
    </div>
  );
};

export default StepMultiSheetConfig;
