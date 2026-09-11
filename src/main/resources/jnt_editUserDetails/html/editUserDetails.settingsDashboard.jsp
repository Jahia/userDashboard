<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="uiComponents" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="user" uri="http://www.jahia.org/tags/user" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%@ include file="../../getUser.jspf"%>
<jsp:useBean id="timeZoneOptionsProvider" class="org.jahia.modules.profile.TimeZoneOptionsProvider"/>

<%-- CSS inclusions --%>
<template:addResources type="css" resources="react-profile-app/edit-user-details-app.css"/>

<%-- Javascripts inclusions --%>
<template:addResources type="javascript" resources="react-profile-app/edit-user-details-app.js"/>
<template:addResources type="inline">
    <%-- ckeditor can't be loaded with a classic <template:addResources> as it is not declared as a dependency of userDashboard --%>
    <%-- And we want to keep it this way to avoid a global refresh of the bundles when ckeditor is updated, see https://jira.jahia.org/browse/QA-9520 for details --%>
    <script src='<c:url value="/modules/ckeditor/javascript/ckeditor.js" />'></script>
</template:addResources>
<template:addResources type="javascript" resources="editUserDetailsUtils.js"/>
<template:addResources type="javascript" resources="api.js"/>



<template:addCacheDependency node="${user}"/>

<jsp:useBean id="now" class="java.util.Date"/>


<jcr:nodeProperty node="${user}" name="j:birthDate" var="birthDate"/>

<jcr:nodeProperty node="${user}" name="j:publicProperties" var="publicProperties" />
<c:forEach items="${publicProperties}" var="value">
    <c:set var="publicPropertiesAsString" value="${value.string} ${publicPropertiesAsString}"/>
</c:forEach>
<jcr:nodeProperty node="${user}" name="preferredLanguage" var="prefLang"/>
<c:set var="prefLangLocale" value="${functions:toLocale(functions:default(prefLang.string, 'en'))}"/>
<c:set var="preferredLanguageDisplay" value="${not empty user.properties['preferredLanguage'].string ? functions:displayLocaleNameWith(prefLangLocale, prefLangLocale) : ''}"/>
<c:set var="timeZoneValue" value="${functions:default(user.properties['timeZone'].string, '')}"/>
<c:set var="timeZoneDisplay" value="${not empty timeZoneValue ? functions:default(timeZoneOptionsProvider.labelsById[timeZoneValue], timeZoneValue) : ''}"/>
<c:set var="ageDisplay"><c:if test="${currentNode.properties['age'].boolean and not empty birthDate}"><utility:dateDiff startDate="${birthDate.date.time}" endDate="${now}" format="years"/>&nbsp;<fmt:message key="jnt_user.profile.years"/></c:if></c:set>
<jcr:nodeProperty var="publicPicture" node="${user}" name="j:picture"/>
<c:choose>
    <c:when test="${empty publicPicture}">
        <c:url var="publicPictureUrl" value="${url.currentModule}/img/userbig.png"/>
    </c:when>
    <c:otherwise>
        <c:set var="publicPictureUrl" value="${publicPicture.node.thumbnailUrls['avatar_120']}"/>
    </c:otherwise>
