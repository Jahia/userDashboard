import React from 'react';
import {Typography} from '@jahia/moonstone';

export default function PrivatePasswordCard({section}) {
  return (
    <div className="ud-private-passwordCard">
      <Typography component="p" variant="body" className="ud-private-card__value">{section.maskedValue}</Typography>
      <span id="passwordSuccess" className="ud-private-passwordCard__status" style={{display: 'none'}}/>
    </div>
  );
}
