import React, {useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';

import './app.css';
import PrivateContactCard from './PrivateContactCard';
import PrivateFieldsForm from './PrivateFieldsForm';
import PrivateAboutSection from './PrivateAboutSection';
import PrivatePasswordCard from './PrivatePasswordCard';
import PrivatePasswordEditor from './PrivatePasswordEditor';
import PrivatePreferencesCard from './PrivatePreferencesCard';
import PrivateSection from './PrivateSection';
import PrivateSummaryCard from './PrivateSummaryCard';
import ProfilePicture from './ProfilePicture';
import {Button, Typography} from '@jahia/moonstone';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

const getFieldValue = name => {
  const field = document.getElementsByName(name)[0];

  return field ? field.value : '';
};

const updateFields = (fields, values) => fields.map(field => (
  hasOwn(values, field.name) ? {...field, value: values[field.name]} : field
));

const getProfessionParts = (functionTitle, organization, atLabel) => [
  functionTitle,
  organization ? atLabel : '',
  organization
];

const getIdentityProfessionSection = (privateSections, professionAtLabel, identityProfessionLabel) => {
  if (!privateSections?.identity || !privateSections?.profession) {
    return null;
  }

  return {
    ...privateSections.identity,
    title: identityProfessionLabel,
    onEditAction: 'showIdentityProfessionEditor',
    onSaveAction: 'saveIdentityProfession',
    errorClass: 'namesField',
    extraErrorClasses: ['professionField'],
    fields: [
      ...privateSections.identity.fields,
      ...privateSections.profession.fields
    ],
    canEdit: privateSections.identity.canEdit || privateSections.profession.canEdit,
    editLabel: privateSections.identity.editLabel,
    cancelLabel: privateSections.identity.cancelLabel,
    saveLabel: privateSections.identity.saveLabel,
    otherErrorsLabel: privateSections.identity.otherErrorsLabel,
    otherErrorsHelp: privateSections.identity.otherErrorsHelp,
    startPageLabel: privateSections.identity.startPageLabel,
    emptyLabel: privateSections.identity.emptyLabel,
    professionAtLabel: professionAtLabel || ''
  };
};

const getOptionLabel = (field, value) => {
  const option = field?.options?.find(item => item.value === value);

  return option ? option.label : value;
};

const getEditorValue = () => {
  if (typeof window.CKEDITOR !== 'undefined') {
    return window.CKEDITOR.instances?.about_editor?.getData().trim() || '';
  }

  return document.getElementById('about_editor')?.value.trim() || '';
};

export default function App({config}) {
  const [activeEditor, setActiveEditor] = useState(null);
  const [passwordFeedback, setPasswordFeedback] = useState(null);
  const [privateProfile, setPrivateProfile] = useState(config.privateProfile);
  const [privateSections, setPrivateSections] = useState(config.privateSections);
  const picturePreviewUrlRef = useRef(null);
  const privateRoot = document.getElementById('editUserDetailsPrivateHeroRoot');
  const identityRoot = document.getElementById('editUserDetailsPrivateIdentityRoot');
  const contactRoot = document.getElementById('editUserDetailsPrivateContactRoot');
  const passwordRoot = document.getElementById('editUserDetailsPrivatePasswordRoot');
  const preferencesRoot = document.getElementById('editUserDetailsPrivatePreferencesRoot');

  useEffect(() => {
    return () => {
      if (picturePreviewUrlRef.current) {
        URL.revokeObjectURL(picturePreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const closeEditor = () => setActiveEditor(null);
    const preferencesSection = privateSections?.preferences;
    const professionAtLabel = config.professionAtLabel || '';
    const identityProfessionSection = getIdentityProfessionSection(privateSections, professionAtLabel, config.identityProfessionLabel);

    window.userDashboardReactActions = {
      showPictureEditor: () => setActiveEditor('picture'),
      showAboutEditor: () => setActiveEditor('about'),
      showNamesEditor: () => setActiveEditor('names'),
      showProfessionEditor: () => setActiveEditor('profession'),
      showIdentityProfessionEditor: () => setActiveEditor('identityProfession'),
      showAddressEditor: () => setActiveEditor('address'),
      showPasswordEditor: () => {
        setPasswordFeedback(null);
        setActiveEditor('password');
      },
      showOtherEditor: () => setActiveEditor('other'),
      hidePrivateEditors: () => setActiveEditor(null),
      closeEditor,
      saveNames: () => {
        const values = {
          'j:firstName': getFieldValue('j:firstName'),
          'j:lastName': getFieldValue('j:lastName')
        };

        window.updateProperties?.('namesField', {
          onSuccess: () => {
            setPrivateSections(previous => ({
              ...previous,
              identity: {
                ...previous.identity,
                parts: [values['j:firstName'], values['j:lastName']],
                fields: updateFields(previous.identity.fields, values)
              }
            }));
            closeEditor();
          }
        });
      },
      saveProfession: () => {
        const values = {
          'j:function': getFieldValue('j:function'),
          'j:organization': getFieldValue('j:organization')
        };

        window.updateProperties?.('professionField', {
          onSuccess: () => {
            setPrivateSections(previous => ({
              ...previous,
              profession: {
                ...previous.profession,
                parts: getProfessionParts(values['j:function'], values['j:organization'], professionAtLabel),
                fields: updateFields(previous.profession.fields, values)
              }
            }));
            closeEditor();
          }
        });
      },
      saveIdentityProfession: () => {
        const values = {
          'j:firstName': getFieldValue('j:firstName'),
          'j:lastName': getFieldValue('j:lastName'),
          'j:function': getFieldValue('j:function'),
          'j:organization': getFieldValue('j:organization')
        };

        window.updateProperties?.('namesField', {
          onSuccess: () => {
            window.updateProperties?.('professionField', {
              onSuccess: () => {
                setPrivateSections(previous => ({
                  ...previous,
                  identity: {
                    ...previous.identity,
                    parts: [values['j:firstName'], values['j:lastName']],
                    fields: updateFields(previous.identity.fields, values)
                  },
                  profession: {
                    ...previous.profession,
                    parts: getProfessionParts(values['j:function'], values['j:organization'], identityProfessionSection?.professionAtLabel || ''),
                    fields: updateFields(previous.profession.fields, values)
                  }
                }));
                closeEditor();
              }
            });
          }
        });
      },
      saveAddress: () => {
        const values = {
          'j:address': getFieldValue('j:address'),
          'j:zipCode': getFieldValue('j:zipCode'),
          'j:city': getFieldValue('j:city'),
          'j:country': getFieldValue('j:country'),
          'j:phoneNumber': getFieldValue('j:phoneNumber'),
          'j:mobileNumber': getFieldValue('j:mobileNumber'),
          'j:altNumber': getFieldValue('j:altNumber'),
          'j:email': getFieldValue('j:email')
        };

        window.updateAddressProperties?.({
          onSuccess: () => {
            setPrivateSections(previous => ({
              ...previous,
              contact: {
                ...previous.contact,
                contactRows: previous.contact.contactRows.map(row => {
                  if (row.label === previous.contact.contactRows[0].label) {
                    return {...row, value: values['j:email']};
                  }
                  if (row.label === previous.contact.contactRows[1].label) {
                    return {...row, value: values['j:phoneNumber']};
                  }
                  if (row.label === previous.contact.contactRows[2].label) {
                    return {...row, value: values['j:mobileNumber']};
                  }
                  if (row.label === previous.contact.contactRows[3].label) {
                    return {...row, value: values['j:altNumber']};
                  }

                  return row;
                }),
                addressLines: [values['j:address'], values['j:zipCode'], values['j:city'], values['j:country']],
                fields: updateFields(previous.contact.fields, values)
              }
            }));
            closeEditor();
          }
        });
      },
      saveOther: () => {
        const preferredLanguageField = preferencesSection?.fields?.find(field => field.name === 'preferredLanguage');
        const timeZoneField = preferencesSection?.fields?.find(field => field.name === 'timeZone');
        const preferredLanguage = getFieldValue('preferredLanguage');
        const preferredLanguageLabel = getOptionLabel(preferredLanguageField, preferredLanguage);
        const timeZone = getFieldValue('timeZone');
        const timeZoneLabel = timeZone ? getOptionLabel(timeZoneField, timeZone) : '';

        window.updateProperties?.('otherField', {
          onSuccess: () => {
            const nextPreferenceRows = {
              preferredLanguage: preferredLanguageLabel,
              timeZone: timeZoneLabel
            };
            const nextPreferenceFields = {preferredLanguage};
            if (typeof timeZone !== 'undefined') {
              nextPreferenceFields.timeZone = timeZone;
            }

            setPrivateSections(previous => ({
              ...previous,
              preferences: {
                ...previous.preferences,
                rows: previous.preferences.rows.map(row => (
                  Object.prototype.hasOwnProperty.call(nextPreferenceRows, row.name)
                    ? {...row, value: nextPreferenceRows[row.name]}
                    : row
                )),
                fields: updateFields(previous.preferences.fields, nextPreferenceFields)
              }
            }));
            closeEditor();
          }
        });
      },
      saveAbout: () => {
        const aboutValue = getEditorValue();

        window.saveCkEditorChanges?.(privateProfile.about.userId, {
          onSuccess: () => {
            setPrivateProfile(previous => ({
              ...previous,
              about: {
                ...previous.about,
                html: aboutValue,
                sourceValue: aboutValue
              }
            }));
            closeEditor();
          }
        });
      },
      savePicture: () => {
        const uploadedImageField = document.getElementById('uploadedImage');
        const uploadedFile = uploadedImageField?.files?.[0];
        let previewUrl = privateProfile.picture.src;

        if (uploadedFile) {
          if (picturePreviewUrlRef.current) {
            URL.revokeObjectURL(picturePreviewUrlRef.current);
          }

          previewUrl = URL.createObjectURL(uploadedFile);
          picturePreviewUrlRef.current = previewUrl;
        }

        window.updatePhoto?.(window.context, privateProfile.picture.userId, {
          onSuccess: () => {
            setPrivateProfile(previous => ({
              ...previous,
              picture: {
                ...previous.picture,
                src: previewUrl
              }
            }));
            closeEditor();
          }
        });
      },
      deletePicture: () => {
        if (picturePreviewUrlRef.current) {
          URL.revokeObjectURL(picturePreviewUrlRef.current);
          picturePreviewUrlRef.current = null;
        }

        window.deletePhoto?.(privateProfile.picture.userId, {
          onSuccess: () => {
            setPrivateProfile(previous => ({
              ...previous,
              picture: {
                ...previous.picture,
                src: ''
              }
            }));
            closeEditor();
          }
        });
      },
      savePassword: messages => {
        setPasswordFeedback(null);
        window.changePassword?.(
          messages.oldPasswordMandatory,
          messages.confirmationMandatory,
          messages.passwordMandatory,
          messages.passwordNotMatching,
          {
            genericErrorMessage: messages.genericError,
            sameAsOldMessage: messages.passwordSameAsOld,
            onError: message => setPasswordFeedback({type: 'error', message}),
            onSuccess: result => {
              setPasswordFeedback({type: 'success', message: result?.errorMessage || messages.passwordChanged});
              closeEditor();
            }
          }
        );
      }
    };

    return () => {
      delete window.userDashboardReactActions;
    };
  }, [privateProfile.about.userId, privateProfile.picture.src, privateProfile.picture.userId, privateSections]);

  const identityProfessionSection = getIdentityProfessionSection(privateSections, config.professionAtLabel, config.identityProfessionLabel);

  return (
    <>
      <section className="ud-react-shell">
        <div className="ud-react-shell__header">
          <div className="ud-react-shell__heading">
            <Typography component="span" variant="caption" className="ud-react-shell__eyebrow">{config.navigationLabel}</Typography>
            <Typography component="h2" variant="title" className="ud-react-shell__title">{config.title}</Typography>
          </div>
          {privateProfile?.picture && (
            <div className="ud-react-shell__picture">
              <ProfilePicture profile={privateProfile} activeEditor={activeEditor}/>
            </div>
          )}
        </div>
      </section>
      {privateRoot && privateProfile && createPortal(
        <PrivateSection
          id="about"
          label={privateProfile.about.title}
          buttons={privateProfile.about.canEdit && activeEditor !== 'about' ? (
            <Button label={privateProfile.about.editLabel} variant="outlined" onClick={() => window.userDashboardReactActions?.showAboutEditor?.()}/>
          ) : undefined}
        >
          <PrivateAboutSection profile={privateProfile} activeEditor={activeEditor}/>
        </PrivateSection>,
        privateRoot
      )}
      {identityRoot && privateSections?.identity && createPortal(
        <PrivateSection
          id="identity"
          label={config.identityProfessionLabel}
          buttons={identityProfessionSection?.canEdit && !['identityProfession', 'names', 'profession'].includes(activeEditor) ? (
            <Button label={identityProfessionSection.editLabel} variant="outlined" onClick={() => window.userDashboardReactActions?.showIdentityProfessionEditor?.()}/>
          ) : undefined}
        >
          {activeEditor === 'identityProfession' ? (
            <PrivateFieldsForm section={identityProfessionSection}/>
          ) : (
            <div className="ud-private-sectionStack">
              {activeEditor === 'names'
                ? <PrivateFieldsForm section={privateSections.identity}/>
                : <PrivateSummaryCard section={privateSections.identity}/>}
              {privateSections.profession && (activeEditor === 'profession'
                ? <PrivateFieldsForm section={privateSections.profession}/>
                : <PrivateSummaryCard section={privateSections.profession}/>)}
            </div>
          )}
        </PrivateSection>,
        identityRoot
      )}
      {contactRoot && privateSections?.contact && createPortal(
        <PrivateSection
          id="contact"
          label={privateSections.contact.title}
          buttons={privateSections.contact.canEdit && activeEditor !== 'address' ? (
            <Button label={privateSections.contact.editLabel} variant="outlined" onClick={() => window.userDashboardReactActions?.showAddressEditor?.()}/>
          ) : undefined}
        >
          {activeEditor === 'address' ? <PrivateFieldsForm section={privateSections.contact}/> : <PrivateContactCard section={privateSections.contact}/>}
        </PrivateSection>,
        contactRoot
      )}
      {passwordRoot && privateSections?.password && createPortal(
        <PrivateSection
          id="password"
          label={privateSections.password.title}
          buttons={privateSections.password.canEdit && activeEditor !== 'password' ? (
            <Button label={privateSections.password.editLabel} variant="outlined" onClick={() => window.userDashboardReactActions?.showPasswordEditor?.()}/>
          ) : undefined}
        >
          {activeEditor === 'password'
            ? <PrivatePasswordEditor section={privateSections.password} feedback={passwordFeedback?.type === 'error' ? passwordFeedback : null}/>
            : <PrivatePasswordCard section={privateSections.password} feedback={passwordFeedback?.type === 'success' ? passwordFeedback : null}/>}
        </PrivateSection>,
        passwordRoot
      )}
      {preferencesRoot && privateSections?.preferences && createPortal(
        <PrivateSection
          id="preferences"
          label={privateSections.preferences.title}
          buttons={privateSections.preferences.canEdit && activeEditor !== 'other' ? (
            <Button label={privateSections.preferences.editLabel} variant="outlined" onClick={() => window.userDashboardReactActions?.showOtherEditor?.()}/>
          ) : undefined}
        >
          {activeEditor === 'other' ? <PrivateFieldsForm section={privateSections.preferences}/> : <PrivatePreferencesCard section={privateSections.preferences}/>}
        </PrivateSection>,
        preferencesRoot
      )}
    </>
  );
}
