using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
//using Draycir.Base;
using Draycir.DM.Administration.Web.Filters;
using Draycir.DM.Administration.Web.Models;
//using Draycir.DM.Domain;
//using Draycir.DM.Services;

namespace Draycir.DM.Administration.Web.Controllers
{
    //[RoutePrefix("api/documents")]
    public class DocumentsController : ApiController
    {
        //private IAdministrationServiceApi _adminProxy;

        private Guid[] Convert(string[] input)
        {
            List<Guid> result = new List<Guid>();

            foreach (var item in input)
            {
                Guid documentId;

                if (Guid.TryParse(item, out documentId))
                    result.Add(documentId);
            }

            return result.ToArray();
        }

        public DocumentsController()
        {
            //_adminProxy = WcfProxyLocalAdministrationServiceApi.CreateProxy(DraycirLogger.Instance);            
        }

        //default http get verb
        [HttpGet]
        [ActionName("deleted")]
        //[ImpersonateFilter]
        //[WcfExceptionFilter]
        public DeletedDocumentResponseDto GetDeletedDocuments(int pageSize, int page)
        {
            //DeletedDocumentResponse response = _adminProxy.GetDeletedDocuments(pageSize, page);
            DeletedDocumentResponseDto response = new DeletedDocumentResponseDto()
            {
                TotalDocuments = DeletedDocumentDto.MockDeletedDocuments.Count,
                DeletedDocuments = DeletedDocumentDto.MockDeletedDocuments.Skip(pageSize * (page - 1)).Take(pageSize)
            };
            return response;
            //return Mapper.Map<DeletedDocumentResponseDto>(response);
        }

        //public HttpResponseMessage GetFile(string id)
        //{
        //    if (String.IsNullOrEmpty(id))
        //        return Request.CreateResponse(HttpStatusCode.BadRequest);

        //    string fileName = "test";
        //    string localFilePath;
        //    //int fileSize;

        //    localFilePath = System.Web.Hosting.HostingEnvironment.MapPath(@"/Files/img.png"); //getFileFromID(id, out fileName, out fileSize);

        //    HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
        //    response.Content = new StreamContent(new FileStream(localFilePath, FileMode.Open, FileAccess.Read));
        //    //response.Content = new ByteArrayContent(new FileStream(localFilePath, FileMode.Open, FileAccess.Read));
        //    response.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
        //    response.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
        //    response.Content.Headers.ContentDisposition.FileName = fileName;

        //    return response;
        //}

        //[Route("purge")]
        [HttpPost]
        [ActionName("purge")]
        //[ImpersonateFilter]
        //[WcfExceptionFilter]
        public int PurgeDocuments(string[] id)
        {
            //DeletedDocuments.RemoveAll(x => id.Contains(x.DocumentName));
            Guid[] documentIds = Convert(id);

            int result = id.Length; //_adminProxy.PurgeDocuments(documentIds); 

            return result;
        }

        //[Route("restore")]
        [HttpPost]
        [ActionName("restore")]
        //[ImpersonateFilter]
        //[WcfExceptionFilter]
        public int RestoreDocuments(string[] id)
        {
            Guid[] documentIds = Convert(id);

            //_adminProxy.RestoreDocuments(documentIds);

            return documentIds.Length;
        }

    }

}
