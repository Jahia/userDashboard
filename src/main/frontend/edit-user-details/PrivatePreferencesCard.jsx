import React from 'react';
import {Typography} from '@jahia/moonstone';

const hasText = value => Boolean(value && value.trim());

export default function PrivatePreferencesCard({section}) {
  const rows = section.rows.filter(row => hasText(row.value));

  if (rows.length === 0) {
    return <Typography component="p" variant="body" className="ud-private-card__placeholder">{section.emptyLabel}</Typography>;
  }

  return (
    <dl className="ud-private-list">
      {rows.map(row => (
        <React.Fragment key={row.label}>
          <Typography component="dt" variant="body">{row.label}</Typography>
          <Typography component="dd" variant="body">{row.value}</Typography>
        </React.Fragment>
      ))}
    </dl>
  );
}