</c:choose>
<fmt:message key="mySettings.at" var="professionAtLabel"/>
<fmt:message key="mySettings.mySettings.label" var="reactNavigationLabel"/>
<fmt:message key="mySettings.privateView" var="reactPrivateViewLabel"/>
<fmt:message key="mySettings.publicView" var="reactPublicViewLabel"/>
<fmt:message key="mySettings.name" var="reactNameLabel"/>
<fmt:message key="mySettings.profession" var="reactProfessionLabel"/>
<fmt:message key="mySettings.identityAndProfessionalInformation" var="reactIdentityProfessionLabel"/>
<fmt:message key="mySettings.address" var="reactAddressLabel"/>
<fmt:message key="mySettings.other" var="reactPreferencesLabel"/>
<fmt:message key="jnt_user.j_about" var="reactAboutLabel"/>
<fmt:message key="label.clickToEdit" var="reactEditLabel"/>
<fmt:message key="cancel" var="reactCancelLabel"/>
<fmt:message key="save" var="reactSaveLabel"/>
<fmt:message key="mySettings.startPage" var="reactStartPageLabel"/>
<fmt:message key="mySettings.errors.otherErrors" var="reactOtherErrorsLabel"/>
<fmt:message key="mySettings.errors.otherErrors2" var="reactOtherErrorsHelpLabel"/>
<fmt:message key="mysettings.picture.edit" var="reactPictureEditLabel"/>
<fmt:message key="mySettings.picture.delete" var="reactPictureDeleteLabel"/>
<fmt:message key="label.password" var="reactPasswordLabel"/>
<fmt:message key="mySettings.oldPassword" var="reactOldPasswordLabel"/>
<fmt:message key="label.confirmPassword" var="reactConfirmPasswordLabel"/>
<fmt:message key="jnt_user.preferredLanguage" var="reactPreferredLanguageLabel"/>
<fmt:message key="jnt_user.timeZone" var="reactTimeZoneLabel"/>
<fmt:message key="jnt_user.age" var="reactAgeLabel"/>
<fmt:message key="jnt_user.j_firstName" var="labelFirstName"/>
<fmt:message key="jnt_user.j_lastName" var="labelLastName"/>
<fmt:message key="jnt_user.j_function" var="labelFunctionTitle"/>
<fmt:message key="jnt_user.j_organization" var="labelOrganization"/>
<fmt:message key="jnt_user.j_address" var="labelAddress"/>
<fmt:message key="jnt_user.j_email" var="labelEmail"/>
<fmt:message key="jnt_user.j_phoneNumber" var="labelPhoneNumber"/>
<fmt:message key="jnt_user.j_mobileNumber" var="labelMobileNumber"/>
<fmt:message key="jnt_editUserDetails.j_altNumber" var="labelAltNumber"/>
<fmt:message key="jnt_user.j_zipCode" var="labelZipCode"/>
<fmt:message key="jnt_user.j_city" var="labelCity"/>
<fmt:message key="jnt_user.j_country" var="labelCountry"/>
<fmt:message key="mySettings.errors.phone.format" var="labelPhoneFormatError"/>
<fmt:message key="failure.invalid.emailAddress" var="labelInvalidEmail"/>
<fmt:message key="mySettings.errors.picture.upload" var="labelPictureUploadError"/>
<fmt:message key="mySettings.errors.picture.name.upload" var="labelPictureNameError"/>
<fmt:message key="mySettings.errors.picture.empty.upload" var="labelPictureEmptyError"/>
<fmt:message key="mySettings.errors.oldPassword.mandatory" var="labelOldPasswordMandatory"/>
<fmt:message key="mySettings.errors.password.mandatory" var="labelPasswordMandatory"/>
<fmt:message key="mySettings.errors.passwordConfirmation.mandatory" var="labelPasswordConfirmationMandatory"/>
<fmt:message key="mySettings.errors.password.not.matching" var="labelPasswordNotMatching"/>
<fmt:message key="mySettings.timeZone.placeholder" var="reactTimeZonePlaceholderLabel"/>
<c:set var="timeZoneEnabled" value="${empty currentNode.properties['timeZone'] or currentNode.properties['timeZone'].boolean}"/>
<c:set var="timeZoneEditable" value="${timeZoneEnabled and user:isPropertyEditable(user,'timeZone')}"/>
<c:url var="editDetailsReloadUrl"
       value="${url.baseUserBoardFrameEdit}${currentNode.path}.settingsDashboard.html.ajax?includeJavascripts=false&userUuid=${user.identifier}"/>

