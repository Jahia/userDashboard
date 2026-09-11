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


<template:addResources type="javascript" resources="simpleTable.js"/>
<template:addResources type="css" resources="dashboardListings.css"/>
<template:addResources>
    <script type="text/javascript">
        document.addEventListener('DOMContentLoaded', function () {
            initSimpleTable('userContent_table', {
                pageSize: 25,
                sortableColumns: [0, 1, 2, 3, 4],
                defaultSortColumn: 0,
                defaultSortDirection: 'asc'
            });
        });
    </script>
</template:addResources>

<template:include view="hidden.header"/>

<div class="ud-list-pageHeader">
    <c:set var="mainNode" value="${renderContext.mainResource.node}"/>
    <div class="ud-list-pageHeader__heading">
        <h2><fmt:message key="system.myPages"/></h2>
    </div>
</div>

<div class="ud-list-surface">
        <c:if test="${not empty moduleMap.currentList}">
            <fieldset>
                <table cellpadding="0" cellspacing="0" border="0" class="ud-list-table" id="userContent_table">
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
                    <%@include file="userContentTableRow.settingsDashboard.jspf" %>
                    </tbody>
                </table>
            </fieldset>
        </c:if>
</div>

<c:if test="${functions:length(moduleMap.currentList) == 0 and not empty moduleMap.emptyListMessage}">
    <div class="ud-list-emptyMessage">${moduleMap.emptyListMessage}</div>
</c:if>

<c:if test="${moduleMap.editable and renderContext.editMode && !resourceReadOnly}">
    <template:module path="*"/>
</c:if>
<template:include view="hidden.footer"/>