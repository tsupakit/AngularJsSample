using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Draycir.DM.Administration.Web.Controllers
{
    //[RoutePrefix("api/documents")]
    public class DocumentsController : ApiController
    {
        private const int _max = 20;
        //private static List<DeletedDocument> _deletedDocuments;

        private List<DeletedDocument> Mock
        {
            get
            {
                var data = new List<DeletedDocument>();

                for (int i = 1; i <= _max; i++)
                {
                    var prime = IsPrime(i);
                    DateTime? protectionStart = null;
                    DateTime? protectionEnd = null;

                    if (prime)
                    {
                        protectionStart = DateTime.Now;
                        protectionEnd = protectionStart.Value.AddMonths(1);
                    }

                    data.Add(new DeletedDocument
                    {
                        DocumentId = Guid.NewGuid(),
                        DocumentName = "Test" + i,
                        DocumentType = "Transaction" + i,
                        DocumentDate = DateTime.Now.AddDays(i - 1),
                        ArchivedBy = "Supakit.T",
                        DeletedDate = DateTime.Now,
                        DeletedBy = "Supakit.T",
                        IsProtected = prime,
                        ProtectionStartDate = protectionStart,
                        ProtectionEndDate = protectionEnd
                    });
                }

                return data;
            }
        }

        private bool IsPrime(int number)
        {
            if (number < 2)
                return false;
            if (number == 2)
                return true;
            if ((number & 1) == 0)
                return false;

            for (int i = 3; i < number; i++)
            {
                if (number % i == 0)
                    return false;
            }

            return true;
        }

        private List<DeletedDocument> DeletedDocuments
        {
            get
            {
                //return _deletedDocuments ?? (_deletedDocuments = Mock);
                return Mock;
            }
        }

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
        public IEnumerable<DeletedDocument> GetDeletedDocuments()
        {
            //IEnumerable<DeletedDocumentResult> deletedDocuments = _adminProxy.GetDeletedDocuments();
            List<DeletedDocument> deletedDocuments = DeletedDocuments;
            return deletedDocuments;
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
        public int PurgeDocuments(string[] id)
        {
            //DeletedDocuments.RemoveAll(x => id.Contains(x.DocumentName));
            Guid[] documentIds = Convert(id);

            int result = documentIds.Length; //_adminProxy.PurgeDocuments(documentIds); 

            return result;
        }

        //[Route("restore")]
        [HttpPost]
        [ActionName("restore")]
        public int RestoreDocuments(string[] id)
        {
            Guid[] documentIds = Convert(id);

            //_adminProxy.RestoreDocuments(documentIds);

            return documentIds.Length;
        }

    }

    public class DeletedDocument
    {
        public Guid DocumentId { get; set; }
        public string DocumentName { get; set; }
        public string DocumentType { get; set; }
        public DateTime DocumentDate { get; set; }
        public string ArchivedBy { get; set; }
        public DateTime DeletedDate { get; set; }
        public string DeletedBy { get; set; }
        public bool IsProtected { get; set; }
        public DateTime? ProtectionStartDate { get; set; }
        public DateTime? ProtectionEndDate { get; set; }
    }
}
