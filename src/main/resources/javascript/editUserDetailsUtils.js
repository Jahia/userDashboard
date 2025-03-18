/* REST API GENERAL FUNCTIONS */
/**
 * @Author : Jahia(rahmed)
 * This function make an ajax call to the Jahia API and return the result of this call
 * @param workspace : the workspace to use on this call (live, default)
 * @param locale : the locale to use in ISO 639-1
 * @param way : the way to find the JCR entity on which make the call (nodes, byPath, byType)
 * @param method : the METHOD to call (GET, POST, PUT, DELETE ...)
 * @param endOfURI : the information needed to complete the entity search (id if the way is nodes, path if byPath and type if byType) with the options (/propertie/<propertieName> for example)
 * @param json : the Json to pass with the call
 * @param callback : the callback function for the request (Optional)
 * @param errorCallback : the error function for the request (Optional)
 * @return callResult : the result of the Ajax call
 */
function jahiaAPIStandardCall(urlContext, workspace, locale, way, endOfURI, method, json, callback, errorCallback) {
    var callResult;
    var url = urlContext + '/' + API_URL_START + '/' + workspace + '/' + locale + '/' + way + (way == 'paths' ? '' : '/') + endOfURI;
    var httpResult = $.ajax({
        contentType: 'application/json',
        data: json,
        dataType: 'json',
        processData: false,
        type: method,
        url: url,
        success: function (result) {
            result['status'] = httpResult.status;
            //calling the callback
            if (callback) {
                callback(result, json);
            }
            callResult = result;
        },
        error: function (result) {
            result['status'] = httpResult.status;
            return errorCallback(result, json);

        }
    });

    return callResult;
}

