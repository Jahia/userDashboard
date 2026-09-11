import React from 'react';

export default function PrivatePasswordCard({section}) {
  return (
    <div className="ud-private-card">
      <div className="ud-private-card__body">
        <div className="ud-private-passwordCard">
          <p className="ud-private-card__value">{section.maskedValue}</p>
          <span id="passwordSuccess" className="ud-private-passwordCard__status" style={{display: 'none'}} />
        </div>
      </div>
    </div>
  );
}
