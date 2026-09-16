import React from 'react';
import {Button, Paper, Typography} from '@jahia/moonstone';

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
    <Paper className={`ud-private-card${embedded ? ' ud-private-card--embedded' : ''}`}>
      <div className="ud-private-card__body">
        <div className={`ud-private-card__header${showTitle ? '' : ' ud-private-card__header--actionsOnly'}`}>
          {showTitle && <Typography component="h3" variant="heading">{section.title}</Typography>}
          {showEdit && section.canEdit && (
            <Button label={section.editLabel} variant="outlined" onClick={onEdit}/>
          )}
        </div>
        {hasText(value) ? (
          <Typography component="p" variant="body" className="ud-private-card__value">{value}</Typography>
        ) : (
          <Typography component="p" variant="caption" className="ud-private-card__placeholder">{section.emptyLabel}</Typography>
        )}
      </div>
    </Paper>
  );
}
