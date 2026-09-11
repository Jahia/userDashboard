import React from 'react';
import UiButton from './UiButton';

const renderField = field => {
  if (field.type === 'select') {
    return (
      <select
        className={field.className}
        name={field.name}
        defaultValue={field.value}
        disabled={field.disabled}
      >
        {field.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      data-undefined={String(field.dataUndefined)}
      id={field.id}
      className={field.className}
      name={field.name}
      type={field.type || 'text'}
      defaultValue={field.value}
      disabled={field.disabled}
      jcrtype={field.jcrtype}
      autoComplete={field.autoComplete}
    />
  );
};

export default function PrivateFieldsForm({section}) {
  const onCancel = () => window.userDashboardReactActions?.closeEditor?.();
  const onSave = () => section.onSaveAction && window.userDashboardReactActions?.[section.onSaveAction]?.();
  const visibleFields = section.fields.filter(field => field.visible !== false);
  const errorClasses = [section.errorClass, ...(section.extraErrorClasses || [])].filter(Boolean);

  return (
    <div className="ud-private-formWrap">
      <div className="ud-private-form">
        {visibleFields.map(field => (
          <div key={field.name} className="ud-private-field">
            <label className="ud-private-field__label" htmlFor={field.id || field.name}>{field.label}</label>
            {renderField(field)}
          </div>
        ))}
        <div className="ud-private-form__actions">
          <UiButton label={section.cancelLabel} variant="outlined" onClick={onCancel} />
          <UiButton label={section.saveLabel} color="accent" onClick={onSave} />
        </div>
        {errorClasses.map(errorClass => (
          <div key={`${errorClass}-error`} className={`${errorClass} errorMessage hide`} />
        ))}
        {section.extraErrors?.map(error => (
          <div key={error.id} id={error.id} style={{display: 'none'}}>{error.label}</div>
        ))}
        {errorClasses.map(errorClass => (
          <div key={`${errorClass}-other`} className={`${errorClass} otherErrorsMessage hide`}>
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
        ))}
      </div>
    </div>
  );
}
