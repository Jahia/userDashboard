import React from 'react';
import {Paper, Typography} from '@jahia/moonstone';

export default function PrivatePasswordCard({section}) {
  return (
    <Paper className="ud-private-card">
      <div className="ud-private-card__body">
        <div className="ud-private-passwordCard">
          <Typography component="p" variant="body" className="ud-private-card__value">{section.maskedValue}</Typography>
          <span id="passwordSuccess" className="ud-private-passwordCard__status" style={{display: 'none'}}/>
        </div>
      </div>
    </Paper>
  );
}
