const StatCard = ({ title, value, unit = '', icon, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    amber: 'from-amber-500 to-amber-600 shadow-amber-200',
    rose: 'from-rose-500 to-rose-600 shadow-rose-200',
    indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
    purple: 'from-purple-500 to-purple-600 shadow-purple-200',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-200',
    orange: 'from-orange-500 to-orange-600 shadow-orange-200',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-3 shadow-lg text-white flex flex-col justify-between min-h-[80px]`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{title}</span>
        {icon && <span className="opacity-60">{icon}</span>}
      </div>
      <div className="mt-1">
        <span className="text-xl font-black">{value ?? '—'}</span>
        {unit && <span className="text-[10px] ml-1 opacity-80">{unit}</span>}
      </div>
    </div>
  );
};

export default StatCard;
