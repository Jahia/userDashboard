import React from 'react';

const hasText = value => Boolean(value && value.trim());

export default function PrivatePreferencesCard({section}) {
  const rows = section.rows.filter(row => hasText(row.value));

  return (
    <div className="ud-private-card">
      <div className="ud-private-card__body">
        {rows.length > 0 ? (
          <dl className="ud-private-list">
            {rows.map(row => (
              <React.Fragment key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </React.Fragment>
            ))}
          </dl>
        ) : (
          <p className="ud-private-card__placeholder">{section.emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