<template:addResources>
    <script type="text/javascript">
        var context = "${url.context}";
        var changePasswordUrl = '<c:url value="${url.base}${user.path}.changePassword.do"/>';
        var getUrl='${functions:escapeJavaScript(editDetailsReloadUrl)}';
        var propertiesNames = {
            <c:forTokens items="j:firstName,j:lastName,j:function,j:organization,j:about,j:picture,j:email,preferredLanguage,timeZone"
                         delims="," var="key" varStatus="loopStatus">
            <c:set var="message"><fmt:message key="jnt_user.${fn:replace(key, ':','_')}"/></c:set>
            '${key}' : '${functions:escapeJavaScript(message)}'<c:if test="${!loopStatus.last}">,</c:if>
            </c:forTokens>
        };

        var reactLabels = {
            navigation: '${functions:escapeJavaScript(reactNavigationLabel)}',
            privateView: '${functions:escapeJavaScript(reactPrivateViewLabel)}',
            publicView: '${functions:escapeJavaScript(reactPublicViewLabel)}',
            name: '${functions:escapeJavaScript(reactNameLabel)}',
            profession: '${functions:escapeJavaScript(reactProfessionLabel)}',
            identityProfession: '${functions:escapeJavaScript(reactIdentityProfessionLabel)}',
            address: '${functions:escapeJavaScript(reactAddressLabel)}',
            preferences: '${functions:escapeJavaScript(reactPreferencesLabel)}',
            about: '${functions:escapeJavaScript(reactAboutLabel)}',
            edit: '${functions:escapeJavaScript(reactEditLabel)}',
            cancel: '${functions:escapeJavaScript(reactCancelLabel)}',
            save: '${functions:escapeJavaScript(reactSaveLabel)}',
            startPage: '${functions:escapeJavaScript(reactStartPageLabel)}',
            otherErrors: '${functions:escapeJavaScript(reactOtherErrorsLabel)}',
            otherErrorsHelp: '${functions:escapeJavaScript(reactOtherErrorsHelpLabel)}',
            pictureEdit: '${functions:escapeJavaScript(reactPictureEditLabel)}',
            pictureDelete: '${functions:escapeJavaScript(reactPictureDeleteLabel)}',
            password: '${functions:escapeJavaScript(reactPasswordLabel)}',
            oldPassword: '${functions:escapeJavaScript(reactOldPasswordLabel)}',
            confirmPassword: '${functions:escapeJavaScript(reactConfirmPasswordLabel)}',
            preferredLanguage: '${functions:escapeJavaScript(reactPreferredLanguageLabel)}',
            timeZone: '${functions:escapeJavaScript(reactTimeZoneLabel)}',
            timeZonePlaceholder: '${functions:escapeJavaScript(reactTimeZonePlaceholderLabel)}',
            age: '${functions:escapeJavaScript(reactAgeLabel)}',
            at: '${functions:escapeJavaScript(professionAtLabel)}'
        };

        var profileValues = {
            pictureSrc: '${functions:escapeJavaScript(functions:default(publicPictureUrl, ""))}',
            pictureAlt: '${functions:escapeJavaScript(functions:default(person, ""))}',
            about: '${functions:escapeJavaScript(functions:default(user.properties["j:about"].string, ""))}',
            firstName: '${functions:escapeJavaScript(functions:default(user.properties["j:firstName"].string, ""))}',
            lastName: '${functions:escapeJavaScript(functions:default(user.properties["j:lastName"].string, ""))}',
            functionTitle: '${functions:escapeJavaScript(functions:default(user.properties["j:function"].string, ""))}',
            organization: '${functions:escapeJavaScript(functions:default(user.properties["j:organization"].string, ""))}',
            address: '${functions:escapeJavaScript(functions:default(user.properties["j:address"].string, ""))}',
            zipCode: '${functions:escapeJavaScript(functions:default(user.properties["j:zipCode"].string, ""))}',
            city: '${functions:escapeJavaScript(functions:default(user.properties["j:city"].string, ""))}',
            country: '${functions:escapeJavaScript(functions:default(user.properties["j:country"].string, ""))}',
            phoneNumber: '${functions:escapeJavaScript(functions:default(user.properties["j:phoneNumber"].string, ""))}',
            mobileNumber: '${functions:escapeJavaScript(functions:default(user.properties["j:mobileNumber"].string, ""))}',
            altNumber: '${functions:escapeJavaScript(functions:default(user.properties["j:altNumber"].string, ""))}',
            email: '${functions:escapeJavaScript(functions:default(user.properties["j:email"].string, ""))}',
            preferredLanguage: '${functions:escapeJavaScript(functions:default(prefLang.string, "en"))}',
            preferredLanguageDisplay: '${functions:escapeJavaScript(functions:default(preferredLanguageDisplay, ""))}',
            timeZone: '${functions:escapeJavaScript(functions:default(timeZoneValue, ""))}',
            timeZoneDisplay: '${functions:escapeJavaScript(functions:default(timeZoneDisplay, ""))}',
            ageDisplay: '${functions:escapeJavaScript(fn:trim(functions:default(ageDisplay, "")))}'
        };

        var publicVisibility = {
            picture: ${fn:contains(publicPropertiesAsString, 'j:picture')},
            about: ${fn:contains(publicPropertiesAsString, 'j:about')},
            firstName: ${fn:contains(publicPropertiesAsString, 'j:firstName')},
            lastName: ${fn:contains(publicPropertiesAsString, 'j:lastName')},
            functionTitle: ${fn:contains(publicPropertiesAsString, 'j:function')},
            organization: ${fn:contains(publicPropertiesAsString, 'j:organization')},
            email: ${fn:contains(publicPropertiesAsString, 'j:email')},
            phoneNumber: ${fn:contains(publicPropertiesAsString, 'j:phoneNumber')},
            mobileNumber: ${fn:contains(publicPropertiesAsString, 'j:mobileNumber')},
            altNumber: ${fn:contains(publicPropertiesAsString, 'j:altNumber')},
            address: ${fn:contains(publicPropertiesAsString, 'j:address')},
            zipCode: ${fn:contains(publicPropertiesAsString, 'j:zipCode')},
            city: ${fn:contains(publicPropertiesAsString, 'j:city')},
            country: ${fn:contains(publicPropertiesAsString, 'j:country')},
            preferredLanguage: ${fn:contains(publicPropertiesAsString, 'preferredLanguage')}
        };

        var canEditFlags = {
            picture: ${currentNode.properties['j:picture'].boolean and user:isPropertyEditable(user,'j:picture')},
            about: ${currentNode.properties['j:about'].boolean and user:isPropertyEditable(user,'j:about')},
            identity: ${(currentNode.properties['j:firstName'].boolean and user:isPropertyEditable(user,'j:firstName')) or (currentNode.properties['j:lastName'].boolean and user:isPropertyEditable(user,'j:lastName'))},
            profession: ${(currentNode.properties['j:function'].boolean and user:isPropertyEditable(user,'j:function')) or (currentNode.properties['j:organization'].boolean and user:isPropertyEditable(user,'j:organization'))},
            contact: ${(currentNode.properties['j:address'].boolean and user:isPropertyEditable(user,'j:address')) or (currentNode.properties['j:zipCode'].boolean and user:isPropertyEditable(user,'j:zipCode')) or (currentNode.properties['j:city'].boolean and user:isPropertyEditable(user,'j:city')) or (currentNode.properties['j:country'].boolean and user:isPropertyEditable(user,'j:country')) or (currentNode.properties['j:phoneNumber'].boolean and user:isPropertyEditable(user,'j:phoneNumber')) or (currentNode.properties['j:mobileNumber'].boolean and user:isPropertyEditable(user,'j:mobileNumber')) or (currentNode.properties['j:altNumber'].boolean and user:isPropertyEditable(user,'j:altNumber')) or (currentNode.properties['j:email'].boolean and user:isPropertyEditable(user,'j:email'))},
            password: ${currentNode.properties['password'].boolean and !(user.properties['j:external'].boolean)},
            preferences: ${(currentNode.properties['preferredLanguage'].boolean and user:isPropertyEditable(user,'preferredLanguage')) or timeZoneEditable}
        };

        function createInputField(visible, id, name, label, value, dataUndefined, disabled, className, extra) {
            var field = {
                visible: visible,
                id: id,
                name: name,
                label: label,
                value: value,
                dataUndefined: dataUndefined,
                disabled: disabled,
                className: className
            };

            if (extra) {
                for (var key in extra) {
                    if (Object.prototype.hasOwnProperty.call(extra, key)) {
                        field[key] = extra[key];
                    }
                }
            }

            return field;
        }

        function createSelectField(visible, id, name, label, value, disabled, className, options, extra) {
            var selectExtra = {
                type: 'select',
                options: options
            };

            if (extra) {
                for (var key in extra) {
                    if (Object.prototype.hasOwnProperty.call(extra, key)) {
                        selectExtra[key] = extra[key];
                    }
                }
            }

            return createInputField(visible, id, name, label, value, undefined, disabled, className, selectExtra);
        }

        window.userDashboardReactConfig = {
            activeTab: 'private',
            navigationLabel: reactLabels.navigation,
            title: reactLabels.navigation,
            privateViewLabel: reactLabels.privateView,
            publicViewLabel: reactLabels.publicView,
            privateProfile: {
                picture: {
                    src: profileValues.pictureSrc,
                    alt: profileValues.pictureAlt,
                    canEdit: canEditFlags.picture,
                    editLabel: reactLabels.pictureEdit,
                    userId: '${user.identifier}',
                    cancelLabel: reactLabels.cancel,
                    deleteLabel: reactLabels.pictureDelete,
                    saveLabel: reactLabels.save,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage,
                    errors: {
                        upload: '${functions:escapeJavaScript(labelPictureUploadError)}',
                        name: '${functions:escapeJavaScript(labelPictureNameError)}',
                        empty: '${functions:escapeJavaScript(labelPictureEmptyError)}'
                    }
                },
                about: {
                    title: reactLabels.about,
                    html: profileValues.about,
                    sourceValue: profileValues.about,
                    emptyLabel: reactLabels.about,
                    canEdit: canEditFlags.about,
                    editLabel: reactLabels.edit,
                    userId: '${user.identifier}',
                    cancelLabel: reactLabels.cancel,
                    saveLabel: reactLabels.save,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage
                }
            },
            privateSections: {
                identity: {
                    title: reactLabels.name,
                    parts: [
                        profileValues.firstName,
                        profileValues.lastName
                    ],
                    emptyLabel: reactLabels.name,
                    canEdit: canEditFlags.identity,
                    editLabel: reactLabels.edit,
                    onEditAction: 'showNamesEditor',
                    onSaveAction: 'saveNames',
                    errorClass: 'namesField',
                    cancelLabel: reactLabels.cancel,
                    saveLabel: reactLabels.save,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage,
                    fields: [
                        createInputField(${currentNode.properties['j:firstName'].boolean}, 'firstname', 'j:firstName', '${functions:escapeJavaScript(labelFirstName)}', profileValues.firstName, ${user.properties['j:firstName'] == null}, ${not user:isPropertyEditable(user,'j:firstName')}, 'ud-private-input namesField'),
                        createInputField(${currentNode.properties['j:lastName'].boolean}, 'lastName', 'j:lastName', '${functions:escapeJavaScript(labelLastName)}', profileValues.lastName, ${user.properties['j:lastName'] == null}, ${not user:isPropertyEditable(user,'j:lastName')}, 'ud-private-input namesField')
                    ]
                },
                profession: {
                    title: reactLabels.profession,
                    parts: [
                        profileValues.functionTitle,
                        '${functions:escapeJavaScript(not empty user.properties["j:organization"].string ? professionAtLabel : "")}',
                        profileValues.organization
                    ],
                    emptyLabel: reactLabels.profession,
                    canEdit: canEditFlags.profession,
                    editLabel: reactLabels.edit,
                    onEditAction: 'showProfessionEditor',
                    onSaveAction: 'saveProfession',
                    errorClass: 'professionField',
                    cancelLabel: reactLabels.cancel,
                    saveLabel: reactLabels.save,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage,
                    fields: [
                        createInputField(${currentNode.properties['j:function'].boolean}, 'function', 'j:function', '${functions:escapeJavaScript(labelFunctionTitle)}', profileValues.functionTitle, ${user.properties['j:function'] == null}, ${not user:isPropertyEditable(user,'j:function')}, 'ud-private-input professionField'),
                        createInputField(${currentNode.properties['j:organization'].boolean}, 'organization', 'j:organization', '${functions:escapeJavaScript(labelOrganization)}', profileValues.organization, ${user.properties['j:organization'] == null}, ${not user:isPropertyEditable(user,'j:organization')}, 'ud-private-input professionField')
                    ]
                },
                contact: {
                    title: reactLabels.address,
                    addressLabel: '${functions:escapeJavaScript(labelAddress)}',
                    contactRows: [
                        {
                            label: '${functions:escapeJavaScript(labelEmail)}',
                            value: profileValues.email
                        },
                        {
                            label: '${functions:escapeJavaScript(labelPhoneNumber)}',
                            value: profileValues.phoneNumber
                        },
                        {
                            label: '${functions:escapeJavaScript(labelMobileNumber)}',
                            value: profileValues.mobileNumber
                        },
                        {
                            label: '${functions:escapeJavaScript(labelAltNumber)}',
                            value: profileValues.altNumber
                        }
                    ],
                    addressLines: [
                        profileValues.address,
                        profileValues.zipCode,
                        profileValues.city,
                        profileValues.country
                    ],
                    emptyLabel: reactLabels.address,
                    canEdit: canEditFlags.contact,
                    editLabel: reactLabels.edit,
                    onEditAction: 'showAddressEditor',
                    onSaveAction: 'saveAddress',
                    errorClass: 'addressField',
                    cancelLabel: reactLabels.cancel,
                    saveLabel: reactLabels.save,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage,
                    extraErrors: [
                        {
                            id: 'phoneFormatError',
                            label: '${functions:escapeJavaScript(labelPhoneFormatError)}'
                        },
                        {
                            id: 'emailFormatError',
                            label: '${functions:escapeJavaScript(labelInvalidEmail)}'
                        }
                    ],
                    fields: [
                        createInputField(${currentNode.properties['j:address'].boolean}, 'address', 'j:address', '${functions:escapeJavaScript(labelAddress)}', profileValues.address, ${user.properties['j:address'] == null}, ${not user:isPropertyEditable(user,'j:address')}, 'ud-private-input addressField'),
                        createInputField(${currentNode.properties['j:zipCode'].boolean}, 'zipCode', 'j:zipCode', '${functions:escapeJavaScript(labelZipCode)}', profileValues.zipCode, ${user.properties['j:zipCode'] == null}, ${not user:isPropertyEditable(user,'j:zipCode')}, 'ud-private-input addressField'),
                        createInputField(${currentNode.properties['j:city'].boolean}, 'city', 'j:city', '${functions:escapeJavaScript(labelCity)}', profileValues.city, ${user.properties['j:city'] == null}, ${not user:isPropertyEditable(user,'j:city')}, 'ud-private-input addressField'),
                        createInputField(${currentNode.properties['j:country'].boolean}, 'country', 'j:country', '${functions:escapeJavaScript(labelCountry)}', profileValues.country, ${user.properties['j:country'] == null}, ${not user:isPropertyEditable(user,'j:country')}, 'ud-private-input addressField'),
                        createInputField(${currentNode.properties['j:phoneNumber'].boolean}, 'phoneNumber', 'j:phoneNumber', '${functions:escapeJavaScript(labelPhoneNumber)}', profileValues.phoneNumber, ${user.properties['j:phoneNumber'] == null}, ${not user:isPropertyEditable(user,'j:phoneNumber')}, 'ud-private-input phone addressField'),
                        createInputField(${currentNode.properties['j:mobileNumber'].boolean}, 'mobileNumber', 'j:mobileNumber', '${functions:escapeJavaScript(labelMobileNumber)}', profileValues.mobileNumber, ${user.properties['j:mobileNumber'] == null}, ${not user:isPropertyEditable(user,'j:mobileNumber')}, 'ud-private-input phone addressField'),
                        createInputField(${currentNode.properties['j:altNumber'].boolean}, 'altNumber', 'j:altNumber', '${functions:escapeJavaScript(labelAltNumber)}', profileValues.altNumber, ${user.properties['j:altNumber'] == null}, ${not user:isPropertyEditable(user,'j:altNumber')}, 'ud-private-input phone addressField'),
                        createInputField(${currentNode.properties['j:email'].boolean}, 'email', 'j:email', '${functions:escapeJavaScript(labelEmail)}', profileValues.email, ${user.properties['j:email'] == null}, ${not user:isPropertyEditable(user,'j:email')}, 'ud-private-input email addressField')
                    ]
                },
                password: {
                    title: reactLabels.password,
                    maskedValue: '******',
                    canEdit: canEditFlags.password,
                    editLabel: reactLabels.edit,
                    onEditAction: 'showPasswordEditor',
                    cancelLabel: reactLabels.cancel,
                    saveLabel: reactLabels.save,
                    oldPasswordLabel: reactLabels.oldPassword,
                    passwordLabel: reactLabels.password,
                    confirmPasswordLabel: reactLabels.confirmPassword,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage,
                    messages: {
                        oldPasswordMandatory: '${functions:escapeJavaScript(labelOldPasswordMandatory)}',
                        passwordMandatory: '${functions:escapeJavaScript(labelPasswordMandatory)}',
                        confirmationMandatory: '${functions:escapeJavaScript(labelPasswordConfirmationMandatory)}',
                        passwordNotMatching: '${functions:escapeJavaScript(labelPasswordNotMatching)}'
                    }
                },
                preferences: {
                    title: reactLabels.preferences,
                    rows: [
                        {
                            name: 'preferredLanguage',
                            label: reactLabels.preferredLanguage,
                            value: profileValues.preferredLanguageDisplay
                        },
                        {
                            name: 'timeZone',
                            label: reactLabels.timeZone,
                            value: profileValues.timeZoneDisplay
                        },
                        {
                            name: 'age',
                            label: reactLabels.age,
                            value: profileValues.ageDisplay
                        }
                    ],
                    emptyLabel: reactLabels.preferences,
                    canEdit: canEditFlags.preferences,
                    editLabel: reactLabels.edit,
                    onEditAction: 'showOtherEditor',
                    onSaveAction: 'saveOther',
                    errorClass: 'otherField',
                    cancelLabel: reactLabels.cancel,
                    saveLabel: reactLabels.save,
                    otherErrorsLabel: reactLabels.otherErrors,
                    otherErrorsHelp: reactLabels.otherErrorsHelp,
                    startPageLabel: reactLabels.startPage,
                    fields: [
                        createSelectField(${currentNode.properties['preferredLanguage'].boolean}, 'preferredLanguage', 'preferredLanguage', reactLabels.preferredLanguage, profileValues.preferredLanguage, ${not user:isPropertyEditable(user,'preferredLanguage')}, 'ud-private-select otherField', [
                            <c:forEach items='${functions:availableAdminBundleLocale(renderContext.mainResourceLocale)}' var='adLocale' varStatus='status'>{
                                value: '${functions:escapeJavaScript(functions:toLocale(adLocale))}',
                                label: '${functions:escapeJavaScript(functions:displayLocaleNameWith(adLocale, adLocale))}'
                            }<c:if test='${!status.last}'>,</c:if></c:forEach>
                        ]),
                        createSelectField(${timeZoneEnabled}, 'timeZone', 'timeZone', reactLabels.timeZone, profileValues.timeZone, ${not timeZoneEditable}, 'ud-private-select otherField', [
                            {
                                value: '',
                                label: reactLabels.timeZonePlaceholder
                            },
                            <c:forEach items='${timeZoneOptionsProvider.options}' var='timeZoneOption' varStatus='status'>{
                                value: '${functions:escapeJavaScript(timeZoneOption.value)}',
                                label: '${functions:escapeJavaScript(timeZoneOption.label)}'
                            }<c:if test='${!status.last}'>,</c:if></c:forEach>
                        ])
                    ]
                }
            },
            publicProfile: {
                labels: {
                    empty: reactLabels.publicView,
                    name: reactLabels.name,
                    profession: reactLabels.profession,
                    address: reactLabels.address,
                    other: reactLabels.preferences
                },
                picture: {
                    isPublic: publicVisibility.picture,
                    src: profileValues.pictureSrc,
                    alt: profileValues.pictureAlt
                },
                about: {
                    isPublic: publicVisibility.about,
                    title: reactLabels.about,
                    value: profileValues.about
                },
                firstName: {
                    isPublic: publicVisibility.firstName,
                    value: profileValues.firstName
                },
                lastName: {
                    isPublic: publicVisibility.lastName,
                    value: profileValues.lastName
                },
                profession: {
                    atLabel: reactLabels.at,
                    functionTitle: {
                        isPublic: publicVisibility.functionTitle,
                        value: profileValues.functionTitle
                    },
                    organization: {
                        isPublic: publicVisibility.organization,
                        value: profileValues.organization
                    }
                },
                contact: {
                    email: {
                        isPublic: publicVisibility.email,
                        label: '${functions:escapeJavaScript(labelEmail)}',
                        value: profileValues.email
                    },
                    phoneNumber: {
                        isPublic: publicVisibility.phoneNumber,
                        label: '${functions:escapeJavaScript(labelPhoneNumber)}',
                        value: profileValues.phoneNumber
                    },
                    mobileNumber: {
                        isPublic: publicVisibility.mobileNumber,
                        label: '${functions:escapeJavaScript(labelMobileNumber)}',
                        value: profileValues.mobileNumber
                    },
                    altNumber: {
                        isPublic: publicVisibility.altNumber,
                        label: '${functions:escapeJavaScript(labelAltNumber)}',
                        value: profileValues.altNumber
                    },
                    address: {
                        isPublic: publicVisibility.address,
                        label: '${functions:escapeJavaScript(labelAddress)}',
                        value: profileValues.address
                    },
                    zipCode: {
                        isPublic: publicVisibility.zipCode,
                        label: '${functions:escapeJavaScript(labelZipCode)}',
                        value: profileValues.zipCode
                    },
                    city: {
                        isPublic: publicVisibility.city,
                        label: '${functions:escapeJavaScript(labelCity)}',
                        value: profileValues.city
                    },
                    country: {
                        isPublic: publicVisibility.country,
                        label: '${functions:escapeJavaScript(labelCountry)}',
                        value: profileValues.country
                    }
                },
                preferredLanguage: {
                    isPublic: publicVisibility.preferredLanguage,
                    label: reactLabels.preferredLanguage,
                    value: profileValues.preferredLanguageDisplay
                }
            }
        };

        var currentCssClass ="";

        /**
         * @author rahmed (JAHIA)
         * This function updates a Form Row properties and verify the phones and email fields if the Row cssClass is 'AddressField'
         * @param cssClass : The Form Row css class
         */
        function updateProperties(cssClass, fullReloadOrOptions) {
            currentCssClass=cssClass;
            formToJahiaCreateUpdateProperties("editDetailsForm", "${user.identifier}", "${currentResource.locale}", cssClass, fullReloadOrOptions);

        }
        function updateAddressProperties(saveOptions) {
            currentCssClass = "addressField";
            if (!verifyAndSubmitAddress(currentCssClass, 'phoneFormatError', 'emailFormatError')) {
                return;
            }
            formToJahiaCreateUpdateProperties("editDetailsForm", "${user.identifier}", "${currentResource.locale}", currentCssClass, saveOptions);
        }
        var visibilityNumber = 0;
        if(window.userDetailsHasSwitch == undefined) {
            var userDetailsHasSwitch = false;
        }

        document.addEventListener('DOMContentLoaded', function() {
            var aboutMoreButton = document.querySelector('.btnMoreAbout');
            var aboutLessButton = document.querySelector('.btnLessAbout');
            var aboutTextWrapper = document.getElementById('aboutMeTextWrapper');
            var aboutTextContent = document.getElementById('aboutMeTextDiv');
            var aboutTextBlocks = Array.prototype.slice.call(document.querySelectorAll('.aboutMeText'));

            function setAboutExpanded(expanded) {
                aboutTextBlocks.forEach(function(block) {
                    if (expanded) {
                        block.style.height = '100%';
                        block.style.maxHeight = '250px';
                        block.style.overflow = 'auto';
                        block.style.paddingRight = '5px';
                    } else {
                        block.scrollTop = 0;
                        block.style.height = '100px';
                        block.style.maxHeight = '';
                        block.style.overflow = 'hidden';
                        block.style.paddingRight = '';
                    }
                });

                if (aboutMoreButton) {
                    aboutMoreButton.style.display = expanded ? 'none' : '';
                }
                if (aboutLessButton) {
                    aboutLessButton.style.display = expanded ? '' : 'none';
                }
            }

            // Update messages on window according to current uilang, this avoids BACKLOG-12832
            fetch(window.parent.contextJsParameters.contextPath + '/gwt/resources/i18n/messages_' + window.parent.contextJsParameters.uilang + '.js')
                .then(function(d) {d.text()
                    .then(function(d) {window.parent.Function('"use strict";' + d + ' window.jahia_gwt_messages = jahia_gwt_messages')()})});

            //Setting Read More button if needed
            if (aboutTextWrapper && aboutTextContent && aboutTextWrapper.offsetHeight > aboutTextContent.offsetHeight) {
                if (aboutMoreButton) {
                    aboutMoreButton.style.display = '';
                }
            }

            if (aboutMoreButton) {
                aboutMoreButton.addEventListener('click', function() {
                    setAboutExpanded(true);
                });
            }

            if (aboutLessButton) {
                aboutLessButton.addEventListener('click', function() {
                    setAboutExpanded(false);
                });
            }

            // Keep this inline validation logic in sync with editUserDetailsUtils.js.verifyAndSubmitAddress.
            var phoneRegex = /^\+?([0-9_\- \(\)])*$/;

            // Same regex as editUserDetailsUtils.js.verifyAndSubmitAddress.
            var emailRegex = /^(?:[A-Za-z0-9\._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})?$/;

            function setValidationState(element, isValid) {
                var field = element.closest('.ud-private-field');
                if (!field) {
                    return;
                }

                field.classList.remove('error');
                field.classList.remove('success');

                if (element.value === '') {
                    return;
                }

                field.classList.add(isValid ? 'success' : 'error');
            }

            function isPhoneFieldValid(element) {
                var normalizedPhone = element.value.replace(/\(|\)|\s+|-/g, '');
                return normalizedPhone.length === 0 || (normalizedPhone.length > 4 && phoneRegex.test(element.value));
            }

            function isEmailFieldValid(element) {
                return element.value === '' || emailRegex.test(element.value);
            }

            function bindValidationState(selector, validator) {
                Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function(element) {
                    var refreshState = function() {
                        setValidationState(element, validator(element));
                    };

                    element.addEventListener('input', refreshState);
                    element.addEventListener('blur', refreshState);
                    refreshState();
                });
            }

            bindValidationState('.addressField.phone', isPhoneFieldValid);
            bindValidationState('.addressField.email', isEmailFieldValid);

        });
    </script>
</template:addResources>
<div id="editDetailspage">
    <div class="ud-edit-layout">
        <div class="ud-edit-layout__content">
            <div id="editUserDetailsReactRoot"></div>
        </div>
    </div>

    <div class="ud-edit-tabs">
        <div class="ud-edit-tabPane ud-edit-tabPane--active" data-ud-tab-pane id="private">
            <form enctype= multipart/form-data onkeypress="return event.keyCode != 13;" id="editDetailsForm" class="ud-edit-form user-profile-table" onsubmit="return false;">
                <div class="ud-edit-layout">
                    <div class="ud-edit-layout__content">
                        <%@include file="editUserDetailsRows.settingsDashboard.jspf" %>

                    </div>
                </div>
            </form>
        </div>

        <div class="ud-edit-tabPane" data-ud-tab-pane id="public">
            <div class="ud-edit-layout">
                <div class="ud-edit-layout__content">
                    <div id="editUserDetailsPublicReactRoot"></div>
                </div>
            </div>
        </div>

    </div>
</div>
