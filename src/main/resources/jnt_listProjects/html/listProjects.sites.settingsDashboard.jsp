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

<%-- The page is drawn by the React app in src/main/frontend/projects. This JSP keeps everything
     that has to stay on the server: the site query (hidden.header), every permission check and
     every URL, which it hands over as window.userDashboardProjectsConfig. --%>
<template:addResources type="css" resources="react-profile-app/projects-app.css"/>
<template:addResources type="javascript" resources="react-profile-app/projects-app.js" defer="true"/>
<%-- Still needed by the "Change properties" action, which opens the modal below. --%>
<template:addResources type="javascript" resources="manageSites.js"/>
<template:addResources type="css" resources="dashboardListings.css"/>

<template:include view="hidden.header"/>

<c:set var="currentLocale">${currentResource.locale}</c:set>
<jcr:node var="root" path="/"/>
<c:set var="canManageProjects" value="${jcr:hasPermission(root, 'adminVirtualSites')}"/>
<c:set var="canExport" value="${moduleMap.end > 0 and moduleMap.end > moduleMap.begin and renderContext.user.root and currentNode.properties.export.boolean}"/>
<c:url var="projectManagementUrl" value="/cms/admin/default/en/settings.webProjectSettings.html"/>
<%-- The app appends the site name (or "sites") and a timestamp when an export is triggered. --%>
<c:url var="exportBaseUrl" value="/cms/export/default/"/>

<fmt:message key="system.myWebProjects" var="labelTitle"/>
<fmt:message key="myWebProjects.goToCreateNewSite" var="labelManage"/>
<fmt:message key="label.manageSite.exportLive" var="labelExportLive"/>
<fmt:message key="label.manageSite.exportStaging" var="labelExportStaging"/>
<fmt:message key="myWebProjects.exportInProgress" var="labelExportInProgress"/>
<fmt:message key="label.site" var="labelSite"/>
<fmt:message key="myWebProjects.actions" var="labelActions"/>
<fmt:message key="myWebProjects.selectAll" var="labelSelectAll"/>
<fmt:message key="myWebProjects.noProjects" var="labelNoProjects"/>
<fmt:message key="label.edit" var="labelEdit"/>
<fmt:message key="label.preview" var="labelPreview"/>
<fmt:message key="label.live.version" var="labelLive"/>
<fmt:message key="myWebProjects.files" var="labelFiles"/>
<fmt:message key="label.content" var="labelContent"/>
<fmt:message key="label.manageSite.changeProperties" var="labelProperties"/>
<fmt:message key="label.notAvailable" var="labelNotAvailable"/>
<fmt:message key="label.notPublished" var="labelNotPublished"/>

<template:addResources>
    <script type="text/javascript">
        window.userDashboardProjectsConfig = {
            title: '${functions:escapeJavaScript(labelTitle)}',
            canManageProjects: ${canManageProjects},
            projectManagementUrl: '${functions:escapeJavaScript(projectManagementUrl)}',
            canExport: ${canExport},
            exportBaseUrl: '${functions:escapeJavaScript(exportBaseUrl)}',
            columns: {
                edit: ${currentNode.properties.edit.boolean},
                preview: ${currentNode.properties.preview.boolean},
                live: ${currentNode.properties.live.boolean},
                editProperties: ${currentNode.properties.editproperties.boolean}
            },
            labels: {
                manage: '${functions:escapeJavaScript(labelManage)}',
                exportLive: '${functions:escapeJavaScript(labelExportLive)}',
                exportStaging: '${functions:escapeJavaScript(labelExportStaging)}',
                exportInProgress: '${functions:escapeJavaScript(labelExportInProgress)}',
                site: '${functions:escapeJavaScript(labelSite)}',
                actions: '${functions:escapeJavaScript(labelActions)}',
                selectAll: '${functions:escapeJavaScript(labelSelectAll)}',
                noProjects: '${functions:escapeJavaScript(labelNoProjects)}',
                edit: '${functions:escapeJavaScript(labelEdit)}',
                preview: '${functions:escapeJavaScript(labelPreview)}',
                live: '${functions:escapeJavaScript(labelLive)}',
                files: '${functions:escapeJavaScript(labelFiles)}',
                content: '${functions:escapeJavaScript(labelContent)}',
                properties: '${functions:escapeJavaScript(labelProperties)}',
                notAvailable: '${functions:escapeJavaScript(labelNotAvailable)}',
                notPublished: '${functions:escapeJavaScript(labelNotPublished)}'
            },
            sites: [
                <%@include file="sitesConfig.settingsDashboard.jspf" %>
            ]
        };
    </script>
