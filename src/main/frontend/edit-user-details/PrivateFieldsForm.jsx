import React, {useState} from 'react';
import {Button, Dropdown, Input} from '@jahia/moonstone';

/**
 * A Dropdown is controlled and renders no form control of its own, so the value it
 * holds is mirrored into a hidden input. That input carries the name, the jcrtype
 * and the marker class the save path collects, exactly as the select it replaces did.
 */
function SelectField({field}) {
  const [value, setValue] = useState(field.value || '');
  const options = field.options.map(option => ({label: option.label, value: option.value}));
  const selected = options.find(option => option.value === value);

  return (
    <>
      <Dropdown
        id={field.id}
        size="medium"
        variant="outlined"
        data={options}
        value={value}
        label={selected ? selected.label : undefined}
        isDisabled={field.disabled}
        onChange={(event, item) => setValue(item.value)}
      />
      <input
        type="hidden"
        data-undefined={String(field.dataUndefined)}
        className={field.className}
        name={field.name}
        value={value}
        disabled={field.disabled}
        jcrtype={field.jcrtype}
        readOnly
      />
    </>
  );
}

const renderField = field => {
  if (field.type === 'select') {
    return <SelectField field={field}/>;
  }

  return (
    <Input
      data-undefined={String(field.dataUndefined)}
      id={field.id}
      className={field.className}
      name={field.name}
      type={field.type || 'text'}
      defaultValue={field.value}
      isDisabled={field.disabled}
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
          <Button label={section.cancelLabel} variant="outlined" onClick={onCancel}/>
          <Button label={section.saveLabel} color="accent" onClick={onSave}/>
        </div>
        {errorClasses.map(errorClass => (
          <div key={`${errorClass}-error`} className={`${errorClass} errorMessage hide`}/>
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
