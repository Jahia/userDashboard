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

<template:addResources type="javascript" resources="simpleTable.js"/>
<template:addResources type="css" resources="dashboardListings.css"/>
<template:addResources type="javascript" resources="manageSites.js"/>

<template:include view="hidden.header"/>

<c:set var="currentLocale">${currentResource.locale}</c:set>

<template:addResources>
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function () {
            function updateExportButtons() {
                var hasSelection = Array.prototype.slice.call(document.querySelectorAll('.sitecheckbox')).some(function(checkbox) {
                    return checkbox.checked;
                });
                var exportPending = document.body.getAttribute('data-ud-export-pending') === 'true';
                var exportLiveButton = document.getElementById('exportLiveButton');
                var exportStagingButton = document.getElementById('exportStagingButton');

                [exportLiveButton, exportStagingButton].forEach(function(button) {
                    if (!button) {
                        return;
                    }

                    var disabled = exportPending || !hasSelection;
                    button.disabled = disabled;
                    button.setAttribute('aria-disabled', disabled.toString());
                });
            }

            window.updateProjectExportButtonsState = updateExportButtons;

            initSimpleTable('userSites_table', {
                sortableColumns: [0],
                defaultSortColumn: 0,
                defaultSortDirection: 'asc'
            });

            Array.prototype.slice.call(document.querySelectorAll('.checkAll')).forEach(function(toggle) {
                toggle.addEventListener('click', function () {
                    var checked = toggle.checked;
                    Array.prototype.slice.call(document.querySelectorAll('.sitecheckbox')).forEach(function(checkbox) {
                        checkbox.checked = checked;
                    });
                    updateExportButtons();
                });
            });

            Array.prototype.slice.call(document.querySelectorAll('.sitecheckbox')).forEach(function(checkbox) {
                checkbox.addEventListener('change', updateExportButtons);
            });

            updateExportButtons();
        });
    </script>
</template:addResources>

<div class="ud-list-pageHeader">
    <c:set var="mainNode" value="${renderContext.mainResource.node}"/>
    <div class="ud-list-pageHeader__heading">
        <h2><fmt:message key="system.myWebProjects"/></h2>
    </div>
</div>

<div class="ud-list-surface">
        <jcr:node var="root" path="/"/>

        <div class="ud-list-actionBar">

        <c:if test="${jcr:hasPermission(root, 'adminVirtualSites')}">
            <a href="<c:url value='/cms/admin/default/en/settings.webProjectSettings.html'/>" class="ud-list-button ud-list-button--primary">
                <fmt:message key="myWebProjects.goToCreateNewSite"/>
            </a>
        </c:if>

        <c:if test="${moduleMap.end > 0 and moduleMap.end > moduleMap.begin}">
            <c:if test="${renderContext.user.root && currentNode.properties.export.boolean}">
                <c:url var="exportUrl" value="/cms/export/default/sites_export_${now}.zip"/>
                <fmt:message key="label.manageSite.exportLive" var="exportLiveTitle"/>
                <button class="ud-list-button" id="exportLiveButton" type="button"
                    disabled aria-disabled="true"
                        onclick="return exportSite('${exportUrl}',true, '${exportLiveTitle}', this)">
                        ${exportLiveTitle}
                </button>

                <c:url var="stagingExportUrl" value="/cms/export/default/sites_staging_export_${now}.zip"/>
                <fmt:message key="label.manageSite.exportStaging" var="exportStagingTitle"/>
                <fmt:message key="myWebProjects.exportInProgress" var="exportInProgressLabel"/>
                <button class="ud-list-button" id="exportStagingButton" type="button"
                    disabled aria-disabled="true"
                        onclick="return exportSite('${stagingExportUrl}',false, '${exportStagingTitle}', this)">
                        ${exportStagingTitle}
                </button>
                <span class="ud-list-actionStatus" id="exportStatus" hidden role="status" aria-live="polite">${exportInProgressLabel}</span>
            </c:if>
        </c:if>
        </div>

        <fieldset>
            <table cellpadding="0" cellspacing="0" border="0" class="ud-list-table" id="userSites_table">
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
                    <th>
                        <fmt:message key="myWebProjects.files"/>
                    </th>
                    <th>
                        <fmt:message key="label.content"/>
                    </th>
                    <c:if test="${currentNode.properties.editproperties.boolean}">
                        <th>
                            <fmt:message key="label.manageSite.changeProperties"/>
                        </th>
                    </c:if>
                </tr>
                </thead>
                <tbody>
                <%@include file="sitesTableRow.settingsDashboard.jspf" %>
                </tbody>
            </table>
        </fieldset>

        <c:if test="${renderContext.user.root && currentNode.properties.export.boolean}">
            <form class="exportForm ajaxForm" name="export" id="exportForm" method="POST">
                <input type="hidden" name="exportformat" value="site"/>
                <input type="hidden" name="live" value="true"/>
            </form>
        </c:if>
</div>

<template:include view="hidden.footer"/>
