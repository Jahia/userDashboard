/* REST API GENERAL FUNCTIONS */

function formToJahiaCreateUpdateProperties(formId, nodeIdentifier, locale, fieldsClass, fullReload = false) {
    var deleteList = [];
    //JSon Serialized String
    var serializedForm;
    var serializedObject;
    var result;
    //Creating the Json String to send with the PUT request
    serializedObject = $(formId).serializeObject(fieldsClass, deleteList);
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
            reload(fullReload);
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
        execGraphQL(context,query,variables)
            .then(() => reload(fullReload));

    } else {
        reload(fullReload);
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
$.fn.serializeObject = function (fieldsClass, deleteTable) {
    var serializedArray;

    //index to browse the deleteTable
    var deleteIndex = 0;

    //Serializing the form (or the by cssCLass) to an Array
    if (fieldsClass === undefined) {
        serializedArray = this.serializeArray();
    } else {
        serializedArray = $('.' + fieldsClass + ':not([disabled])');
    }

    //Building the JSON Object from the array
    var serializedObject = {};

    //For each form element
    $.each(serializedArray, function () {
        var name = this.name;
        var value = this.value;

        //Adding to delete List all the form elements with empty values
        if (value == '') {
            if (this.attributes['data-undefined']?.value !== 'true') {
                // only delete it if it was defined before
                deleteTable[deleteIndex] = this.name;
                deleteIndex++;
            }
            this.setAttribute('data-undefined', true);
        } else {
            if (this.name != undefined && this.value != undefined) {
                //formatting dates
                if (this.getAttribute('jcrtype') != undefined && this.getAttribute('jcrtype') == 'Date') {
                    // Add Timezone to gmt as we are only picking date by day/month/year
                    value = new Date(value + 'T00:00:00.000').toISOString();
                }
                this.setAttribute('data-undefined', false);
                //adding to object
                if (serializedObject[name]) {
                    if (!serializedObject[name].push) {
                        serializedObject[name] = [serializedObject[name]];
                    }
                    serializedObject[name].push(value || '');
                } else {
                    serializedObject[name] = {'value': value || ''};
                }
            }
        }
    });
    return {'properties': serializedObject};
};

/* Edit User Details Functions */
/**
 * Reload the page.
 * @param fullReload whether to perform a full reload or not.
 */
var reload = function (fullReload = false) {
    if (fullReload) {
        var windowToRefresh = window.parent;
        if (windowToRefresh === undefined)
            windowToRefresh = window;
        windowToRefresh.location.reload();
    } else {
        $('#editDetailspage').load(getUrl);
    }
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

    if (result['status'] > 300) {
        if (result['status'] == 401) {
            //Lost session redirecting to login
            goToStart();
        } else if (result['status'] >= 400 && result['status'] < 500) {
            //other errors displaying default message
            $('.' + currentCssClass + '.otherErrorsMessage').hide();
            $('.' + currentCssClass + '.otherErrorsMessage').fadeIn('slow').delay(1500);
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
                $('.' + currentCssClass + '.errorMessage').html('');
                $('.' + currentCssClass + '.errorMessage').hide();
                $('.' + currentCssClass + '.errorMessage').stop().fadeIn();
                $('.' + currentCssClass + '.errorMessage').stop().fadeOut();
                $('.' + currentCssClass + '.errorMessage').html($('.' + currentCssClass + '.errorMessage').html() + '<div>' + errorMessage + '</div>');
                $('.' + currentCssClass + '.errorMessage').fadeIn('slow').delay(4000).fadeOut('slow');

            } else {
                //default error message
                $('.' + currentCssClass + '.otherErrorsMessage').hide();
                $('.' + currentCssClass + '.otherErrorsMessage').fadeIn('slow').delay(1500);
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

    // QA-5792: NOTE: Any change done the below variables and condition should be copied
    // and correctly translated in the /userDashboard/src/main/resources/jnt_editUserDetails/html/editUserDetails.bootstrap.jsp
    // at the QA-5792 marks:
    // variables: phoneRegex and emailRegex
    // conditions: && $(this).val().length < 5 for phone

    var phoneRegex = /^\+?[0-9_\- \(\)]*$/;

    var emailRegex = /^(?:[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z-]{2,})?$/;

    $.each($('.' + cssClass + '.phone'), function () {
        if ($(this).val().length > 0 && $(this).val().length < 5) {
            phoneValidation = false;
        }
        if ($(this).val().length > 0 && !phoneRegex.test($(this).val())) {
            phoneValidation = false;
        }
    });

    $.each($('.' + cssClass + '.email'), function () {
        if ($(this).val().length > 0 && !emailRegex.test($(this).val())) {
            emailValidation = false;
        }
    });

    //displaying the error messages
    $('#' + phoneErrorId).hide();

    $('#' + emailErrorId).hide();
    if (!phoneValidation) {
        $('#' + phoneErrorId).fadeIn('slow').delay(5000).fadeOut('slow');
    }
    if (!emailValidation) {
        $('#' + emailErrorId).fadeIn('slow').delay(5000).fadeOut('slow');
    }
    return phoneValidation && emailValidation;
}

/**
 * Update the privacy information for the user with their public/private properties.
 */
function updatePrivacyInformation() {
    // get selected public properties
    var publicPropertiesValues = $('input[name="j:publicProperties"]').filter(':checked').map(function () {
        return this.value;
    }).get();

    updateNodePropertyValues(nodeIdentifier, "j:publicProperties", publicPropertiesValues)
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
function changePassword(oldPasswordMandatory, confirmationMandatory, passwordMandatory, passwordNotMatching) {
    //passwords checks
    if ($('#oldPasswordField').val() == '') {
        $('#passwordErrors').hide();
        $('#passwordErrors').html(oldPasswordMandatory);
        $('#passwordErrors').fadeIn('slow').delay(5000).fadeOut('slow');
        $('#oldPasswordField').focus();
    } else if ($('#passwordField').val() == '') {
        $('#passwordErrors').hide();
        $('#passwordErrors').html(passwordMandatory);
        $('#passwordErrors').fadeIn('slow').delay(5000).fadeOut('slow');
        $('#passwordField').focus();
    } else if ($('#passwordconfirm').val() == '') {
        $('#passwordErrors').hide();
        $('#passwordErrors').html(confirmationMandatory);
        $('#passwordErrors').fadeIn('slow').delay(5000).fadeOut('slow');
        $('#passwordconfirm').focus();
    } else if ($('#passwordField').val() != $('#passwordconfirm').val()) {
        $('#passwordField').val('');
        $('#passwordconfirm').val('');
        $('#passwordErrors').hide();
        $('#passwordErrors').html(passwordNotMatching);
        $('#passwordErrors').fadeIn('slow').delay(5000).fadeOut('slow');
        $('#passwordField').focus();
    } else {
        currentCssClass = 'passwordField';
        $.post(changePasswordUrl, {
                oldpassword: $('#oldPasswordField').val(),
                password: $('#passwordField').val(),
                passwordconfirm: $('#passwordconfirm').val()
            },
            function (result) {
                if (result['result'] == 'success') {
                    switchRow('password');
                    $('#passwordSuccess').addClass('text-success');
                    $('#passwordSuccess').html(result['errorMessage']);
                    $('#passwordSuccess').fadeIn('slow').delay(5000).fadeOut('slow');
                } else {
                    $('#passwordField').val('');
                    $('#passwordconfirm').val('');
                    $('#oldPasswordField').val('');
                    $('#passwordErrors').hide();
                    $('#passwordErrors').html(result['errorMessage']);
                    $('#passwordErrors').fadeIn('slow').delay(5000).fadeOut('slow');
                    $('input[name=' + result['focusField'] + ']').focus();
                }
            },
            'json').fail(function () {
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
function updatePhoto(context, userNodeIdentifier) {
    if ($('#uploadedImage').val() == '') {
        $('#imageUploadEmptyError').fadeIn('slow').delay(5000).fadeOut('slow');
    } else {
        const uploadedPhoto = $('#uploadedImage').first().prop('files')[0];

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
                    .then(() => reload());
            })
    }
}

function deletePhoto(userId) {
    deleteNodeProperty(userId, "j:picture")
        .then(() => reload())
        .catch(error => formError(error));
}


function saveCkEditorChanges(nodeIdentifier) {

    var editor = CKEDITOR.instances['about_editor'];
    var editorValue = editor.getData().trim();

    updateNodePropertyValue(nodeIdentifier, "j:about", editorValue)
        .then(() => reload());

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
    elementId = '#' + elementId;

    //building css form id
    var elementFormId = elementId + '_form';
    //Checking which element to show and which element to hide
    if ($(elementId).is(':visible')) {
        if (currentForm != '') {
            $(currentForm).hide();
            $(currentElement).show();
        }
        //Hide the display row
        $(elementId).hide();
        //Show the form
        $(elementFormId).show();
    } else {
        //Hide the Form
        $(elementFormId).hide();
        //Show the display Row
        $(elementId).show();
    }
    currentElement = elementId;
    currentForm = elementFormId;
}