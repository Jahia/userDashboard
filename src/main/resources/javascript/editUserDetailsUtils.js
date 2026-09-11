/* REST API GENERAL FUNCTIONS */

function domQuery(selector, root) {
    return (root || document).querySelector(selector);
}

function domQueryAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function getFormElement(formId) {
    if (!formId) {
        return null;
    }

    return formId.charAt(0) === '#' ? domQuery(formId) : document.getElementById(formId);
}

function setDisplay(element, visible) {
    if (!element) {
        return;
    }

    element.style.display = visible ? '' : 'none';
}

function showMessageForDuration(element, duration) {
    if (!element) {
        return;
    }

    setDisplay(element, true);
    window.setTimeout(function() {
        setDisplay(element, false);
    }, duration || 5000);
}

function showElementsForDuration(elements, duration) {
    elements.forEach(function(element) {
        showMessageForDuration(element, duration);
    });
}

function appendMessage(element, message) {
    if (!element) {
        return;
    }

    var wrapper = document.createElement('div');
    wrapper.textContent = message == null ? '' : String(message);
    element.appendChild(wrapper);
}

function serializeFormObject(formElement, fieldsClass, deleteTable) {
    var deleteIndex = 0;
    var serializedObject = {};
    var serializedArray;

    if (!formElement) {
        return {'properties': serializedObject};
    }

    if (fieldsClass === undefined) {
        serializedArray = domQueryAll('input, select, textarea', formElement).filter(function(field) {
            return field.name && !field.disabled && field.type !== 'submit' && field.type !== 'button' && field.type !== 'reset' && field.type !== 'file';
        });
    } else {
        serializedArray = domQueryAll('.' + fieldsClass + ':not([disabled])', formElement);
    }

    serializedArray.forEach(function(field) {
        var name = field.name;
        var value = field.value;

        if (field.type === 'checkbox' || field.type === 'radio') {
            if (!field.checked) {
                return;
            }
        }

        if (value === '') {
            if (field.getAttribute('data-undefined') !== 'true') {
                deleteTable[deleteIndex] = name;
                deleteIndex++;
            }
            field.setAttribute('data-undefined', 'true');
            return;
        }

        if (name !== undefined && value !== undefined) {
            if (field.getAttribute('jcrtype') === 'Date') {
                value = new Date(value + 'T00:00:00.000').toISOString();
            }
            field.setAttribute('data-undefined', 'false');
            if (serializedObject[name]) {
                if (!serializedObject[name].push) {
                    serializedObject[name] = [serializedObject[name]];
                }
                serializedObject[name].push(value || '');
            } else {
                serializedObject[name] = {'value': value || ''};
            }
        }
    });

    return {'properties': serializedObject};
}

function normalizeSaveOptions(fullReloadOrOptions) {
    if (typeof fullReloadOrOptions === 'object' && fullReloadOrOptions !== null) {
        return {
            fullReload: Boolean(fullReloadOrOptions.fullReload),
            onSuccess: fullReloadOrOptions.onSuccess
        };
    }

    return {
        fullReload: Boolean(fullReloadOrOptions),
        onSuccess: undefined
    };
}

function handleSaveSuccess(saveOptions) {
    if (typeof saveOptions.onSuccess === 'function') {
        return Promise.resolve(saveOptions.onSuccess());
    }

    reload(saveOptions.fullReload);
    return Promise.resolve();
}

