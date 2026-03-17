import React from 'react';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    {Icon && (
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-slate-200">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
    )}
    <h3 className="text-sm font-bold text-slate-900 mb-2">{title}</h3>
    {description && <p className="text-xs text-slate-400 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
