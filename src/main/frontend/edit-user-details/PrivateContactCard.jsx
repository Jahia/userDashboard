import React from 'react';
import {Typography} from '@jahia/moonstone';

const hasText = value => Boolean(value && value.trim());

export default function PrivateContactCard({section}) {
  const contactRows = section.contactRows.filter(row => hasText(row.value));
  const addressLines = section.addressLines.filter(hasText);

  if (contactRows.length === 0 && addressLines.length === 0) {
    return <Typography component="p" variant="caption" className="ud-private-card__placeholder">{section.emptyLabel}</Typography>;
  }

  return (
    <div className="ud-private-contactCard">
      {contactRows.length > 0 && (
        <dl className="ud-private-list">
          {contactRows.map(row => (
            <React.Fragment key={row.label}>
              <Typography component="dt" variant="caption">{row.label}</Typography>
              <Typography component="dd" variant="body">{row.value}</Typography>
            </React.Fragment>
          ))}
        </dl>
      )}
      {addressLines.length > 0 && (
        <div className="ud-private-addressBlock">
          <Typography component="h4" variant="subheading">{section.addressLabel}</Typography>
          <div>
            {addressLines.map(line => (
              <Typography key={line} component="div" variant="body">{line}</Typography>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
