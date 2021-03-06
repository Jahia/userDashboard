<%@ page import="org.apache.commons.lang.StringUtils" %>
<%@ page import="org.jahia.services.content.JCRNodeWrapper" %>
<%@ page import="javax.jcr.RepositoryException" %>
<%@ page import="javax.jcr.Value" %>
<%@ page import="java.util.HashSet" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ taglib prefix="functions" uri="http://www.jahia.org/tags/functions" %>
<%@ taglib prefix="jcr" uri="http://www.jahia.org/tags/jcr" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="uiComponents" uri="http://www.jahia.org/tags/uiComponentsLib" %>
<%@ taglib prefix="utility" uri="http://www.jahia.org/tags/utilityLib" %>
<%@ taglib prefix="user" uri="http://www.jahia.org/tags/user" %>
<%@ taglib prefix="facet" uri="http://www.jahia.org/tags/facetLib" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<%--@elvariable id="currentResource" type="org.jahia.services.render.Resource"--%>
<%--@elvariable id="flowRequestContext" type="org.springframework.webflow.execution.RequestContext"--%>
<%--@elvariable id="out" type="java.io.PrintWriter"--%>
<%--@elvariable id="renderContext" type="org.jahia.services.render.RenderContext"--%>
<%--@elvariable id="script" type="org.jahia.services.render.scripting.Script"--%>
<%--@elvariable id="scriptInfo" type="java.lang.String"--%>
<%--@elvariable id="url" type="org.jahia.services.render.URLGenerator"--%>
<%--@elvariable id="workspace" type="java.lang.String"--%>
<%!
    final String PUBLICPROPERTIES_PROPERTY = "j:publicProperties";

    HashSet<String> getPublicProperties(PageContext pageContext) throws RepositoryException {
        HashSet<String> publicProperties = (HashSet<String>) pageContext.getAttribute("editUserDetailsPublicProperties");
        if (publicProperties != null) {
            return new HashSet<String>(publicProperties);
        } else {
            publicProperties = new HashSet<String>();
            JCRNodeWrapper user = (JCRNodeWrapper) pageContext.getAttribute("user");
            Value[] values = null;
            if (user.hasProperty(PUBLICPROPERTIES_PROPERTY)) {
                values = user.getProperty(PUBLICPROPERTIES_PROPERTY).getValues();
            }
            if (values != null) {
                for (Value value : values) {
                    publicProperties.add("&quot;" + value.getString() + "&quot;");
                }
            }
            pageContext.setAttribute("editUserDetailsPublicProperties", publicProperties);
            return publicProperties;
        }
    }
    String getPublicPropertiesData(PageContext pageContext, String propertyName) throws RepositoryException {
        HashSet<String> publicProperties = getPublicProperties(pageContext);
        publicProperties.add("&quot;" + propertyName + "&quot;");
        return "{&quot;" + PUBLICPROPERTIES_PROPERTY + "&quot;:[" + StringUtils.join(publicProperties, ",") + "]}";
    }
%>
<%@ include file="../../getUser.jspf"%>

<%-- CSS inclusions --%>
<%--<template:addResources type="css" resources="admin-bootstrap.css"/>--%>
<template:addResources type="css" resources="bootstrap-2/bootstrap-datetimepicker.min.css"/>
<template:addResources type="css" resources="bootstrap-2/bootstrap-switch.css"/>

<%-- Javascripts inclusions --%>
<template:addResources type="javascript" resources="jquery.min.js,jquery-ui.min.js"/>
<template:addResources type="javascript" resources="admin-bootstrap.js"/>
<template:addResources type="javascript" resources="bootstrap-2/bootstrap-switch.js"/>
<template:addResources type="javascript" resources="jquery.ajaxfileupload.js"/>
<template:addResources type="javascript" resources="ckeditor.js"/>
<template:addResources type="javascript" resources="adapters/jquery.js"/>
<template:addResources type="javascript" resources="editUserDetailsUtils.js"/>
<template:addResources type="javascript" resources="bootstrap-2/bootstrap-datetimepicker.min.js"/>
<template:addResources type="javascript" resources="bootstrap-datetimepicker.${renderContext.UILocale}.js"/>
<template:addResources type="javascript" resources="jquery.validate.min.js"/>



<template:addCacheDependency node="${user}"/>

<jsp:useBean id="now" class="java.util.Date"/>


<jcr:nodeProperty node="${user}" name="j:birthDate" var="birthDate"/>

<jcr:nodeProperty node="${user}" name="j:publicProperties" var="publicProperties" />
<c:forEach items="${publicProperties}" var="value">
    <c:set var="publicPropertiesAsString" value="${value.string} ${publicPropertiesAsString}"/>
