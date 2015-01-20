using System.Web;
using System.Web.Mvc;

namespace Draycir.DM.Administration.Web.Filters
{
    /// <summary>
    /// Filter IP address for MVC Controller.
    /// </summary>
    public class MvcAllowServersFilter : AuthorizeAttribute
    {
#if DEBUG
#else
        /// <summary>
        /// Called when a process requests authorization.
        /// </summary>
        /// <param name="filterContext">The filter context, which encapsulates information for using <see cref="T:System.Web.Mvc.AuthorizeAttribute"/>.</param><exception cref="T:System.ArgumentNullException">The <paramref name="filterContext"/> parameter is null.</exception>
        public override void OnAuthorization(AuthorizationContext filterContext)
        {
            HttpRequestBase request = filterContext.HttpContext.Request;
            string clientIp = AllowServersFilterHelper.GetClientIp(request);
            string userAgent = AllowServersFilterHelper.GetUserAgent(request);
            if (!AllowServersFilterHelper.IsIpAddressValid(clientIp))
                filterContext.Result = AllowServersFilterHelper.NotAllowResult();
            else if (!AllowServersFilterHelper.IsValidUserAgent(userAgent))
                filterContext.Result = AllowServersFilterHelper.NotAllowAgentResult();
            else
            base.OnAuthorization(filterContext);
        }
#endif
    }
}