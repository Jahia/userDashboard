<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="uiComponents" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="flowRequestContext" type="org.springframework.webflow.execution.RequestContext"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>

<template:addResources type="css" resources="datatables/css/bootstrap-theme.css,tablecloth.css"/>
<template:addResources type="css" resources="files.css"/>

<template:addResources type="javascript" resources="jquery.min.js,jquery-ui.min.js,jquery.blockUI.js"/>
<template:addResources type="javascript" resources="datatables/jquery.dataTables.js,i18n/jquery.dataTables-${currentResource.locale}.js,datatables/dataTables.bootstrap-ext.js,settings/dataTables.initializer.js"/>
<template:addResources type="javascript" resources="bootbox.min.js"/>
<template:addResources type="javascript" resources="jquery.ajaxfileupload.js"/>
<template:addResources type="javascript" resources="myFilesDashboard.js"/>

<fmt:message key="label.workInProgressTitle" var="i18nWaiting"/>
<c:set var="i18nWaiting" value="${functions:escapeJavaScript(i18nWaiting)}"/>
<c:set var="apiPath" value="${url.context}/modules/api/jcr/v1/default/${currentResource.locale}"/>

<c:set var="displayPath" value="${currentUser.localPath}/files"/>
<c:if test="${not empty param['path']}">
    <c:set var="displayPath" value="${functions:decodeUrlParam(param['path'])}"/>
</c:if>

<jcr:node var="folderNode" path="${displayPath}"/>

<script type="text/javascript">

    var apiPath = '${apiPath}';

    var currentNodePath = '${functions:escapeJavaScript(displayPath)}';
    var currentFolderId = '${not empty folderNode ? folderNode.identifier : ""}';
    var userNodeId = '${renderContext.mainResource.node.identifier}';

    var myFilesDeleteBox = "<fmt:message key="myFiles.deleteBox"/>";
    var myFilesDeleteError = "<fmt:message key="myFiles.deleteError"/>";
    var myFilesUpdateTagsError = "<fmt:message key="myFiles.updateTagsError"/>";
    var myFilesRenameFolderError = "<fmt:message key="myFiles.renameFolderError"/>";
    var myFilesRenameErrorCharacters = "<fmt:message key="myFiles.renameErrorCharacters"/>";
    var myFilesRenameFileError = "<fmt:message key="myFiles.renameFileError"/>";
    var myFilesUploadedFiles = "<fmt:message key="myFiles.uploadedFiles"/>";
    var myFilesUploadedFileErrorCharacters = "<fmt:message key="myFiles.uploadedFileErrorCharacters"/>";
    var myFilesAlertInfoCharacters = "<fmt:message key="myFiles.alertInfoCharacters"/>";
    var myFilesCreateNewFolder = "<fmt:message key="myFiles.createNewFolder"/>";
    var myFilesCreateFolderError = "<fmt:message key="myFiles.createFolderError"/>";
    var myFilesCreateFolderErrorCharacters = "<fmt:message key="myFiles.createFolderErrorCharacters"/>";
    var labelDelete = "<fmt:message key="label.delete"/>";
    var labelCancel = "<fmt:message key="label.cancel"/>";
    var labelError = "<fmt:message key="label.error"/>";
    var labelRename = "<fmt:message key="label.rename"/>";
    var labelNewDirName = "<fmt:message key="newDirName.label"/>";
    var labelNewName = "<fmt:message key="newName.label"/>";
    var labelName = "<fmt:message key="label.name"/>";
    var labelStatus = "<fmt:message key="label.status"/>";
    var labelMessage = "<fmt:message key="label.message"/>";
    var labelOK = "<fmt:message key="label.ok"/>";
    var labelAddFile = "<fmt:message key="addFile.label"/>";
    var labelUploadFile = "<fmt:message key="uploadFile.label"/>";
    var labelAdd = "<fmt:message key="label.add"/>";
    var labelCreateFolder = "<fmt:message key="label.createFolder"/>";

    var addFileIndex = 0;
    var index = 0;
    var fileUp = [];
</script>

<div class="page-header">
    <c:set var="mainNode" value="${renderContext.mainResource.node}"/>
    <h2><fmt:message key="mySettings.myFiles.label"/> - ${fn:escapeXml(mainNode.displayableName)}</h2>
</div>

<c:choose>
    <c:when test="${not empty param['view']}">
        <c:set var="displayView" value="${functions:decodeUrlParam(param['view'])}"/>
        <c:if test="${displayView eq 'icon'}">
            <%@include file="myFilesDashboard.settingsBootstrap3GoogleMaterialStyle.folder-icon.jspf" %>
        </c:if>
        <c:if test="${displayView eq 'slider'}">
            <%@include file="myFilesDashboard.settingsBootstrap3GoogleMaterialStyle.folder-slider.jspf" %>
        </c:if>
    </c:when>
    <c:otherwise>
        <c:set var="displayView" value=""/>
        <%@include file="myFilesDashboard.settingsBootstrap3GoogleMaterialStyle.folder.jspf" %>
    </c:otherwise>
</c:choose>





