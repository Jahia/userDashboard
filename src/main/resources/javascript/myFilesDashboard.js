/**
 * Created by dgaillard on 19/03/14.
 */

var uploadedFilesExpected = 0;

function ensureMyFilesDialogOverlay() {
    var overlay = document.getElementById('ud-myfiles-dialog-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ud-myfiles-dialog-overlay';
        overlay.className = 'ud-dialogOverlay';
        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                closeMyFilesDialog();
            }
        });
        document.body.appendChild(overlay);
    }

    return overlay;
}

function closeMyFilesDialog() {
    var overlay = document.getElementById('ud-myfiles-dialog-overlay');
    if (overlay) {
        overlay.classList.remove('is-open');
        overlay.innerHTML = '';
    }
    document.body.classList.remove('ud-modal-open');
}

function openMyFilesDialog(options) {
    var overlay = ensureMyFilesDialogOverlay();
    var dialog = document.createElement('div');
    dialog.className = 'ud-dialog';

    var header = document.createElement('div');
    header.className = 'ud-dialog__header';

    var title = document.createElement('h3');
    title.textContent = options.title || '';
    header.appendChild(title);

    var closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'ud-dialog__close';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', closeMyFilesDialog);
    header.appendChild(closeButton);

    var body = document.createElement('div');
    body.className = 'ud-dialog__body';
    body.innerHTML = options.message || '';

    var footer = document.createElement('div');
    footer.className = 'ud-dialog__footer';

    (options.buttons || []).forEach(function(buttonConfig) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = buttonConfig.primary ? 'ud-list-button ud-list-button--primary' : 'ud-list-button';
        button.textContent = buttonConfig.label;
        button.addEventListener('click', function() {
            var shouldClose = true;
            if (buttonConfig.callback) {
                shouldClose = buttonConfig.callback(dialog, body) !== false;
            }

            if (shouldClose) {
                closeMyFilesDialog();
            }
        });
        footer.appendChild(button);
    });

    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    overlay.innerHTML = '';
    overlay.appendChild(dialog);
    overlay.classList.add('is-open');
    document.body.classList.add('ud-modal-open');

    return dialog;
}

function showMyFilesAlert(title, message, callback) {
    openMyFilesDialog({
        title: title,
        message: message,
        buttons: [{
            label: labelOK,
            primary: true,
            callback: function() {
                if (callback) {
                    callback();
                }
            }
        }]
    });
}

function bbShowVideo(name, path, type) {
    showMyFilesAlert(name, '<div class="ud-dialog__media"><video controls><source src="' + path + '" type="' + type + '"></video><a class="ud-list-button ud-list-button--primary" href="' + path + '" download>' + labelOK + '</a></div>');
}

function bbShowAudio(name, path, type) {
    showMyFilesAlert(name, '<div class="ud-dialog__media"><audio controls><source src="' + path + '" type="' + type + '"></audio><a class="ud-list-button ud-list-button--primary" href="' + path + '" download>' + labelOK + '</a></div>');
}

function bbShowImage(name, path, width, height) {
    showMyFilesAlert(name, '<div class="ud-dialog__media"><img src="' + path + '" alt="' + name + '" width="' + width + '" height="' + height + '"></div>');
}

function addInputForAddFile() {
    addFileIndex++;
    var form = document.getElementById('fileFormUpload');
    if (!form) {
        return;
    }

    var input = document.createElement('input');
    input.type = 'file';
    input.name = 'file';
    input.id = 'file' + addFileIndex;
    form.appendChild(input);
}