function formToJahiaCreateUpdateProperties(formId, nodeIdentifier, locale, fieldsClass, fullReload = false) {
    var deleteList = [];
    //JSon Serialized String
    var serializedForm;
    var serializedObject;
    var result;
    //Creating the Json String to send with the PUT request
    serializedObject = $(formId).serializeObject(fieldsClass, deleteList);
    deleteProperties = '';
    if (deleteList.length > 0) {
        deleteProperties = deleteList.map(key => {
            aliasName = key.replace(/[^a-zA-Z0-9_$]/g, '_');
            return `
      ${aliasName}: mutateProperty(name:"${key}") {
        delete
      }
  `;
        }).join('\n');
    }

    if (serializedObject != '{"properties":{"undefined":{"value":""}}}' && serializedObject != '{"properties":{}}') {
        const mutateProperties = Object.keys(serializedObject.properties).map(key => {
            aliasName = key.replace(/[^a-zA-Z0-9_$]/g, '_');
            return `
      ${aliasName}: mutateProperty(name:"${key}") {
        setValue(value:"${serializedObject.properties[key].value}")
      }
  `;
        }).join('\n');

        if (!(mutateProperties || deleteProperties)) {
            // there is nothing to update
            reloadOnSuccess(fullReload);
            return;
        }
        const query = `
          mutation updateProperties($nodeId: String!) {
            jcr(workspace: EDIT) {
              mutateNode(pathOrId: $nodeId) {
                ${mutateProperties}
                ${deleteProperties}
              }
            }
          }
        `;
        console.log(query);
        const variables = {nodeId: nodeIdentifier};
        execGraphQL(context, query, variables, () => reloadOnSuccess(fullReload));

    } else {
        reloadOnSuccess(fullReload);
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
 * @Author : Jahia(rahmed)
 * Edit User Details Callback Function
 * This function is called after the user properties Update
 * if the propertie preferredLanguage is updated the page is fully reloaded
 * in the other case an ajax load is enough to refresh the properties display
 * @param result : The PUT request result
 * @param sent : The sent Json with the PUT request (to check for the preferredLanguage Properties)
 */
var ajaxReloadCallback = function (result, sent) {
    if (sent != undefined && (sent.indexOf('preferredLanguage') != -1 && currentCssClass != 'privacyField')) {
        var windowToRefresh = window.parent;
        if (windowToRefresh == undefined)
            windowToRefresh = window;
        windowToRefresh.location.reload();
    } else {
        $('#editDetailspage').load(getUrl);
    }
};
var reloadOnSuccess = function (fulReload = false) {
    if (fulReload) {
        var windowToRefresh = window.parent;
        if (windowToRefresh == undefined)
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
 * @Author : Jahia(rahmed)
 * This function is called after the user picture Upload
 * to check if the avatar is created
 * @param testUrl: the file url to test
 * @return: 200 for success and 0 or negative value on error
 */
function urlExists(testUrl) {
    var http = jQuery.ajax({
        type: 'GET',
        url: testUrl,
        async: false
    });
    return http.status;
}

/**
 * @Author : Jahia(rahmed)
 * This function post the privacy properties in order to update JCR
 * The post is in string in order to allow multiple values on publicProperties.
 * @param propertiesNumber: The number of properties in the loop
 * @param idNumber: The id of the switch triggering the update (for the check image near the switch)
 * @param value: State of the property switch
 * @param nodeIdentifier: The end of URI for the jahia API Standard Call is the user id
 * @param locale: The locale for the jahia API Standard Call
 */
function editVisibility(propertiesNumber, idNumber, value, nodeIdentifier, locale) {
    // get selected public properties
    var publicPropertiesValues = $('input[name="j:publicProperties"]').filter(':checked').map(function () {
        return this.value;
    }).get();

    const query = `
    mutation updateVisibility($nodeId: String!, $values: [String]!) {
      jcr(workspace: EDIT) {
        mutateNode(pathOrId: $nodeId) {
          mutateProperties(names:"j:publicProperties") {
            setValues(values:$values)
          }
        }
      }
    }
`;
    const variables = { nodeId: nodeIdentifier, values: publicPropertiesValues };
    execGraphQL(context, query, variables, reloadOnSuccess);

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
    const getFilesProfileFolderQuery = `
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
    return execGraphQLPromise(urlContext, getFilesProfileFolderQuery, {userNodeIdentifier: userNodeIdentifier}).then(response => {

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
 * @Author : Jahia(rahmed)
 * This function Upload a picture the user picked and update his user picture property with it
 * The picture to upload is directly picked from the form
 * @param imageId : The id of the input file form field
 * @param locale: The locale for the API call URL build
 * @param nodepath : The path of the user node for the API call URL build
 * @param userId : The user Id for the picture propertie Update
 * @param callbackFunction : the callback function
 * @param errorFunction : The error callback function
 */
/**
 *
 * @param context {string} the URL context
 * @param userNodeIdentifier {string} JCR node's identifier of the user
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
                        console.log('previousPhotoId', previousPhotoId);
                        if (previousPhotoId) {
                            return deleteNode(previousPhotoId);
                        }
                        return true;
                    })
                    .then(() => uploadFile(context, profileFolderId, uploadedPhoto))
                    .then(uploadedPhotoId => updateNodeProperty(userNodeIdentifier, "j:picture", uploadedPhotoId))
                    .then(() => reloadOnSuccess());
            })
    }
}

function deletePhoto(userId) {
    deleteNodeProperty(userId, "j:picture")
        .then(() => reloadOnSuccess())
        .catch(error => formError(error));
}

/**
 * @Author : Jahia(rahmed)
 * This function make a JSON Post of ckeditor contained in a Row
 * It also defines the error message div css class for the error callback
 * The div has to be defined following the pattern : <ID>Field
 * @param rowId: the Id of the from which post the form entries
 * @param nodeIdentifier : the endofURI for the Jahia API Standard Call
 * @param locale : the locale for the Jahia API Standard Call
 * @param callback : the callback function for the Jahia API Standard Call
 * @param errorCallback : the error callback function for the Jahia API Standard Call
 */
function saveCkEditorChanges(rowId, nodeIdentifier, locale, callback, errorCallback) {

    //Opening the JSON
    var jsonPropTable = {};
    var jsonTable = {};

    //getting the ckeditors
    var editorId = rowId + '_editor';
    var editor = CKEDITOR.instances[editorId];
    var editorValue = editor.getData().trim();

    jsonPropTable['j:' + rowId] = {'value': editorValue};

    jsonTable['properties'] = jsonPropTable;

    //calling ajax POST
    var myJSONText = JSON.stringify(jsonTable);
    currentCssClass = rowId + 'Field';

    //Calling the Jahia Restful API to Update the node
    jahiaAPIStandardCall(context, 'default', locale, 'nodes', nodeIdentifier, 'PUT', myJSONText, callback, errorCallback);
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