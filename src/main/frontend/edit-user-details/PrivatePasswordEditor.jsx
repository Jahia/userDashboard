import React from 'react';
import {Banner, Button, Input} from '@jahia/moonstone';

const FIELDS = [
  {id: 'oldPasswordField', name: 'oldpassword', labelKey: 'oldPasswordLabel'},
  {id: 'passwordField', name: 'password', labelKey: 'passwordLabel'},
  {id: 'passwordconfirm', name: 'passwordconfirm', labelKey: 'confirmPasswordLabel'}
];

export default function PrivatePasswordEditor({section, feedback}) {
  const onCancel = () => window.userDashboardReactActions?.closeEditor?.();
  const onSave = () => window.userDashboardReactActions?.savePassword?.(section.messages);

  return (
    <div className="ud-private-formWrap">
      <div className="ud-private-form">
        {feedback && (
          <Banner variant="warning" title={feedback.message}>
            {''}
          </Banner>
        )}
        {FIELDS.map(field => (
          <div key={field.name} className="ud-private-field">
            <label className="ud-private-field__label" htmlFor={field.id}>{section[field.labelKey]}</label>
            <Input
              className="ud-private-input password"
              type="password"
              id={field.id}
              name={field.name}
              autoComplete="off"
            />
          </div>
        ))}
        <div className="ud-private-form__actions">
          <Button label={section.cancelLabel} variant="outlined" onClick={onCancel}/>
          <Button label={section.saveLabel} color="accent" onClick={onSave}/>
        </div>
        <div className="errorMessage hide">
          <span id="passwordErrors" style={{display: 'none'}}/>
        </div>
        <div className="passwordField otherErrorsMessage hide">
          <div>{section.otherErrorsLabel}</div>
          <div>
            {section.otherErrorsHelp}
            {' '}
            <a href="#" onClick={event => {
              event.preventDefault();
              window.goToStart?.();
            }}>{section.startPageLabel}</a>
          </div>
        </div>
      </div>
    </div>
  );
}