function bbDelete(name, id) {
    openMyFilesDialog({
        title: labelDelete + ' : ' + name,
        message: '<p>' + myFilesDeleteBox + '&nbsp;' + name + ' ?</p>',
        buttons: [{
            label: labelCancel
        }, {
            label: labelDelete,
            primary: true,
            callback: function() {
                const query = /* GraphQL */ `
                    mutation deleteNode($fileId: String!) {
                        jcr(workspace: EDIT) {
                            deleteNode(pathOrId: $fileId)
                        }
                    }
                `;
                const variables = {fileId: id};
                execGraphQL(context, query, variables)
                    .then(() => window.location.reload())
                    .catch(error => showMyFilesAlert(labelError, myFilesDeleteError + '&nbsp;:&nbsp;' + name + '<br />' + error));
            }
        }]
    });
}

function endAddFile(fileName, status, messageError) {
    index += 1;
    if (fileName !== '') {
        fileUp.push([fileName, status, messageError]);
    }

    if (index === uploadedFilesExpected) {
        var table = '<table class="ud-dialog__table"><thead><tr><th>' + labelName + '</th><th>' + labelStatus + '</th><th>' + labelMessage + '</th></tr></thead><tbody>';
        for (var j = 0; j < fileUp.length; j++) {
            if (fileUp[j][1] === 'error') {
                table += '<tr><td>' + fileUp[j][0] + '</td><td><span class="ud-statusBadge ud-statusBadge--error">' + labelError + '</span></td><td>' + fileUp[j][2] + '</td></tr>';
            } else {
                table += '<tr><td>' + fileUp[j][0] + '</td><td><span class="ud-statusBadge ud-statusBadge--success">' + labelOK + '</span></td><td>' + fileUp[j][2] + '</td></tr>';
            }
        }
        table += '</tbody></table>';
        showMyFilesAlert(myFilesUploadedFiles, table, function() {
            window.location.reload();
        });
    }
}

function collectSelectedFiles(container) {
    return Array.prototype.slice.call(container.querySelectorAll('input[type=file]')).map(function(input) {
        return input.files && input.files[0] ? input.files[0] : null;
    }).filter(function(file) {
        return !!file;
    });
}

