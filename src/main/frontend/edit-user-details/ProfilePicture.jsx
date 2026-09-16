import React from 'react';
import {Button} from '@jahia/moonstone';

/**
 * The profile picture, shown beside the page title rather than inside the About
 * block, so that block holds nothing but what the user wrote about themselves.
 * Clicking the picture opens its editor, which appears in the same header.
 */
export default function ProfilePicture({profile, activeEditor}) {
  const picture = profile.picture;
  const onCancel = () => window.userDashboardReactActions?.closeEditor?.();

  if (activeEditor === 'picture') {
    return (
      <div className="ud-pictureEditor">
        <img className="ud-pictureEditor__preview" src={picture.src} alt={picture.alt}/>
        <div className="ud-pictureEditor__form">
          <div className="ud-private-field">
            <label className="ud-private-field__label" htmlFor="uploadedImage">{picture.editLabel}</label>
            <input id="uploadedImage" className="ud-private-fileInput" type="file" name="file"/>
          </div>
          <div className="ud-private-form__actions">
            <Button label={picture.cancelLabel} variant="outlined" onClick={onCancel}/>
            <Button label={picture.deleteLabel} color="danger" onClick={() => window.userDashboardReactActions?.deletePicture?.()}/>
            <Button label={picture.saveLabel} color="accent" onClick={() => window.userDashboardReactActions?.savePicture?.()}/>
          </div>
          <div>
            <span id="imageUploadError" style={{display: 'none'}}>{picture.errors.upload}</span>
            <span id="imageUploadNameError" style={{display: 'none'}}>{picture.errors.name}</span>
            <span id="imageUploadEmptyError" style={{display: 'none'}}>{picture.errors.empty}</span>
          </div>
          <div className="imageField otherErrorsMessage hide">
            <div>{picture.otherErrorsLabel}</div>
            <div>
              {picture.otherErrorsHelp}
              {' '}
              <a href="#" onClick={event => {
                event.preventDefault();
                window.goToStart?.();
              }}>{picture.startPageLabel}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!picture.canEdit) {
    return <img className="ud-profilePicture" src={picture.src} alt={picture.alt}/>;
  }

  return (
    <button
      type="button"
      className="ud-profilePicture__button"
      title={picture.editLabel}
      aria-label={picture.editLabel}
      onClick={() => window.userDashboardReactActions?.showPictureEditor?.()}
    >
      <img className="ud-profilePicture" src={picture.src} alt={picture.alt}/>
    </button>
  );
}
