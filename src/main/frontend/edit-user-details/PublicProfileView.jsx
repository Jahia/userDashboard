import React from 'react';

const hasText = value => Boolean(value && value.trim());

const joinParts = parts => parts.filter(hasText).join(' ');

export default function PublicProfileView({profile}) {
  const fullName = joinParts([profile.firstName.value, profile.lastName.value]);
  const profession = joinParts([
    profile.profession.functionTitle.value,
    hasText(profile.profession.organization.value)
      ? `${profile.profession.atLabel} ${profile.profession.organization.value}`
      : ''
  ]);
  const contactRows = [
    [profile.contact.email.label, profile.contact.email.value, profile.contact.email.isPublic],
    [profile.contact.phoneNumber.label, profile.contact.phoneNumber.value, profile.contact.phoneNumber.isPublic],
    [profile.contact.mobileNumber.label, profile.contact.mobileNumber.value, profile.contact.mobileNumber.isPublic],
    [profile.contact.altNumber.label, profile.contact.altNumber.value, profile.contact.altNumber.isPublic]
  ].filter(([, value, isPublic]) => isPublic && hasText(value));
  const addressLines = [
    [profile.contact.address.value, profile.contact.address.isPublic],
    [profile.contact.zipCode.value, profile.contact.zipCode.isPublic],
    [profile.contact.city.value, profile.contact.city.isPublic],
    [profile.contact.country.value, profile.contact.country.isPublic]
  ].filter(([value, isPublic]) => isPublic && hasText(value));
  const hasHero = (profile.picture.isPublic && hasText(profile.picture.src)) || (profile.about.isPublic && hasText(profile.about.value));
  const cards = [
    fullName
      ? {title: profile.labels.name, body: <p className="ud-public-card__lead">{fullName}</p>}
      : null,
    hasText(profession)
      ? {title: profile.labels.profession, body: <p className="ud-public-card__body">{profession}</p>}
      : null,
    contactRows.length > 0 || addressLines.length > 0
      ? {
          title: profile.labels.address,
          body: (
            <div className="ud-public-contact">
              {contactRows.length > 0 && (
                <dl className="ud-public-list">
                  {contactRows.map(([label, value]) => (
                    <React.Fragment key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              )}
              {addressLines.length > 0 && (
                <div className="ud-public-addressBlock">
                  <h4>{profile.contact.address.label}</h4>
                  <div>
                    {addressLines.map(([value]) => (
                      <div key={value}>{value}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        }
      : null,
    profile.preferredLanguage.isPublic && hasText(profile.preferredLanguage.value)
      ? {
          title: profile.labels.other,
          body: (
            <dl className="ud-public-list">
              <dt>{profile.preferredLanguage.label}</dt>
              <dd>{profile.preferredLanguage.value}</dd>
            </dl>
          )
        }
      : null
  ].filter(Boolean);

  return (
    <section className="ud-public-view">
      <div className="ud-public-panel">
        {hasHero && (
          <div className={`ud-public-hero${profile.picture.isPublic && profile.about.isPublic ? '' : ' ud-public-hero--compact'}`}>
            {profile.picture.isPublic && hasText(profile.picture.src) && (
              <div className="ud-public-avatarWrap">
                <img className="ud-public-avatar" src={profile.picture.src} alt={profile.picture.alt} />
              </div>
            )}
            {profile.about.isPublic && hasText(profile.about.value) && (
              <div className="ud-public-about">
                <h3>{profile.about.title}</h3>
                <p>{profile.about.value}</p>
              </div>
            )}
          </div>
        )}
        {cards.length > 0 ? (
          <div className="ud-public-grid">
            {cards.map(card => (
              <article className="ud-public-card" key={card.title}>
                <h3>{card.title}</h3>
                {card.body}
              </article>
            ))}
          </div>
        ) : (
          <div className="ud-public-empty">{profile.labels.empty}</div>
        )}
      </div>
    </section>
  );
}
