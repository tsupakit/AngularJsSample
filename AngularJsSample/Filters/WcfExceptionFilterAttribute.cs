using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Filters;

namespace Draycir.DM.Administration.Web.Filters
{
    public class WcfExceptionFilterAttribute : ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.BadRequest);
            response.Content = new StringContent(actionExecutedContext.Exception.Message);

            if (actionExecutedContext.Exception is System.ServiceModel.EndpointNotFoundException)
            {                
                response.ReasonPhrase = "Could not connect to SDC service.";
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