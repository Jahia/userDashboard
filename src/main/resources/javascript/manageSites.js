function getElement(id) {
    return document.getElementById(id);
}

function openModal(element) {
    if (!element) {
        return;
    }

    element.classList.add('is-open');
    element.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ud-modal-open');
}

function closeModal(element) {
    if (!element) {
        return;
    }

    element.classList.remove('is-open');
    element.setAttribute('aria-hidden', 'true');

    if (!document.querySelector('.ud-site-modal.is-open')) {
        document.body.classList.remove('ud-modal-open');
    }
}

function submitJsonForm(formId) {
    var form = getElement(formId);

    if (!form) {
        return Promise.reject(new Error('Missing form ' + formId));
    }

    return fetch(form.getAttribute('action'), {
        method: (form.getAttribute('method') || 'POST').toUpperCase(),
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: new FormData(form)
    }).then(function(response) {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    });
}

function modalSiteEditProperties(node) {
    openModal(getElement("editSiteDiv" + node));
    return false;
}

function hideSiteEditProperties(node) {
    closeModal(getElement("editSiteDiv" + node));
    return false;
}

function editProperties(id) {
    showLoading();
    submitJsonForm('editSiteForm' + id)
        .then(function(response) {
            if (response.warn != undefined) {
                alert(response.warn);
                hideLoading();
            } else {
                window.location.reload();
            }
        })
        .catch(function() {
            hideLoading();
        });
}

function createSite() {
    showLoading();
    submitJsonForm('webProjectCreationForm')
        .then(function(response) {
            if (response.warn != undefined) {
                alert(response.warn);
                hideLoading();
            } else {
                window.location.reload();
            }
        })
        .catch(function() {
            hideLoading();
        });
    return true;
}

var exportPendingResetTimer = null;

function setExportPendingState(isPending, activeButton) {
    var status = getElement('exportStatus');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('#exportLiveButton, #exportStagingButton'));

    document.body.setAttribute('data-ud-export-pending', isPending ? 'true' : 'false');

    buttons.forEach(function(button) {
        if (!button) {
            return;
        }

        if (isPending) {
            button.disabled = true;
            button.setAttribute('aria-disabled', 'true');
            button.classList.toggle('is-loading', button === activeButton);
        } else {
            button.classList.remove('is-loading');
        }
    });

    if (status) {
        status.hidden = !isPending;
    }

    if (!isPending && typeof window.updateProjectExportButtonsState === 'function') {
        window.updateProjectExportButtonsState();
    }
}

function clearExportPendingState() {
    if (exportPendingResetTimer) {
        window.clearTimeout(exportPendingResetTimer);
        exportPendingResetTimer = null;
    }

    setExportPendingState(false);
}

function exportSite(url, live, title, triggerButton) {
    var sitecheckbox = Array.prototype.slice.call(document.querySelectorAll('.sitecheckbox:checked'));
    if (sitecheckbox.length === 0) {
        window.alert(title);
        return false;
    } else {
        Array.prototype.slice.call(document.querySelectorAll('.addedInput')).forEach(function(input) {
            input.remove();
        });

        if (sitecheckbox.length === 1) {
            var siteName = sitecheckbox[0].getAttribute("name");
            url = url.replace("/cms/export/default/sites", "/cms/export/default/" + siteName);
        }
        sitecheckbox.forEach(function(checkbox) {
            var hiddenInput = document.createElement('input');
            hiddenInput.className = 'addedInput';
            hiddenInput.type = 'hidden';
            hiddenInput.name = 'sitebox';
            hiddenInput.value = checkbox.getAttribute('name');
            getElement('exportForm').appendChild(hiddenInput);
        });
        var exportForm = getElement('exportForm');
        var liveInput = exportForm.querySelector('input[name=live]');
        if (liveInput) {
            liveInput.value = live;
        }
        exportForm.setAttribute("action", url);
        setExportPendingState(true, triggerButton || null);
        window.addEventListener('focus', clearExportPendingState, {once: true});
        exportPendingResetTimer = window.setTimeout(clearExportPendingState, 15000);
        exportForm.submit();
        return false;
    }
}

function showLoading() {
    Array.prototype.slice.call(document.querySelectorAll('.loading')).forEach(function(element) {
        element.style.display = '';
        document.body.appendChild(element);
    });
}

function hideLoading() {
    Array.prototype.slice.call(document.querySelectorAll('.loading')).forEach(function(element) {
        element.style.display = 'none';
    });
}

document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
        Array.prototype.slice.call(document.querySelectorAll('.ud-site-modal.is-open')).forEach(function(element) {
            closeModal(element);
        });
    }
});