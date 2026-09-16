import React from 'react';
import {Typography} from '@jahia/moonstone';

const hasText = value => Boolean(value && value.trim());

const getDisplayValue = section => {
  if (Array.isArray(section.parts)) {
    return section.parts.filter(hasText).join(' ');
  }

  return section.value || '';
};

export default function PrivateSummaryCard({section}) {
  const value = getDisplayValue(section);

  return hasText(value) ? (
    <Typography component="p" variant="subheading" className="ud-private-card__value">{value}</Typography>
  ) : (
    <Typography component="p" variant="subheading" className="ud-private-card__placeholder">{section.emptyLabel}</Typography>
  );
}
