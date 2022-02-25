/*
 * Copyright (C) 2002-2022 Jahia Solutions Group SA. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jahia.modules.profile;

import org.jahia.bin.Action;
import org.jahia.bin.ActionResult;
import org.jahia.engines.EngineMessage;
import org.jahia.engines.EngineMessages;
import org.jahia.registries.ServicesRegistry;
import org.jahia.services.content.JCRSessionWrapper;
import org.jahia.services.content.decorator.JCRUserNode;
import org.jahia.services.pwdpolicy.JahiaPasswordPolicyService;
import org.jahia.services.pwdpolicy.PolicyEnforcementResult;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.URLResolver;
import org.jahia.services.usermanager.JahiaUser;
import org.jahia.utils.i18n.Messages;
import org.json.JSONObject;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

/**
 */
public class ChangePasswordAction extends Action {
    @Override
    public ActionResult doExecute(HttpServletRequest req, RenderContext renderContext, Resource resource, JCRSessionWrapper session, Map<String, List<String>> parameters, URLResolver urlResolver) throws Exception {
        String passwd = req.getParameter("password").trim();

        JSONObject json = new JSONObject();
        if (!resource.getNode().hasPermission("jcr:write_default") || !resource.getNode().isNodeType("jnt:user")) {
            return new ActionResult(HttpServletResponse.SC_FORBIDDEN, null, null);
        }
        if ("".equals(passwd)) {
            String userMessage = Messages.get("resources.userDashboard", "mySettings.errors.password.mandatory", renderContext.getUILocale());
            json.put("errorMessage", userMessage);
            json.put("focusField","password");
        } else {
            String passwdConfirm = req.getParameter("passwordconfirm").trim();
            if (!passwdConfirm.equals(passwd)) {
                String userMessage = Messages.get("resources.userDashboard","mySettings.errors.password.not.matching", renderContext.getUILocale());
                json.put("errorMessage",userMessage);
                json.put("focusField","password");
            } else {
                String oldPassword = req.getParameter("oldpassword").trim();
                JCRUserNode user = (JCRUserNode) resource.getNode();
                if(!user.verifyPassword(oldPassword))
                {
                    String userMessage = Messages.get("resources.userDashboard","mySettings.errors.oldPassword.matching", renderContext.getUILocale());
                    json.put("errorMessage",userMessage);
                    json.put("focusField","oldpassword");
                }
                else{
                    JahiaPasswordPolicyService pwdPolicyService = ServicesRegistry.getInstance().getJahiaPasswordPolicyService();

                    PolicyEnforcementResult evalResult = pwdPolicyService.enforcePolicyOnPasswordChange(user, passwd, true);
                    if (!evalResult.isSuccess()) {
                        EngineMessages policyMsgs = evalResult.getEngineMessages();
                        StringBuilder res = new StringBuilder();
                        for (EngineMessage message : policyMsgs.getMessages()) {
                            res.append((message.isResource() ? Messages.getInternalWithArguments(message.getKey(), renderContext.getUILocale(), message.getValues()) : message.getKey())+"\n");
                        }
                        json.put("errorMessage", res.toString());
                    } else {
                        // change password
                        user.setPassword(passwd);
                        session.save();
                        json.put("errorMessage", Messages.get("resources.userDashboard","mySettings.passwordChanged", renderContext.getUILocale()));
                        json.put("result", "success");
                    }
                }
            }
        }
        return new ActionResult(HttpServletResponse.SC_OK, null, json);
    }
}
