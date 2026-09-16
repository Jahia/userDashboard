import React, {useEffect} from 'react';
import {Button, Typography} from '@jahia/moonstone';

const hasText = value => Boolean(value && value.trim());

/**
 * What the user wrote about themselves, and nothing else - the picture that used to
 * sit beside it now lives next to the page title (see ProfilePicture.jsx).
 */
export default function PrivateAboutSection({profile, activeEditor}) {
  useEffect(() => {
    if (activeEditor !== 'about') {
      const existingEditor = window.CKEDITOR?.instances?.about_editor;
      if (existingEditor) {
        existingEditor.destroy(true);
      }

      return;
    }

    if (window.CKEDITOR && !window.CKEDITOR.instances?.about_editor) {
      window.CKEDITOR.replace('about_editor');
    }

    return () => {
      const existingEditor = window.CKEDITOR?.instances?.about_editor;
      if (existingEditor) {
        existingEditor.destroy(true);
      }
    };
  }, [activeEditor]);

  const onCancel = () => window.userDashboardReactActions?.closeEditor?.();

  if (activeEditor === 'about') {
    return (
      <div className="ud-private-formWrap">
        <div className="ud-private-form">
          <textarea id="about_editor" defaultValue={profile.about.sourceValue}/>
          <div className="ud-private-form__actions">
            <Button label={profile.about.cancelLabel} variant="outlined" onClick={onCancel}/>
            <Button label={profile.about.saveLabel} color="accent" onClick={() => window.userDashboardReactActions?.saveAbout?.()}/>
          </div>
          <div className="aboutField errorMessage hide"/>
          <div className="aboutField otherErrorsMessage hide">
            <div>{profile.about.otherErrorsLabel}</div>
            <div>
              {profile.about.otherErrorsHelp}
              {' '}
              <a href="#" onClick={event => {
                event.preventDefault();
                window.goToStart?.();
              }}>{profile.about.startPageLabel}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Typography renders children, so it cannot carry raw HTML; the class below gives
  // this block the same font as the rest of the page instead
  return hasText(profile.about.html) ? (
    <div className="ud-private-about" dangerouslySetInnerHTML={{__html: profile.about.html}}/>
  ) : (
    <Typography component="p" variant="body" className="ud-private-card__placeholder">{profile.about.emptyLabel}</Typography>
  );
}
