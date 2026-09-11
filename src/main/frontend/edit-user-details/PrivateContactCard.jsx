import React from 'react';

const hasText = value => Boolean(value && value.trim());

export default function PrivateContactCard({section}) {
  const contactRows = section.contactRows.filter(row => hasText(row.value));
  const addressLines = section.addressLines.filter(hasText);

  return (
    <div className="ud-private-card">
      <div className="ud-private-card__body">
        {contactRows.length > 0 || addressLines.length > 0 ? (
          <div className="ud-private-contactCard">
            {contactRows.length > 0 && (
              <dl className="ud-private-list">
                {contactRows.map(row => (
                  <React.Fragment key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </React.Fragment>
                ))}
              </dl>
            )}
            {addressLines.length > 0 && (
              <div className="ud-private-addressBlock">
                <h4>{section.addressLabel}</h4>
                <div>
                  {addressLines.map(line => (
                    <div key={line}>{line}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="ud-private-card__placeholder">{section.emptyLabel}</p>
        )}
      </div>
    </div>
  );
}
