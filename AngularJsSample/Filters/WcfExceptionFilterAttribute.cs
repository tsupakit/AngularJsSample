using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Filters;

namespace AngularJsSample.Filters
{
    public class WcfExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            response.Content = new StringContent(actionExecutedContext.Exception.Message);

            if (actionExecutedContext.Exception is System.ServiceModel.EndpointNotFoundException)
            {
                response.ReasonPhrase = "An error occurred while performing an operation on the service. Please ensure the Spindle Document Capture service is running and retry the operation.";
            }
            //else if (actionExecutedContext.Exception is System.ServiceModel.Security.SecurityAccessDeniedException)
            //{
            //    response.ReasonPhrase = actionExecutedContext.Exception.Message;
            //}
            else
            {
                response.ReasonPhrase = actionExecutedContext.Exception.Message;
            }

            throw new HttpResponseException(response);
        }
    }
}