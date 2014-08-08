/**
 * ==========================================================================================
 * =                   JAHIA'S DUAL LICENSING - IMPORTANT INFORMATION                       =
 * ==========================================================================================
 *
 *     Copyright (C) 2002-2014 Jahia Solutions Group SA. All rights reserved.
 *
 *     THIS FILE IS AVAILABLE UNDER TWO DIFFERENT LICENSES:
 *     1/GPL OR 2/JSEL
 *
 *     1/ GPL
 *     ======================================================================================
 *
 *     IF YOU DECIDE TO CHOSE THE GPL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     "This program is free software; you can redistribute it and/or
 *     modify it under the terms of the GNU General Public License
 *     as published by the Free Software Foundation; either version 2
 *     of the License, or (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program; if not, write to the Free Software
 *     Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 *
 *     As a special exception to the terms and conditions of version 2.0 of
 *     the GPL (or any later version), you may redistribute this Program in connection
 *     with Free/Libre and Open Source Software ("FLOSS") applications as described
 *     in Jahia's FLOSS exception. You should have received a copy of the text
 *     describing the FLOSS exception, also available here:
 *     http://www.jahia.com/license"
 *
 *     2/ JSEL - Commercial and Supported Versions of the program
 *     ======================================================================================
 *
 *     IF YOU DECIDE TO CHOOSE THE JSEL LICENSE, YOU MUST COMPLY WITH THE FOLLOWING TERMS:
 *
 *     Alternatively, commercial and supported versions of the program - also known as
 *     Enterprise Distributions - must be used in accordance with the terms and conditions
 *     contained in a separate written agreement between you and Jahia Solutions Group SA.
 *
 *     If you are unsure which license is appropriate for your use,
 *     please contact the sales department at sales@jahia.com.
 *
 *
 * ==========================================================================================
 * =                                   ABOUT JAHIA                                          =
 * ==========================================================================================
 *
 *     Rooted in Open Source CMS, Jahia’s Digital Industrialization paradigm is about
 *     streamlining Enterprise digital projects across channels to truly control
 *     time-to-market and TCO, project after project.
 *     Putting an end to “the Tunnel effect”, the Jahia Studio enables IT and
 *     marketing teams to collaboratively and iteratively build cutting-edge
 *     online business solutions.
 *     These, in turn, are securely and easily deployed as modules and apps,
 *     reusable across any digital projects, thanks to the Jahia Private App Store Software.
 *     Each solution provided by Jahia stems from this overarching vision:
 *     Digital Factory, Workspace Factory, Portal Factory and eCommerce Factory.
 *     Founded in 2002 and headquartered in Geneva, Switzerland,
 *     Jahia Solutions Group has its North American headquarters in Washington DC,
 *     with offices in Chicago, Toronto and throughout Europe.
 *     Jahia counts hundreds of global brands and governmental organizations
 *     among its loyal customers, in more than 20 countries across the globe.
 *
 *     For more information, please visit http://www.jahia.com
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