</template:addResources>

<div id="listProjectsReactRoot"></div>

<c:if test="${canExport}">
    <%-- Kept in the page rather than created by the app: Jahia's CSRF guard injects its token
         into the forms of the rendered page, and only patches XHR for anything added later. --%>
    <form class="exportForm" name="export" id="exportForm" method="POST">
        <input type="hidden" name="exportformat" value="site"/>
        <input type="hidden" name="live" value="true"/>
    </form>
</c:if>

<c:if test="${currentNode.properties.editproperties.boolean}">
    <c:forEach items="${moduleMap.currentList}" var="node" begin="${moduleMap.begin}" end="${moduleMap.end}">
        <c:if test="${jcr:hasPermission(node,'adminVirtualSites')}">
            <div id="editSiteDiv${node.identifier}" class="ud-site-modal" tabindex="-1" aria-labelledby="modalEditSiteProperties${node.identifier}"
                 aria-hidden="true">
                <div class="ud-site-modal__dialog">
                    <div class="ud-site-modal__header">
                        <h3 id="modalEditSiteProperties${node.identifier}">
                            <fmt:message key="label.manageSite.siteProperties"/>
                        </h3>
                        <button class="ud-site-modal__close" type="button" onclick="hideSiteEditProperties('${node.identifier}')" aria-label="Close">&times;</button>
                    </div>
                    <div class="ud-site-modal__body">
                        <form class="ajaxForm ud-site-form" id="editSiteForm${node.identifier}"
                              action="<c:url value='${url.basePreview}${node.path}.adminEditSite.do'/>">
                            <fieldset>
                                <p id="siteTitleForm${node.identifier}" class="ud-site-form__field">
                                    <label for="siteTitle${node.identifier}"><fmt:message key="jnt_virtualsite.j_title"/> (*)</label>
                                    <input type="text" name="siteTitle" id="siteTitle${node.identifier}"
                                           value="${fn:escapeXml(node.properties['j:title'].string)}"/>
                                </p>
                                <p id="siteServerNameForm${node.identifier}" class="ud-site-form__field">
                                    <label for="siteServerName${node.identifier}"><fmt:message key="jnt_virtualsite.j_serverName"/> (*)</label>
                                    <input type="text" name="siteServerName" id="siteServerName${node.identifier}"
                                           value="${fn:escapeXml(node.properties['j:serverName'].string)}"/>
                                </p>
                                <p id="siteDescrForm${node.identifier}" class="ud-site-form__field">
                                    <label for="siteDescr${node.identifier}"><fmt:message key="jnt_virtualsite.j_description"/></label>
                                    <textarea name="siteDescr" id="siteDescr${node.identifier}">${fn:escapeXml(node.properties['j:description'].string)}</textarea>
                                </p>
                            </fieldset>
                        </form>
                    </div>
                    <div class="ud-site-modal__footer">
                        <button class="ud-list-button" type="button" onclick="hideSiteEditProperties('${node.identifier}')">
                            <fmt:message key="cancel"/>
                        </button>
                        <button class="ud-list-button ud-list-button--primary" type="button" site="${node.identifier}" onclick="editProperties('${node.identifier}')">
                            <fmt:message key="label.manageSite.submitChanges"/>
                        </button>
                    </div>
                </div>
            </div>
        </c:if>
    </c:forEach>
</c:if>

<template:include view="hidden.footer"/>