</c:forEach>
<jcr:propertyInitializers node="${user}" name="j:gender" var="genderInit"/>
<jcr:propertyInitializers node="${user}" name="j:title" var="titleInit"/>
<%--<fmt:message key="label.workInProgressTitle" var="i18nWaiting"/><c:set var="i18nWaiting" value="${functions:escapeJavaScript(i18nWaiting)}"/>--%>
<template:addResources>
    <script type="text/javascript">
        var editor = null;
        var API_URL_START = "modules/api/jcr/v1";
        var context = "${url.context}";
        var changePasswordUrl = '<c:url value="${url.base}${user.path}.changePassword.do"/>';
        var getUrl="<c:url value="${url.baseUserBoardFrameEdit}${currentNode.path}.bootstrap.html.ajax?includeJavascripts=false&userUuid=${user.identifier}"/>";
        var urlFiles = "${url.context}${url.files}${user.path}";
        var propertiesNames = {
            <c:forTokens items="j:title,j:firstName,j:lastName,j:birthDate,j:gender,j:function,j:organization,j:about,j:picture,j:email,j:skypeID,j:twitterID,j:facebookID,j:linkedinID,preferredLanguage"
                         delims="," var="key" varStatus="loopStatus">
            <c:set var="message"><fmt:message key="jnt_user.${fn:replace(key, ':','_')}"/></c:set>
            '${key}' : '${functions:escapeJavaScript(message)}'<c:if test="${!loopStatus.last}">,</c:if>
            </c:forTokens>
        };

        var currentCssClass ="";

        /**
         * @author rahmed (JAHIA)
         * This function updates a Form Row properties and verify the phones and email fields if the Row cssClass is 'AddressField'
         * @param cssClass : The Form Row css class
         */
        function updateProperties(cssClass)
        {
            currentCssClass=cssClass;
            if(cssClass=="addressField")
            {
                if(verifyAndSubmitAddress(cssClass,'phoneFormatError','emailFormatError'))
                {
                    var errorResult = formToJahiaCreateUpdateProperties("editDetailsForm", "${user.identifier}", "${currentResource.locale}", cssClass, ajaxReloadCallback,formError);
                }
            }
            else
            {
                var errorResult = formToJahiaCreateUpdateProperties("editDetailsForm", "${user.identifier}", "${currentResource.locale}", cssClass, ajaxReloadCallback,formError);
            }
        }

        var visibilityNumber = 0;
        if(window.userDetailsHasSwitch == undefined) {
            var userDetailsHasSwitch = false;
        }

        $(document).ready(function(){

            //Activating the Pag NavBar ('public'/'private')
            $('body').on('click','#tabView a',function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            //Activating the Birthdate Date Picker
            $('body').on('click','#datePickerParent',function (e) {
                e.preventDefault();
                $('#birthDate').datetimepicker({
                    format: 'yyyy-MM-dd',
                    pickTime: false,
                    language: '${renderContext.UILocale}'
                });
            });

            // Activating the privacy checkboxes buttons
            $('body').on('click','#switchParent',function (e) {
                e.preventDefault();
                for(var currentvisibility=0;currentvisibility<visibilityNumber;currentvisibility++)
                {
                    $("#publicProperties"+currentvisibility).bootstrapSwitch();
                    $('#publicProperties'+currentvisibility).off('switchChange');
                }
            });

            //Setting Read More button if needed
            if ($("#aboutMeTextWrapper").height()>$("#aboutMeTextDiv").height())
            {
                $(".btnMoreAbout").show();
            }

            $(".btnMoreAbout").click(function(){
                $(".aboutMeText").css( { height:"100%",maxHeight: "250px", overflow: "auto", paddingRight: "5px" }, { queue:false, duration:500 });
                $(".btnMoreAbout").hide();
                $(".btnLessAbout").show();
            });

            $(".btnLessAbout").click(function(){
                $(".aboutMeText").scrollTop(0);
                $(".aboutMeText").css( { height:"100px", overflow: "hidden" }, { queue:false, duration:500 });
                $(".btnLessAbout").hide();
                $(".btnMoreAbout").show();
            });

            // QA-5792: copied from editUserDetailsUtils.js.verifyAndSubmitAddress
	        var phoneRegex = /^\+?([0-9_\- \(\)])*$/;

	        /**
	        * QA-5792
	        * A jahia basic phone pattern validation
	        */
	        $.validator.addMethod("phone", function(phone_number, element) {
	        	phone_number = phone_number.replace(/\(|\)|\s+|-/g, "");
	        	// NOTE: the phone min length is 5 instead of 9
	        	// There is a validation before submit inside /userDashboard/src/main/resources/javascript/editUserDetailsUtils.js
	        	// in function verifyAndSubmitAddress that set the phone min length to 5 ($(this).val().length < 5).
	        	// Any change of phone length filter should be done inside editUserDetailsUtils.js.verifyAndSubmitAddress
	        	return (this.optional(element) == true) || (phone_number.length > 4 &&
	        		phone_number.match(phoneRegex));
	        }, '<fmt:message key="mySettings.errors.phone.format"/>');

			// QA-5792: email regex pattern from editUserDetailsUtils.js.verifyAndSubmitAddress
	        var emailRegex = /^(?:[A-Za-z0-9\._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,})?$/;

            $.validator.methods.email = function(value, element) {
                return this.optional(element) || emailRegex.test(value);
            }

            // QA-5792: apply jquery validation
            $('#editDetailsForm').validate({
            	rules:{
            		phone: true,
            		email: true
            	},
            	message: {
            		email:'<fmt:message key="failure.invalid.emailAddress"/>'
            	},
            	highlight: function (element) {
            		$(element).closest('.control-group').removeClass('success').addClass('error');

                },
                success: function (element) {
                    element.addClass('valid').closest('.control-group').removeClass('error').addClass('success');
                },
                // unhighligth when validation is not required
                unhighlight: function (element) {
				  $(element).closest('.control-group').removeClass('error');
				}
            });

        });
    </script>
</template:addResources>
<div id="editDetailspage">

    <ul class="nav nav-tabs" id="tabView">
        <li id="privateView" class="active viewType"><a href="#private"><fmt:message key="mySettings.privateView"/></a></li>
        <li id="publicView" class="viewType"><a href="#public"><fmt:message key="mySettings.publicView"/></a></li>
    </ul>
    <div class="tab-content">
        <div class="tab-pane active" id="private">
            <form enctype= multipart/form-data onkeypress="return event.keyCode != 13;" id="editDetailsForm" class="form-horizontal user-profile-table" onsubmit="return false;">
                <div class="container">
                    <div id="detailsHead" class="row-fluid">
                        <div class="span11 offset1">
                            <div class="alert alert-info" style="padding-right:10px;">
                                <div class="row-fluid ">
                                    <div id="imageDiv" class="span2">
                                        <c:if test="${currentNode.properties['j:picture'].boolean}">
                                            <jcr:nodeProperty var="picture" node="${user}" name="j:picture"/>
                                            <div id="image">
                                                <div id="imageDisplay" class="row-fluid">
                                                    <c:choose>
                                                        <c:when test="${empty picture}">
                                                            <img class="img-polaroid pull-left" src="<c:url value='${url.currentModule}/img/userbig.png'/>"
                                                                 alt="" border="0"/>
                                                        </c:when>
                                                        <c:otherwise>
                                                            <img class="img-polaroid pull-left" src="${picture.node.thumbnailUrls['avatar_120']}"
                                                                 alt="${fn:escapeXml(person)}"/>
                                                        </c:otherwise>
                                                    </c:choose>
                                                    <br/>
                                                    <div style="clear: both;"></div>
                                                </div>
                                                <div id="pictureEditButton" class="row-fluid">
                                                    <c:if test="${user:isPropertyEditable(user,'j:picture')}">
                                                    <button class="btn btn-primary" type="button" onclick="$('#about').hide();$('#about_form').hide();$('#image_form').show();$('#image').hide()">
                                                        <fmt:message key="mysettings.picture.edit"/>
                                                    </button>
                                                    </c:if>
                                                </div>
                                            </div>
                                        </c:if>
                                    </div>
                                    <div id="aboutMeDiv" class="span10">
                                        <c:if test="${currentNode.properties['j:about'].boolean}">
                                            <div id="about">
                                                <div id="about-text-part">
                                                    <h1>
                                                        <fmt:message key='jnt_user.j_about'/>
                                                    </h1>
                                                    <div id="aboutMeTextDiv" class="aboutMeText lead" style="height: auto;max-height: 100px; text-align: justify; overflow: hidden">
                                                        <div id="aboutMeTextWrapper">
                                                                ${user.properties['j:about'].string}
                                                        </div>
                                                    </div>
                                                    <br />
                                                </div>
                                                <div id="about-button-part" class="row-fluid">
                                                    <button id="btnMoreAbout" class="hide btn btn-small btn-primary btnMoreAbout">
                                                        <fmt:message key='mySettings.readMore'/>
                                                    </button>
                                                    <button id="btnLessAbout" class="hide btn btn-small btn-primary btnLessAbout">
                                                        <fmt:message key='mySettings.readLess'/>
                                                    </button>
                                                    <c:if test="${user:isPropertyEditable(user,'j:about')}">
                                                        <button class="btn btn-primary pull-right" type="button" onclick="switchRow('about')">
                                                            <fmt:message key="label.clickToEdit"/>
                                                        </button>
                                                    </c:if>
                                                </div>
                                            </div>
                                        </c:if>
                                        <div id="image_form" class="hide span10">
                                            <div class="image_form_preview">
                                                <c:choose>
                                                    <c:when test="${empty picture}">
                                                        <img class="img-polaroid pull-left" src="<c:url value='${url.currentModule}/img/userbig.png'/>"
                                                             alt="" border="0"/>
                                                    </c:when>
                                                    <c:otherwise>
                                                        <img class="img-polaroid pull-left" src="${picture.node.thumbnailUrls['avatar_120']}"
                                                             alt="${fn:escapeXml(person)}"/>
                                                    </c:otherwise>
                                                </c:choose>
                                            </div>
                                            <div class="image_form_inputs">
                                                <div class="control-group">
                                                    <div class="controls">
                                                        <input id="uploadedImage" type="file" name="file"/>
                                                    </div>
                                                </div>
                                                <div class="form-actions">
                                                    <button type="button" class="btn btn-danger" onclick="ajaxReloadCallback(null,'cancel')"><fmt:message key="cancel"/></button>
                                                    <button id="DeletePictureButton" class="btn btn-warning" type="button" onclick="jahiaAPIStandardCall('${url.context}','default','${currentResource.locale}','nodes', '${user.identifier}/properties/j__picture','DELETE', '' , ajaxReloadCallback(), formError)">
                                                        <fmt:message key="mySettings.picture.delete"/>
                                                    </button>
                                                    <button id="imageUploadButton" class="btn btn-success" type="button" onclick="updatePhoto('uploadedImage','${currentResource.locale}', '${user.path}','${user.identifier}',ajaxReloadCallback, formError );">
                                                        <fmt:message key="save"/>
                                                    </button>
                                                    <div>
                                                        <span id="imageUploadError" class="hide"><fmt:message key="mySettings.errors.picture.upload"/></span>
                                                        <span id="imageUploadNameError" class="hide"><fmt:message key="mySettings.errors.picture.name.upload"/></span>
                                                        <span id="imageUploadEmptyError" class="hide"><fmt:message key="mySettings.errors.picture.empty.upload"/></span>
                                                    </div>
                                                    <div class="imageField otherErrorsMessage hide">
                                                        <div><fmt:message key="mySettings.errors.otherErrors"/></div>
                                                        <div><fmt:message key="mySettings.errors.otherErrors2"/> &nbsp; <a href="#" onclick="goToStart()"><fmt:message key="mySettings.startPage"/></a></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <fmt:message key="myFiles.alertInfoCharacters"/> */:

                                        </div>
                                        <c:if test="${user:isPropertyEditable(user,'j:about')}">
                                            <div id="about_form" class="hide span10">
                                                <textarea id="about_editor"><c:out value="${user.properties['j:about'].string}"/></textarea>
                                                <script type="text/javascript">
                                                    if(editor==null) { editor = $( '#about_editor' ).ckeditor({toolbar:"Mini"}); }
                                                </script>
                                                <br />
                                                <div class="pull-right">
                                                    <div>
                                                        <button type="button" class="btn btn-danger" onclick="ajaxReloadCallback(null,'cancel')">
                                                            <fmt:message key="cancel"/>
                                                        </button>
                                                        <button class="btn btn-success" type="button" onclick="saveCkEditorChanges('about','${user.identifier}', '${currentResource.locale}',ajaxReloadCallback,formError);">
                                                            <fmt:message key="save"/>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div class="aboutField errorMessage pull-right hide" style="margin-right:15px;"></div>
                                                <div class="aboutField otherErrorsMessage hide">
                                                    <div><fmt:message key="mySettings.errors.otherErrors"/></div>
                                                    <div><fmt:message key="mySettings.errors.otherErrors2"/> &nbsp; <a href="#" onclick="goToStart()"><fmt:message key="mySettings.startPage"/></a></div>
                                                </div>
                                            </div>
                                        </c:if>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div class="row-fluid" >
                        <div class="span11 offset1">
                            <%@include file="editUserDetailsRows.jspf" %>
                        </div>
                        <div class="clearfix"></div>
                    </div>
                </div>
            </form>
        </div>
        <div class="tab-pane" id="public">
            <%@include file="editUserDetailsPublicView.jspf" %>
        </div>
    </div>
</div>