function formToJahiaCreateUpdateProperties(formId, nodeIdentifier, locale, fieldsClass, fullReloadOrOptions = false) {
    var saveOptions = normalizeSaveOptions(fullReloadOrOptions);
    var deleteList = [];
    //JSon Serialized String
    var serializedForm;
    var serializedObject;
    var result;
    //Creating the Json String to send with the PUT request
    serializedObject = serializeFormObject(getFormElement(formId), fieldsClass, deleteList);
    deleteProperties = '';

    function createMutatePropertyHeader(key) {
        // use aliases (based on the property name) to perform mutations (see https://graphql.org/learn/queries/#aliases)
        const alias = key.replace(/[^a-zA-Z0-9_$]/g, '_');
        return `${alias}: mutateProperty(name:"${key}")`;
    }

    if (deleteList.length > 0) {
        deleteProperties = deleteList.map(key => {
            const propHeader = createMutatePropertyHeader(key);
            return `
                  ${propHeader} {
                    delete
                  }
              `;
        }).join('\n');
    }

    if (serializedObject != '{"properties":{"undefined":{"value":""}}}' && serializedObject != '{"properties":{}}') {
        const mutateProperties = Object.keys(serializedObject.properties).map(key => {
            const propHeader = createMutatePropertyHeader(key);
            return `
                  ${propHeader} {
                    setValue(value:"${serializedObject.properties[key].value}")
                  }
              `;
        }).join('\n');

        if (!(mutateProperties || deleteProperties)) {
            // there is nothing to update
            handleSaveSuccess(saveOptions);
            return;
        }
        const query = /* GraphQL */ `
            mutation updateProperties($nodeId: String!) {
                jcr(workspace: EDIT) {
                    mutateNode(pathOrId: $nodeId) {
                        ${mutateProperties}
                        ${deleteProperties}
                    }
                }
            }
        `;
        const variables = {nodeId: nodeIdentifier};
        execGraphQL(context, query, variables)
            .then(function() {
                return handleSaveSuccess(saveOptions);
            });

    } else {
        handleSaveSuccess(saveOptions);
    }
}

/**
 * @Author : Jahia(rahmed)
 * This function serialize a form (or some form elements with a given css class) to an array, then browse it and build a JSon Object with it
 * All the form inputs with empty values are not serialized and put in the delete properties Table
 * @param fieldsClass : the class of the form elements to serialize
 * @param deleteList : Table of the properties to delete
 * @returns JSon Object containing all the properties to send to API
 */
/* Edit User Details Functions */
/**
 * Reload the page.
 * @param fullReload whether to perform a full reload or not.
 */
var reload = function (fullReload = false) {
    var windowToRefresh = window.parent;
    if (windowToRefresh === undefined) {
        windowToRefresh = window;
    }

    windowToRefresh.location.reload();
}

/* Edit User Details Functions */

function goToStart() {
    var windowToRefresh = window.parent;
    if (windowToRefresh == undefined)
        windowToRefresh = window;
    windowToRefresh.location.replace(context + '/start');
}

/* Edit User Details Functions */
/**
 * @Author : Jahia(rahmed)
 * Edit User Details Callback Function
 * This function is called after the user properties Update in error cases
 * It formats and displays the Jahia API error messages
 * @param result : The PUT request result
 * @param sent : The sent Json with the PUT request (to check for the preferredLanguage Properties)
 */
