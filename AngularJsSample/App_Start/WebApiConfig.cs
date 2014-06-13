using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;

namespace AngularJsSample
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            // Web API configuration and services

            // Web API routes
            //config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DeletedDocumentsApi",
                routeTemplate: "api/documents/deleted/{pageSize}/{page}",
                defaults: new { controller = "documents" }
            );

            config.Routes.MapHttpRoute(
                name: "DocumentsRoute",
                routeTemplate: "api/documents/{action}/{id}",
                defaults: new { controller = "documents", id = RouteParameter.Optional }
            );

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
        }
    }
}
