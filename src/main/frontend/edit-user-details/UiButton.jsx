import React from 'react';

export default function UiButton({
  label,
  variant = 'default',
  color = 'default',
  type = 'button',
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'ud-uiButton',
    variant === 'outlined' ? 'ud-uiButton--outlined' : 'ud-uiButton--solid',
    color === 'accent' ? 'ud-uiButton--accent' : 'ud-uiButton--default',
    className
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} onClick={onClick} {...props}>
      {label}
    </button>
  );
}