// TODO duplicate and take error string as input
var formError = function (result, sent) {
    var resultObject = null;
    var otherErrorsElements = domQueryAll('.' + currentCssClass + '.otherErrorsMessage');
    var errorElements = domQueryAll('.' + currentCssClass + '.errorMessage');

    if (result['status'] > 300) {
        if (result['status'] == 401) {
            //Lost session redirecting to login
            goToStart();
        } else if (result['status'] >= 400 && result['status'] < 500) {
            //other errors displaying default message
            otherErrorsElements.forEach(function(element) {
                setDisplay(element, false);
            });
            showElementsForDuration(otherErrorsElements, 1500);
        } else if (result['status'] == 500) {
            //server error trying to get message from Api
            if (result.responseJSON != undefined) {
                //trying to get message in Json
                resultObject = {'message': '' + result.responseJSON.message + '', 'properties': []};
            } else if (result['message'] != undefined) {
                //trying to get message directly from result
                resultObject = {'message': '' + result['message'] + '', 'properties': []};
            }
            if (resultObject != null) {
                //formatting the message (replacing the j:properties by their names)

                //looking for JCR property name
                var propertiesArray = [];
                if (result.responseJSON.message.indexOf('j:') !== -1) {
                    //split message on spaces
                    propertiesArray = result.responseJSON.message.split(' ');

                    for (var property = 0; property < propertiesArray.length; property++) {
                        if (propertiesArray[property].indexOf('j:') !== -1) {
                            if (resultObject['properties']) {
                                if (!resultObject['properties'].push) {
                                    resultObject['properties'] = [resultObject['properties']];
                                }
                                resultObject['properties'].push(propertiesArray[property] || '');
                            } else {
                                resultObject['properties'] = {'keys': propertiesArray[property] || ''};
                            }
                        }
                    }
                }
                var errorMessage = '' + resultObject['message'];

                propertiesArray = resultObject['properties'];

                for (var propertyName = 0; propertyName < propertiesArray.length; propertyName++) {
                    errorMessage = errorMessage.replace(propertiesArray[propertyName], propertiesNames[propertiesArray[propertyName]]);
                }

                //displaying formatted error message
                errorElements.forEach(function(element) {
                    element.innerHTML = '';
                    setDisplay(element, false);
                    appendMessage(element, errorMessage);
                });
                showElementsForDuration(errorElements, 4000);

            } else {
                //default error message
                otherErrorsElements.forEach(function(element) {
                    setDisplay(element, false);
                });
                showElementsForDuration(otherErrorsElements, 1500);
            }
        }
    }
    return resultObject;
};

/**
 * @Author : Jahia(rahmed)
 * This function verify the phone and email fields of an adress
 * the phone fields must have the 'phone' css class
 * The email fields must have the 'email' css class
 * @param cssClass : The class of the form adress fields
 * @param phoneErrorId : The css id of the div that will display the phone error message
 * @param emailErrorId : The css id of the div that will display the email error message
 * @return true if the address is valid and false in the other case
 */
function verifyAndSubmitAddress(cssClass, phoneErrorId, emailErrorId) {
    var phoneValidation = true;
    var emailValidation = true;

    // Keep these rules aligned with the inline validation in editUserDetails.settingsDashboard.jsp.
    // variables: phoneRegex and emailRegex
    // condition: reject phone values shorter than 5 characters

    var phoneRegex = /^\+?[0-9_\- \(\)]*$/;

    var emailRegex = /^(?:[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z-]{2,})?$/;

    domQueryAll('.' + cssClass + '.phone').forEach(function(field) {
        if (field.value.length > 0 && field.value.length < 5) {
            phoneValidation = false;
        }
        if (field.value.length > 0 && !phoneRegex.test(field.value)) {
            phoneValidation = false;
        }
    });

    domQueryAll('.' + cssClass + '.email').forEach(function(field) {
        if (field.value.length > 0 && !emailRegex.test(field.value)) {
            emailValidation = false;
        }
    });

    //displaying the error messages
    var phoneError = document.getElementById(phoneErrorId);
    var emailError = document.getElementById(emailErrorId);

    setDisplay(phoneError, false);
    setDisplay(emailError, false);
    if (!phoneValidation) {
        showMessageForDuration(phoneError);
    }
    if (!emailValidation) {
        showMessageForDuration(emailError);
    }
    return phoneValidation && emailValidation;
}

/**
 * Update the privacy information for the user with their public/private properties.
 */
function updatePrivacyInformation(userNodeIdentifier) {
    // get selected public properties
    var publicPropertiesValues = domQueryAll('input[name="j:publicProperties"]:checked').map(function(field) {
        return field.value;
    });

    updateNodePropertyValues(userNodeIdentifier, "j:publicProperties", publicPropertiesValues)
        .then(() => reload());

}

/**
 * @Author : Jahia(rahmed)
 * This function changes the user Password calling the action changePassword.do
 * The new password is picked directly from the password change form in this page.
 * The error messages are displayed in the '#passwordErrors' div
 * The success messages are displayed in the '#passwordSuccess' div
 * @param oldPasswordMandatory: The error message for the empty old password case
 * @param confirmationMandatory: The error message for the empty confirmation case
 * @param passwordMandatory: The error message for the empty password case
 * @param passwordNotMatching: The error message for the non matching passwords case
 */
