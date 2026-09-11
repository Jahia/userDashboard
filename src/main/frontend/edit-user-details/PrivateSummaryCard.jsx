import React from 'react';
import UiButton from './UiButton';

const hasText = value => Boolean(value && value.trim());

const getDisplayValue = section => {
  if (Array.isArray(section.parts)) {
    return section.parts.filter(hasText).join(' ');
  }

  return section.value || '';
};

export default function PrivateSummaryCard({section, embedded = false, showTitle = true, showEdit = true}) {
  const onEdit = () => section.onEditAction && window.userDashboardReactActions?.[section.onEditAction]?.();
  const value = getDisplayValue(section);

  return (
    <div className={`ud-private-card${embedded ? ' ud-private-card--embedded' : ''}`}>
      <div className="ud-private-card__body">
        <div className={`ud-private-card__header${showTitle ? '' : ' ud-private-card__header--actionsOnly'}`}>
          {showTitle && <h3>{section.title}</h3>}
          {showEdit && section.canEdit && (
            <UiButton label={section.editLabel} variant="outlined" onClick={onEdit} />
          )}
        </div>
        {hasText(value) ? (
          <p className="ud-private-card__value">{value}</p>
        ) : (
          <p className="ud-private-card__placeholder">{section.emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
