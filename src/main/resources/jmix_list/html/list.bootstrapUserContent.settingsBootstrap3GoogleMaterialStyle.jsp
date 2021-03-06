<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
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


<template:addResources type="javascript"
                       resources="jquery.min.js,jquery-ui.min.js,jquery.blockUI.js, workInProgress.js, jquery.metadata.js"/>
<template:addResources type="javascript"
                       resources="datatables/jquery.dataTables.js,i18n/jquery.dataTables-${currentResource.locale}.js,datatables/dataTables.bootstrap-ext.js, settings/dataTables.initializer.js"/>
<template:addResources type="javascript" resources="moment-with-langs.min.js,bootstrap-filestyle.min.js"/>
<template:addResources type="css" resources="datatables/css/bootstrap-theme.css,tablecloth.css"/>
<template:addResources type="javascript" resources="bootbox.min.js"/>
<fmt:message key="label.workInProgressTitle" var="i18nWaiting"/><c:set var="i18nWaiting"
                                                                       value="${functions:escapeJavaScript(i18nWaiting)}"/>
<template:addResources>
    <script type="text/javascript">
        $(document).ready(function () {
            $(":file").filestyle({classButton: "btn", classIcon: "icon-folder-open"/*,buttonText:"Translation"*/});
        });
    </script>
    <script type="text/javascript">
        $(document).ready(function () {
            jQuery.extend(jQuery.fn.dataTableExt.oSort, {
                "date-pages-pre": function (a) {
                    var ukDatea = $(a).text().split('by');
                    var momentread = moment(ukDatea[0].trim(), "DD, MMMM YYYY HH:mm");
                    return momentread;
                },

                "date-pages-asc": function (a, b) {
                    return (a.diff(b) < 0) ? -1 : ((a.diff(b) > 0) ? 1 : 0);
                },

                "date-pages-desc": function (a, b) {
                    return (a.diff(b) < 0) ? 1 : ((a.diff(b) > 0) ? -1 : 0);
                }
            });
            var dtOptions = {
                "aoColumns": [
                    null,
                    null,
                    {"sType": "date-pages"},
                    {"sType": "date-pages"},
                    {"sType": "date-pages"}
                ]};
            dataTablesSettings.init('userContent_table', 25, null, null, null, dtOptions);
        });



    </script>
</template:addResources>

<template:include view="hidden.header"/>

<div class="page-header">
    <c:set var="mainNode" value="${renderContext.mainResource.node}"/>
    <h2><fmt:message key="system.myPages"/></h2>
</div>

<div class="panel panel-default">
    <div class="panel-body">
        <c:if test="${not empty moduleMap.currentList}">
            <fieldset>
                <table cellpadding="0" cellspacing="0" border="0" class="table table-hover table-striped  table-bordered" id="userContent_table">
                    <thead>
                    <tr>
                        <th>
                            <fmt:message key='label.site'/>
                        </th>
                        <th>
                            <fmt:message key='myPages.link'/>
                        </th>
                        <th>
                            <fmt:message key='mix_created'/>
                        </th>
                        <th>
                            <fmt:message key='jmix_contentmetadata.j_lastModificationDate'/>
                        </th>
                        <th>
                            <fmt:message key='jmix_contentmetadata.j_lastPublishingDate'/>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <%@include file="userContentTableRow.settingsBootstrap3GoogleMaterialStyle.jspf" %>
                    </tbody>
                </table>
            </fieldset>
        </c:if>
    </div>
</div>

<c:if test="${functions:length(moduleMap.currentList) == 0 and not empty moduleMap.emptyListMessage}">
    ${moduleMap.emptyListMessage}
</c:if>

<c:if test="${moduleMap.editable and renderContext.editMode && !resourceReadOnly}">
    <template:module path="*"/>
</c:if>
<template:include view="hidden.footer"/>