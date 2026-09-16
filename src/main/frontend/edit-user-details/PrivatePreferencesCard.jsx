import React from 'react';
import {Paper, Typography} from '@jahia/moonstone';

const hasText = value => Boolean(value && value.trim());

export default function PrivatePreferencesCard({section}) {
  const rows = section.rows.filter(row => hasText(row.value));

  return (
    <Paper className="ud-private-card">
      <div className="ud-private-card__body">
        {rows.length > 0 ? (
          <dl className="ud-private-list">
            {rows.map(row => (
              <React.Fragment key={row.label}>
                <Typography component="dt" variant="caption">{row.label}</Typography>
                <Typography component="dd" variant="body">{row.value}</Typography>
              </React.Fragment>
            ))}
          </dl>
        ) : (
          <Typography component="p" variant="caption" className="ud-private-card__placeholder">{section.emptyLabel}</Typography>
        )}
      </div>
    </Paper>
  );
}
