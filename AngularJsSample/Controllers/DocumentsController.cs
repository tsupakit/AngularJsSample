using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace Draycir.DM.Administration.Web.Controllers
{
    [RoutePrefix("api/documents")]
    public class DocumentsController : ApiController
    {
        private static List<DeletedDocument> _deletedDocuments;

        private List<DeletedDocument> DeletedDocuments
        {
            get
            {
                return _deletedDocuments ?? (_deletedDocuments = new List<DeletedDocument> { new DeletedDocument {
                    DocumentId = Guid.NewGuid(),
                    DocumentName = "Test1",
                    DocumentType = "Image",
                    DocumentDate = DateTime.Now.AddDays(-1),
                    ArchivedBy = "Supakit.T",
                    DeletedDate = DateTime.Now,
                    DeletedBy = "Supakit.T",
                    IsProtected = false,
                    ProtectionStartDate = DateTime.Now.AddMonths(-1),
                    ProtectionEndDate = DateTime.Now.AddMonths(1)
                }, new DeletedDocument {
                    DocumentId = Guid.NewGuid(),
                    DocumentName = "Test2",
                    DocumentType = "Transaction",
                    DocumentDate = DateTime.Now.AddDays(-1),
                    ArchivedBy = "Supakit.T",
                    DeletedDate = DateTime.Now,
                    DeletedBy = "Supakit.T",
                    IsProtected = true,
                    ProtectionStartDate = DateTime.Now.AddMonths(-1),
                    ProtectionEndDate = DateTime.Now.AddMonths(1)
                }, new DeletedDocument {
                    DocumentId = Guid.NewGuid(),
                    DocumentName = "Test3",
                    DocumentType = "Transaction",
                    DocumentDate = DateTime.Now.AddDays(-1),
                    ArchivedBy = "Supakit.T",
                    DeletedDate = DateTime.Now,
                    DeletedBy = "Supakit.T",
                    IsProtected = true,
                    ProtectionStartDate = DateTime.Now.AddMonths(-1),
                    ProtectionEndDate = DateTime.Now.AddMonths(1)
                }, new DeletedDocument {
                    DocumentId = Guid.NewGuid(),
                    DocumentName = "Test4",
                    DocumentType = "Transaction",
                    DocumentDate = DateTime.Now.AddDays(-1),
                    ArchivedBy = "Supakit.T",
                    DeletedDate = DateTime.Now,
                    DeletedBy = "Supakit.T",
                    IsProtected = false,
                    ProtectionStartDate = DateTime.Now.AddMonths(-1),
                    ProtectionEndDate = DateTime.Now.AddMonths(1)
                }});
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
        public IHttpActionResult GetDeletedDocuments()
        {
            //IEnumerable<DeletedDocumentResult> deletedDocuments = _adminProxy.GetDeletedDocuments();
            List<DeletedDocument> deletedDocuments = DeletedDocuments;
            return Ok(deletedDocuments);
        }

        [Route("purge")]
        [HttpPost]
        public IHttpActionResult PurgeDocuments(string[] id)
        {
            //DeletedDocuments.RemoveAll(x => id.Contains(x.DocumentName));
            Guid[] documentIds = Convert(id);

            int result = documentIds.Length; // _adminProxy.PurgeDocuments(documentIds);

            return Ok(result);
        }

        [Route("restore")]
        [HttpPost]
        public IHttpActionResult RestoreDocuments(string[] id)
        {
            Guid[] documentIds = Convert(id);

            //_adminProxy.RestoreDocuments(documentIds);

            return Ok(documentIds.Length);
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
        public DateTime ProtectionStartDate { get; set; }
        public DateTime ProtectionEndDate { get; set; }

        public bool IsProtecting
        {
            get
            {
                return IsProtected && ProtectionEndDate >= DateTime.UtcNow;
            }
        }
    }
}