function getMyFilesInvalidNamePattern() {
    return /[:/<>[\]*|"\\]/;
}

function validateSelectedFiles(files) {
    var invalidNamePattern = getMyFilesInvalidNamePattern();
    var invalidFiles;

    if (!files.length) {
        return myFilesEmptyUploadError || labelUploadFile;
    }

    invalidFiles = files.filter(function(file) {
        return invalidNamePattern.test(file.name);
    });

    if (invalidFiles.length) {
        return myFilesUploadedFileErrorCharacters + '<br><br>' + invalidFiles.map(function(file) {
            return file.name;
        }).join('<br>');
    }

    return '';
}

function uploadSelectedFiles(contextValue, folderId, files) {
    index = 0;
    fileUp = [];
    uploadedFilesExpected = files.length;

    if (!files.length) {
        showMyFilesAlert(labelError, myFilesEmptyUploadError || labelUploadFile);
        return;
    }

    files.forEach(function(file) {
        uploadFile(contextValue, folderId, file)
            .then(function() {
                endAddFile(file.name, 'success', '');
            })
            .catch(function(error) {
                endAddFile(file.name, 'error', error);
            });
    });
}

function bbAddFile(contextValue, rootFolderMissing) {
    addFileIndex = 0;
    openMyFilesDialog({
        title: labelUploadFile,
        message: '<div class="ud-site-form__field"><label>' + labelAddFile + '</label><button class="ud-list-button" type="button" onclick="addInputForAddFile()">' + labelAddFile + '</button><form id="fileFormUpload" enctype="multipart/form-data"><input name="file" type="file" id="file0"></form><div class="ud-dialog__notice"><strong>' + myFilesAlertInfoCharacters + '&nbsp;:</strong><br>: / \\ | " < > [ ] *</div></div>',
        buttons: [{
            label: labelCancel
        }, {
            label: labelAdd,
            primary: true,
            callback: function(dialog) {
                var files = collectSelectedFiles(dialog);
                var validationMessage = validateSelectedFiles(files);

                if (validationMessage) {
                    showMyFilesAlert(labelError, validationMessage);
                    return false;
                }

                if (rootFolderMissing) {
                    createFolder(contextValue, userNodeId, 'files')
                        .then(function(id) {
                            uploadSelectedFiles(contextValue, id, files);
                        })
                        .catch(function(error) {
                            showMyFilesAlert(labelError, myFilesCreateFolderError + '&nbsp;:<br><br>' + error);
                        });
                } else {
                    uploadSelectedFiles(contextValue, currentFolderId, files);
                }
            }
        }]
    });
}

function bbAddFolder(contextValue, rootFolderMissing) {
    openMyFilesDialog({
        title: myFilesCreateNewFolder,
        message: '<div class="ud-site-form__field"><label for="nameFolder">' + labelName + '</label><input type="text" id="nameFolder"><div class="ud-dialog__notice"><strong>' + myFilesAlertInfoCharacters + '&nbsp;:</strong><br>: / \\ | " < > [ ] *</div></div>',
        buttons: [{
            label: labelCancel
        }, {
            label: labelCreateFolder,
            primary: true,
            callback: function(dialog) {
                var regex = getMyFilesInvalidNamePattern();
                var folderNameInput = dialog.querySelector('#nameFolder');
                var folderName = folderNameInput ? folderNameInput.value.trim() : '';

                if (!folderName || regex.test(folderName)) {
                    showMyFilesAlert(labelError, myFilesCreateFolderErrorCharacters);
                    return false;
                }

                function errorHandler(error) {
                    showMyFilesAlert(labelError, myFilesCreateFolderError + '&nbsp;:<br><br>' + error);
                }

                if (rootFolderMissing) {
                    createFolder(contextValue, userNodeId, 'files')
                        .then(function(id) {
                            return createFolder(contextValue, id, folderName);
                        })
                        .then(function() {
                            window.location.reload();
                        })
                        .catch(function(error) {
                            errorHandler(error);
                        });
                } else {
                    createFolder(contextValue, currentFolderId, folderName)
                        .then(function() {
                            window.location.reload();
                        })
                        .catch(function(error) {
                            errorHandler(error);
                        });
                }

                return false;
            }
        }]
    });
}

function contentEditorExitHandler() {
    window.location.reload();
}

function editInContentEditor(uuid, locale, uilocale, site) {
    if (window.top.contentEditorEventHandlers && !window.top.contentEditorEventHandlers['filesDashboard']) {
        window.top.contentEditorEventHandlers['filesDashboard'] = contentEditorExitHandler;
    } else {
        window.top.contentEditorEventHandlers = {filesDashboard: contentEditorExitHandler};
    }
    if (window.parent.jahia && window.parent.jahia.reduxStore) {
        site = window.parent.jahia.reduxStore.getState().site;
    }
    if (window.top.CE_API !== undefined) {
        window.top.CE_API.edit(uuid, site, locale, uilocale);
    }
};

function bbCreateFile(context) {
    for (var i = 0; i <= addFileIndex; i++) {
        var input = document.getElementById('file' + i);
        if (input && input.value !== '') {
            const uploadedFile = input.files[0];
            uploadFile(context, currentFolderId, uploadedFile)
                .then(() => endAddFile(uploadedFile.name, 'success', ''))
                .catch(error => endAddFile(uploadedFile.name, 'error', error))
        } else {
            endAddFile('', '', '');
        }
    }
}

function myFilesSliderStep(id, delta) {
    var slider = document.getElementById(id);
    if (!slider) {
        return;
    }

    var slides = slider.querySelectorAll('.ud-myFiles-slide');
    if (!slides.length) {
        return;
    }

    var currentIndex = parseInt(slider.getAttribute('data-current-index') || '0', 10);
    var nextIndex = (currentIndex + delta + slides.length) % slides.length;

    slides[currentIndex].classList.remove('is-active');
    slides[nextIndex].classList.add('is-active');
    slider.setAttribute('data-current-index', nextIndex);
}

document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
        closeMyFilesDialog();
    }
});
