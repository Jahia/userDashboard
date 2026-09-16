import React from 'react';
import {Banner, Typography} from '@jahia/moonstone';

export default function PrivatePasswordCard({section, feedback}) {
  return (
    <div className="ud-private-passwordCard">
      <Typography component="p" variant="subheading" className="ud-private-card__value">{section.maskedValue}</Typography>
      {feedback && (
        <Banner variant="info" title={feedback.message}>
          {''}
        </Banner>
      )}
      <span id="passwordSuccess" className="ud-private-passwordCard__status" style={{display: 'none'}}/>
    </div>
  );
}
