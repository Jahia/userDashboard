import React, {useEffect} from 'react';
import UiButton from './UiButton';

const hasText = value => Boolean(value && value.trim());

export default function PrivateHeroSection({profile, activeEditor, embedded = false, showTitle = true, showEdit = true}) {
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

  if (activeEditor === 'picture') {
    return (
      <div className="ud-private-formWrap">
        <div className="ud-private-heroEditor">
          <div className="ud-private-heroEditor__preview">
            <img className="ud-private-hero__avatar" src={profile.picture.src} alt={profile.picture.alt} />
          </div>
          <div className="ud-private-form">
            <div className="ud-private-field">
              <label className="ud-private-field__label" htmlFor="uploadedImage">{profile.picture.editLabel}</label>
              <input id="uploadedImage" className="ud-private-fileInput" type="file" name="file" />
            </div>
            <div className="ud-private-form__actions">
              <UiButton label={profile.picture.cancelLabel} variant="outlined" onClick={onCancel} />
              <button type="button" className="ud-private-actionButton ud-private-actionButton--danger" onClick={() => window.userDashboardReactActions?.deletePicture?.()}>{profile.picture.deleteLabel}</button>
              <UiButton label={profile.picture.saveLabel} color="accent" onClick={() => window.userDashboardReactActions?.savePicture?.()} />
            </div>
            <div>
              <span id="imageUploadError" style={{display: 'none'}}>{profile.picture.errors.upload}</span>
              <span id="imageUploadNameError" style={{display: 'none'}}>{profile.picture.errors.name}</span>
              <span id="imageUploadEmptyError" style={{display: 'none'}}>{profile.picture.errors.empty}</span>
            </div>
            <div className="imageField otherErrorsMessage hide">
              <div>{profile.picture.otherErrorsLabel}</div>
              <div>
                {profile.picture.otherErrorsHelp}
                {' '}
                <a href="#" onClick={event => {
                  event.preventDefault();
                  window.goToStart?.();
                }}>{profile.picture.startPageLabel}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeEditor === 'about') {
    return (
      <div className="ud-private-formWrap">
        <div className="ud-private-form">
          <textarea id="about_editor" defaultValue={profile.about.sourceValue} />
          <div className="ud-private-form__actions">
            <UiButton label={profile.about.cancelLabel} variant="outlined" onClick={onCancel} />
            <UiButton label={profile.about.saveLabel} color="accent" onClick={() => window.userDashboardReactActions?.saveAbout?.()} />
          </div>
          <div className="aboutField errorMessage hide" />
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

  const showPictureEditor = () => window.userDashboardReactActions?.showPictureEditor?.();
  const showAboutEditor = () => window.userDashboardReactActions?.showAboutEditor?.();

  return (
    <section className={`ud-private-hero${embedded ? ' ud-private-hero--embedded' : ''}`}>
      <div className="ud-private-hero__media">
        {profile.picture.canEdit ? (
          <button
            type="button"
            className="ud-private-hero__avatarButton"
            onClick={showPictureEditor}
            title={profile.picture.editLabel}
            aria-label={profile.picture.editLabel}
          >
            <img className="ud-private-hero__avatar" src={profile.picture.src} alt={profile.picture.alt} />
          </button>
        ) : (
          <img className="ud-private-hero__avatar" src={profile.picture.src} alt={profile.picture.alt} />
        )}
      </div>
      <div className="ud-private-hero__content">
        <div className="ud-private-hero__copy">
          {showTitle && <span className="ud-private-hero__eyebrow">{profile.about.title}</span>}
          {hasText(profile.about.html) ? (
            <div
              className="ud-private-hero__about"
              dangerouslySetInnerHTML={{__html: profile.about.html}}
            />
          ) : (
            <p className="ud-private-hero__placeholder">{profile.about.emptyLabel}</p>
          )}
        </div>
        {showEdit && profile.about.canEdit && (
          <div className="ud-private-hero__actions">
            <UiButton label={profile.about.editLabel} variant="outlined" onClick={showAboutEditor} />
          </div>
        )}
      </div>
    </section>
  );
}
