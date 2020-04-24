<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="query" uri="http://www.jahia.org/tags/queryLib" %>
<%@ taglib prefix="facet" uri="http://www.jahia.org/tags/facetLib" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>

<template:addResources type="javascript"
                       resources="jquery.min.js,jquery-ui.min.js,jquery.blockUI.js, workInProgress.js, jquery.metadata.js"/>
<template:addResources type="javascript"
                       resources="datatables/jquery.dataTables.js,i18n/jquery.dataTables-${currentResource.locale}.js,datatables/dataTables.bootstrap-ext.js, settings/dataTables.initializer.js"/>
<template:addResources type="javascript" resources="moment-with-langs.min.js"/>
<template:addResources type="css" resources="datatables/css/bootstrap-theme.css,tablecloth.css"/>
<template:addResources type="javascript" resources="jquery.form.js"/>
<template:addResources type="javascript" resources="managesitesbootstrap.js"/>
<template:addResources type="javascript" resources="bootbox.min.js"/>
<fmt:message key="label.workInProgressTitle" var="i18nWaiting"/><c:set var="i18nWaiting"
                                                                       value="${functions:escapeJavaScript(i18nWaiting)}"/>

<template:include view="hidden.header"/>

<c:set var="currentLocale">${currentResource.locale}</c:set>

<template:addResources>
    <script type="text/javascript">
        $(document).ready(function () {

            dataTablesSettings.init('userSites_table', 10, [], null, null);

            $(".checkAll").click(function () {
                $(".sitecheckbox").each(function (index) {
                    if ($(".checkAll").attr("checked") == "checked") {
                        $(this).attr("checked", "checked");
                    } else {
                        $(this).removeAttr("checked");
                    }
                });
            });
        });
    </script>
</template:addResources>

<div class="page-header">
    <c:set var="mainNode" value="${renderContext.mainResource.node}"/>
    <h2><fmt:message key="system.myWebProjects"/></h2>
</div>

<div class="panel panel-default">
    <div class="panel-body">
        <jcr:node var="root" path="/"/>


        <c:if test="${jcr:hasPermission(root, 'adminVirtualSites')}">
            <a href="<c:url value='/cms/admin/default/en/settings.webProjectSettings.html'/>" class="btn btn-primary btn-raised">
                <fmt:message key="myWebProjects.goToCreateNewSite"/>
            </a>
        </c:if>

        <c:if test="${moduleMap.end > 0 and moduleMap.end > moduleMap.begin}">
            <c:if test="${renderContext.user.root && currentNode.properties.export.boolean}">
                <c:url var="exportUrl" value="/cms/export/default/sites_export_${now}.zip"/>
                <fmt:message key="label.manageSite.exportLive" var="exportLiveTitle"/>
                <button class="btn btn-default" id="exportLiveButton"
                        onclick="exportSite('${exportUrl}',true, '${exportLiveTitle}')">
                        ${exportLiveTitle}
                </button>

                <c:url var="stagingExportUrl" value="/cms/export/default/sites_staging_export_${now}.zip"/>
                <fmt:message key="label.manageSite.exportStaging" var="exportStagingTitle"/>
                <button class="btn btn-default" id="exportStagingButton"
                        onclick="exportSite('${stagingExportUrl}',false, '${exportStagingTitle}')">
                        ${exportStagingTitle}
                </button>
            </c:if>

            <c:if test="${currentNode.properties.delete.boolean && jcr:hasPermission(root,'adminVirtualSites')}">
                <button class="btn btn-danger" id="deleteSiteButton" onclick="deleteSiteBootstrap()">
                    <fmt:message key="label.manageSite.deleteSite"/>
                </button>
            </c:if>
        </c:if>

        <fieldset>
            <table cellpadding="0" cellspacing="0" border="0" class="table table-bordered table-striped" id="userSites_table">
                <thead>
                <tr>
                    <th>
                        <fmt:message key='label.site'/>
                    </th>
                    <c:if test="${currentNode.properties.edit.boolean}">
                        <th>
                            <fmt:message key="label.edit"/>
                        </th>
                    </c:if>
                    <c:if test="${currentNode.properties.preview.boolean}">
                        <th>
                            <fmt:message key="label.preview"/>
                        </th>
                    </c:if>
                    <c:if test="${currentNode.properties.live.boolean}">
                        <th>
                            <fmt:message key="label.live.version"/>
                        </th>
                    </c:if>
                    <c:if test="${currentNode.properties.editproperties.boolean}">
                        <th>
                            <fmt:message key="label.manageSite.changeProperties"/>
                        </th>
                    </c:if>
                </tr>
                </thead>
                <tbody>
                <%@include file="sitesTableRow.settingsBootstrap3GoogleMaterialStyle.jspf" %>
                </tbody>
            </table>
        </fieldset>

        <c:if test="${currentNode.properties.delete.boolean && jcr:hasPermission(root,'adminVirtualSites')}">
            <script>
                $(document).ready(function () {
                    $('#confirmDeleteSite').on('click', function () {
                        $('#dialog-delete-confirm').modal('hide');

                        workInProgress('${i18nWaiting}');

                        $('#deleteSiteForm').ajaxSubmit(function () {
                            window.location.reload();
                        });
                    });
                });
            </script>

            <div id="dialog-delete-confirm" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalDeleteSite"
                 aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" aria-label="Close">&times;</button>
                            <h4 id="modalDeleteSite" class="modal-title"><fmt:message key="label.manageSite.deleteSite"/></h4>
                        </div>

                        <div class="modal-body">
                            <fmt:message key="label.delete.confirm"/>
                            <ol id="dialog-delete-confirm-body"></ol>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-default" data-dismiss="modal" aria-hidden="true">
                                <fmt:message key="cancel"/>
                            </button>
                            <button class="btn btn-danger btn-raised" id="confirmDeleteSite" type="submit">
                                <fmt:message key="label.manageSite.deleteSite"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <form class="deleteSiteForm ajaxForm" id="deleteSiteForm" action="<c:url value='${url.basePreview}/sites.adminDeleteSite.do'/>">
            </form>

            <div id="nothing-selected" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modal-nothing-selected"
                 aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" data-dismiss="modal" aria-hidden="true" aria-label="Close">&times;</button>
                            <h4 class="modal-title" id="modal-nothing-selected"><fmt:message key="label.manageSite.deleteSite"/></h4>
                        </div>
                        <div class="modal-body">
                            <fmt:message key="label.manageSites.noSiteSelected"/>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary btn-raised" data-dismiss="modal" aria-hidden="true">Ok</button>
                        </div>
                    </div>
                </div>
            </div>
        </c:if>

        <c:if test="${renderContext.user.root && currentNode.properties.export.boolean}">
            <form class="exportForm ajaxForm" name="export" id="exportForm" method="POST">
                <input type="hidden" name="exportformat" value="site"/>
                <input type="hidden" name="live" value="true"/>
            </form>
        </c:if>

    </div>
</div>

<template:include view="hidden.footer"/>
