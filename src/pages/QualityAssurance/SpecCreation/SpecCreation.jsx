import { useState } from 'react';
import SpecList from './SpecList';
import SpecForm from './SpecForm';

const SpecCreation = () => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'edit'
  const [editId, setEditId] = useState(null);

  const handleCreateNew = () => { setEditId(null); setView('create'); };
  const handleEdit = (id) => { setEditId(id); setView('edit'); };
  const handleBack = () => { setView('list'); setEditId(null); };

  return (
    <div className="h-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden">
      <div className="flex flex-col flex-1 bg-white rounded-xl shadow border border-slate-200 overflow-hidden m-2">
        {view === 'list' && <SpecList onCreateNew={handleCreateNew} onEdit={handleEdit} />}
        {(view === 'create' || view === 'edit') && <SpecForm specId={editId} onBack={handleBack} />}
      </div>
    </div>
  );
};

export default SpecCreation;
