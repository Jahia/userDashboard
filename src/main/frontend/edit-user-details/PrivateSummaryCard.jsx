import React from 'react';
import {Typography} from '@jahia/moonstone';

const hasText = value => Boolean(value && value.trim());

const getDisplayValue = section => {
  if (Array.isArray(section.parts)) {
    return section.parts.filter(hasText).join(' ');
  }

  return section.value || '';
};

// hideWhenEmpty: show nothing rather than the section's name when it holds no value, for a line
// that only adds to another one (the profession under the user's name).
export default function PrivateSummaryCard({section, hideWhenEmpty = false}) {
  const value = getDisplayValue(section);

  if (!hasText(value) && hideWhenEmpty) {
    return null;
  }

  return hasText(value) ? (
    <Typography component="p" variant="subheading" className="ud-private-card__value">{value}</Typography>
  ) : (
    <Typography component="p" variant="subheading" className="ud-private-card__placeholder">{section.emptyLabel}</Typography>
  );
}
