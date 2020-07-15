function modalSiteEditProperties(node) {
    $("#editSiteDiv"+node).modal('show');
    return false;
}

function editProperties(id) {
    showLoading();
    $('#editSiteForm'+id).ajaxSubmit({
        dataType: "json",
        success: function(response) {
            if (response.warn != undefined) {
                alert(response.warn);
                hideLoading();
            } else {
                window.location.reload();
            }
        },
        error: function(response) {
            hideLoading();
        }
    });
}

function createSite() {
    showLoading();
    $('#webProjectCreationForm').ajaxSubmit({
        dataType: "json",
        success: function(response) {
            if (response.warn != undefined) {
                alert(response.warn);
                hideLoading();
            } else {
                window.location.reload();
            }
        },
        error: function(response) {
            hideLoading();
        }
    });
    return true;
}

function exportSite(url,live,title) {
    var sitecheckbox = $('.sitecheckbox:checked');
    if (sitecheckbox.length == 0) {
        $('#modal-nothing-selected').text(title);
        $('#nothing-selected').modal('show');
    } else {
        $(".addedInput").remove();

        if (sitecheckbox.length == 1) {
            name = sitecheckbox.attr("name");
            url = url.replace("/cms/export/default/sites","/cms/export/default/"+name);
        }
        sitecheckbox.each(function (index) {
            $('<input class="addedInput" type="hidden" name="sitebox" value="'+$(this).attr("name")+'">').appendTo("#exportForm")
        });
        var exportForm = $('#exportForm');
        exportForm.find('input[name=live]').val(live);
        exportForm.attr("action",url);
        exportForm.submit();
    }
}

function showLoading() {
    $('.loading').show();
    $(".loading").appendTo("body");
}

function hideLoading() {
    $('.loading').each(function () {
        $(this).hide();
    });
}
