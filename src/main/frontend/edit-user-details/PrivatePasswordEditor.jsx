import React from 'react';
import UiButton from './UiButton';

export default function PrivatePasswordEditor({section}) {
  const onCancel = () => window.userDashboardReactActions?.closeEditor?.();
  const onSave = () => window.userDashboardReactActions?.savePassword?.(section.messages);

  return (
    <div className="ud-private-formWrap">
      <div className="ud-private-form">
        <div className="ud-private-field">
          <label className="ud-private-field__label" htmlFor="oldPasswordField">{section.oldPasswordLabel}</label>
          <input className="ud-private-input password" type="password" id="oldPasswordField" name="oldpassword" autoComplete="off" />
        </div>
        <div className="ud-private-field">
          <label className="ud-private-field__label" htmlFor="passwordField">{section.passwordLabel}</label>
          <input className="ud-private-input password" type="password" id="passwordField" name="password" autoComplete="off" />
        </div>
        <div className="ud-private-field">
          <label className="ud-private-field__label" htmlFor="passwordconfirm">{section.confirmPasswordLabel}</label>
          <input className="ud-private-input password" type="password" id="passwordconfirm" name="passwordconfirm" autoComplete="off" />
        </div>
        <div className="ud-private-form__actions">
          <UiButton label={section.cancelLabel} variant="outlined" onClick={onCancel} />
          <UiButton label={section.saveLabel} color="accent" onClick={onSave} />
        </div>
        <div className="errorMessage hide">
          <span id="passwordErrors" style={{display: 'none'}} />
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
