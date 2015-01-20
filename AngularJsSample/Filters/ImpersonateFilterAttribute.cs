using System.Security.Principal;
using System.Web;
using System.Web.Http.Filters;

namespace AngularJsSample.Filters
{
    public class ImpersonateFilterAttribute : ActionFilterAttribute
    {
        private WindowsIdentity _callerIdentity;

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            base.OnActionExecuting(actionContext);

            _callerIdentity = (WindowsIdentity)HttpContext.Current.User.Identity;
            _callerIdentity.Impersonate();
        }

        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            base.OnActionExecuted(actionExecutedContext);

            _callerIdentity.Dispose();
        }
    }
}