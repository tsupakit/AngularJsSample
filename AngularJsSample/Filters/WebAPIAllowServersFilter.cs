
using System;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;

namespace Draycir.DM.Administration.Web.Filters
{
    /// <summary>
    /// Filter IP address for WebApi Controller.
    /// </summary>
    public class WebApiAllowServersFilter : AuthorizeAttribute
    {
#if DEBUG
#else
        /// <summary>
        /// Calls when an action is being authorized.
        /// </summary>
        /// <param name="actionContext">The context.</param><exception cref="T:System.ArgumentNullException">The context parameter is null.</exception>
        public override void OnAuthorization(HttpActionContext actionContext)
        {
            HttpRequestMessage request = actionContext.Request;
            string clientIp = request.GetClientIp();
            string userAgent = request.GetUserAgent();

            if (!AllowServersFilterHelper.IsIpAddressValid(clientIp))
                actionContext.Response = AllowServersFilterHelper.NotAllowResponse();
            else if (!AllowServersFilterHelper.IsValidUserAgent(userAgent))
                actionContext.Response = AllowServersFilterHelper.NotAllowAgentResponse();
            else
            base.OnAuthorization(actionContext);
        }        
#endif
    }
}