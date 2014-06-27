using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Runtime.Serialization;

namespace Draycir.DM.Administration.Web.Models
{
    /// <summary>
    /// Document search request
    /// </summary>
    public class DocumentSearchRequest
    {
        /// <summary>
        /// Gets or sets the size of items to display in page.
        /// </summary>
        public int PageSize
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the number of page of search result.
        /// </summary>
        public int Page
        {
            get;
            set;
        }

        /// <summary>
        /// Gets or sets the query search phrase string.
        /// </summary>       
        public string Query
        {
            get;
            set;
        }
    }
}