function changePassword(oldPasswordMandatory, confirmationMandatory, passwordMandatory, passwordNotMatching, saveOptions) {
    var normalizedSaveOptions = normalizeSaveOptions(saveOptions);
    var oldPasswordField = document.getElementById('oldPasswordField');
    var passwordField = document.getElementById('passwordField');
    var passwordConfirmField = document.getElementById('passwordconfirm');
    var passwordErrors = document.getElementById('passwordErrors');
    var passwordSuccess = document.getElementById('passwordSuccess');

    function showPasswordError(message, focusField) {
        if (passwordErrors) {
            passwordErrors.textContent = message == null ? '' : String(message);
            showMessageForDuration(passwordErrors);
        }
        if (focusField) {
            focusField.focus();
        }
    }

    //passwords checks
    if (!oldPasswordField || oldPasswordField.value === '') {
        showPasswordError(oldPasswordMandatory, oldPasswordField);
    } else if (!passwordField || passwordField.value === '') {
        showPasswordError(passwordMandatory, passwordField);
    } else if (!passwordConfirmField || passwordConfirmField.value === '') {
        showPasswordError(confirmationMandatory, passwordConfirmField);
    } else if (passwordField.value !== passwordConfirmField.value) {
        passwordField.value = '';
        passwordConfirmField.value = '';
        showPasswordError(passwordNotMatching, passwordField);
    } else {
        currentCssClass = 'passwordField';
        fetch(changePasswordUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                oldpassword: oldPasswordField.value,
                password: passwordField.value,
                passwordconfirm: passwordConfirmField.value
            }).toString()
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            return response.json();
        }).then(function(result) {
                if (result['result'] == 'success') {
                    if (typeof normalizedSaveOptions.onSuccess === 'function') {
                        normalizedSaveOptions.onSuccess(result);
                    } else if (window.userDashboardReactActions && typeof window.userDashboardReactActions.closeEditor === 'function') {
                        window.userDashboardReactActions.closeEditor();
                    } else {
                        switchRow('password');
                    }
                    if (passwordSuccess) {
                        passwordSuccess.classList.add('text-success');
                        passwordSuccess.textContent = result['errorMessage'] == null ? '' : String(result['errorMessage']);
                        showMessageForDuration(passwordSuccess);
                    }
                } else {
                    passwordField.value = '';
                    passwordConfirmField.value = '';
                    oldPasswordField.value = '';
                    showPasswordError(result['errorMessage'], domQuery('input[name="' + result['focusField'] + '"]'));
                }
        }).catch(function() {
            var result = {status: '404', message: 'standard error ...'};
            formError(result);
        });
    }
}

/* Edit User Details User Picture */
function getOrCreateProfileFolder(urlContext, userNodeIdentifier) {
    const getFilesProfileFolderQuery = /* GraphQL */ `
        query getFilesProfileFolder($userNodeIdentifier: String!) {
            jcr(workspace: EDIT) {
                nodeById(uuid: $userNodeIdentifier) {
                    children(names: ["files"]) {
                        nodes {
                            uuid
                            children(names: ["profile"]) {
                                nodes {
                                    name
                                    uuid
                                }
                            }
                        }
                    }
                }
            }
        }
    `;
    let profileFolderId;
    return execGraphQL(urlContext, getFilesProfileFolderQuery, {userNodeIdentifier: userNodeIdentifier}).then(response => {

            profileFolderId = response.data?.jcr?.nodeById?.children?.nodes[0]?.children?.nodes[0]?.uuid;
            if (!profileFolderId) {
                // the folder does not exist, try to create it
                const filesFolderId = response.data?.jcr?.nodeById?.children?.nodes[0]?.uuid;
                if (!filesFolderId) {
                    // the /files folder does not exist
                    return createFolder(urlContext, userNodeIdentifier, "files").then(id => createFolder(urlContext, id, "profile"))
                }
                return createFolder(urlContext, filesFolderId, "profile");
            }
            return profileFolderId;
        }
    ).catch(error => console.error("Unable to create the folder 'files/profile' for that user", error));
}

