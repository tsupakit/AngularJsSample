using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.Mvc;

namespace AngularJsSample.Filters
{
    /// <summary>
    /// Helper class to filter request for allow condition
    /// </summary>
    public static class AllowServersFilterHelper
    {
        private const string AuthorizeIPAddresses = "::1, 127.0.0.1";
        private const string UserAgent = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.22 (KHTML, like Gecko) Chrome/25.0.1364.152 Safari/537.22 Draycir.DM.Administration";
        /// <summary>
        /// Return 'IP Address rejected' result
        /// </summary>
        /// <returns></returns>
        public static HttpStatusCodeResult NotAllowResult()
        {
            return new HttpStatusCodeResult(HttpStatusCode.Forbidden, @"IP address rejected."); // Resource:TODO
        }

        /// <summary>
        /// Return 'IP address Rejected' response
        /// </summary>
        /// <returns></returns>
        public static HttpResponseMessage NotAllowResponse()
        {
            return new HttpResponseMessage(HttpStatusCode.Forbidden) { ReasonPhrase = @"IP address rejected." };
        }

        /// <summary>
        /// Return "Your browser is not supported"
        /// </summary>
        /// <returns></returns>
        public static ActionResult NotAllowAgentResult()
        {
            return new HttpStatusCodeResult(HttpStatusCode.Forbidden,  @"Your browser is not supported."); // Resource:TODO
        }

        /// <summary>
        /// Return "Your browser is not supported"
        /// </summary>
        /// <returns></returns>
        public static HttpResponseMessage NotAllowAgentResponse()
        {
            return new HttpResponseMessage(HttpStatusCode.Forbidden) { ReasonPhrase = @"Your browser is not supported." };
        }
        /// <summary>
        /// Check that <paramref name="ipAddress" /> is allow.
        /// </summary>
        /// <param name="ipAddress"></param>
        /// <returns></returns>
        public static bool IsIpAddressValid(string ipAddress)
        {
            //Ref: http://randyburden.com/blog/2011/08/09/restrict-access-to-an-mvc-action-or-controller-by-ip-address-using-a-custom-action-filter/
            //Split the users IP address into it's 4 octets (Assumes IPv4) 
            string[] incomingOctets = ipAddress.Trim().Split(new char[] { '.' });

            //Get the valid IP addresses from the web.config 
            string addresses = AuthorizeIPAddresses;

            //Store each valid IP address in a string array 
            string[] validIpAddresses = addresses.Trim().Split(new char[] { ',' });

            //Iterate through each valid IP address 
            foreach (var validIpAddress in validIpAddresses)
            {
                //Return true if valid IP address matches the users 
                if (validIpAddress.Trim() == ipAddress)
                {
                    return true;
                }

                //Split the valid IP address into it's 4 octets 
                string[] validOctets = validIpAddress.Trim().Split(new char[] { '.' });

                bool matches = true;

                //Iterate through each octet 
                for (int index = 0; index < validOctets.Length; index++)
                {
                    //Skip if octet is an asterisk indicating an entire 
                    //subnet range is valid 
                    if (validOctets[index] != "*")
                    {
                        if (validOctets[index] != incomingOctets[index])
                        {
                            matches = false;
                            break; //Break out of loop 
                        }
                    }
                }

                if (matches)
                {
                    return true;
                }
            }

            //Found no matches 
            return false; 
        }

        /// <summary>
        /// Get Ip address for <see cref="HttpRequestBase"/>
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public static string GetClientIp(HttpRequestBase request)
        {
            string ip = null;
            try
            {
                if (request.IsSecureConnection)
                {
                    ip = request.ServerVariables["REMOTE_ADDR"];
                }

                if (String.IsNullOrEmpty(ip))
                {
                    ip = request.ServerVariables["HTTP_X_FORWARDED_FOR"];
                    if (!String.IsNullOrEmpty(ip))
                    {
                        if (ip.IndexOf(",") > 0)
                        {
                            ip = ip.Split(',').Last();
                        }
                    }
                    else
                    {
                        ip = request.UserHostAddress;
                    }
                }
            }
            catch { ip = null; }

            return ip;
        }

        /// <summary>
        /// Get IP Address from <see cref="HttpRequestMessage"/>
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        public static string GetClientIp(this HttpRequestMessage request)
        {
            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                return ((HttpContextWrapper)request.Properties["MS_HttpContext"]).Request.UserHostAddress;
            }
            else if (request.Properties.ContainsKey(RemoteEndpointMessageProperty.Name))
            {
                RemoteEndpointMessageProperty prop;
                prop = (RemoteEndpointMessageProperty)request.Properties[RemoteEndpointMessageProperty.Name];
                return prop.Address;
            }
            else
            {
                return null;
            }
        }

        public static string GetUserAgent(this HttpRequestMessage request)
        {
            return String.Join(" ", request.Headers.UserAgent);
        }

        public static string GetUserAgent(HttpRequestBase request)
        {
            return request.UserAgent;
        }

        /// <summary>
        /// Check that <paramref name="userAgent"/> is valid.
        /// </summary>
        /// <param name="userAgent"></param>
        /// <returns></returns>
        public static bool IsValidUserAgent(string userAgent)
        {
            if (string.IsNullOrEmpty(userAgent))
                return false;

            return userAgent == UserAgent;
        }
    }
}