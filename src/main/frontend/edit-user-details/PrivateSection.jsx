import React from 'react';
import {Fieldset, Paper} from '@jahia/moonstone';

/**
 * One block of the profile: a Moonstone surface holding a Moonstone fieldset, which
 * carries the section's title and a slot for its edit button. The page used to draw
 * this itself - a rounded, gradient-filled card in the JSP with a Paper nested inside
 * it - which was two surfaces where the design system offers one.
 */
export default function PrivateSection({id, label, buttons, children}) {
  return (
    <Paper className="ud-private-section">
      <Fieldset id={id} label={label} buttons={buttons}>
        {children}
      </Fieldset>
    </Paper>
  );
}