/**
 * Update the profile picture by updating the photo under /users/<users>/files/profile and by updating the user's property "j:picture".
 * If a profile photo already exists under /users/<users>/files/profile with the same name, it gets overwritten.
 * @param context {string} the URL context
 * @param userNodeIdentifier {string} JCR user's node identifier
 */
function updatePhoto(context, userNodeIdentifier, saveOptions) {
    var normalizedSaveOptions = normalizeSaveOptions(saveOptions);
    var uploadedImageField = document.getElementById('uploadedImage');
    var imageUploadEmptyError = document.getElementById('imageUploadEmptyError');

    if (!uploadedImageField || uploadedImageField.value === '') {
        showMessageForDuration(imageUploadEmptyError);
    } else {
        const uploadedPhoto = uploadedImageField.files[0];

        getOrCreateProfileFolder(context, userNodeIdentifier)
            .then(profileFolderId => {
                getChildIdByPath(profileFolderId, uploadedPhoto.name)
                    .then(previousPhotoId => {
                        if (previousPhotoId) {
                            return deleteNode(previousPhotoId);
                        }
                        return true;
                    })
                    .then(() => uploadFile(context, profileFolderId, uploadedPhoto))
                    .then(uploadedPhotoId => updateNodePropertyValue(userNodeIdentifier, "j:picture", uploadedPhotoId))
                    .then(function() {
                        return handleSaveSuccess(normalizedSaveOptions);
                    });
            })
    }
}

function deletePhoto(userId, saveOptions) {
    var normalizedSaveOptions = normalizeSaveOptions(saveOptions);
    deleteNodeProperty(userId, "j:picture")
        .then(function() {
            return handleSaveSuccess(normalizedSaveOptions);
        })
        .catch(error => formError(error));
}

function saveCkEditorChanges(nodeIdentifier, saveOptions) {
    var normalizedSaveOptions = normalizeSaveOptions(saveOptions);
    let editorValue;
    if (typeof CKEDITOR !== 'undefined') {
        const editor = CKEDITOR.instances['about_editor'];
        editorValue = editor.getData().trim();
    } else {
        // Use fallback <textarea id="about_editor"> in editUserDetails jsp if CKEDITOR is undefined
        var aboutEditor = document.getElementById('about_editor');
        editorValue = aboutEditor ? aboutEditor.value.trim() : '';
    }

    updateNodePropertyValue(nodeIdentifier, "j:about", editorValue)
        .then(function() {
            return handleSaveSuccess(normalizedSaveOptions);
        });
}


var currentElement = '';
var currentForm = '';

/**
 * @Author : Jahia(rahmed)
 * This function switches a row from the display view to the form view hiding other form view already active
 * @elementId : id of the row to switch
 */
function switchRow(elementId) {
    //building css element id
    var elementSelector = '#' + elementId;

    //building css form id
    var elementFormSelector = elementSelector + '_form';
    var displayElement = domQuery(elementSelector);
    var formElement = domQuery(elementFormSelector);
    //Checking which element to show and which element to hide
    if (displayElement && getComputedStyle(displayElement).display !== 'none') {
        if (currentForm != '') {
            setDisplay(domQuery(currentForm), false);
            setDisplay(domQuery(currentElement), true);
        }
        //Hide the display row
        setDisplay(displayElement, false);
        //Show the form
        setDisplay(formElement, true);
    } else {
        //Hide the Form
        setDisplay(formElement, false);
        //Show the display Row
        setDisplay(displayElement, true);
    }
    currentElement = elementSelector;
    currentForm = elementFormSelector;
}
