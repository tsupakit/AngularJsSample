using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
//using Draycir.DM.Domain;

namespace Draycir.DM.Administration.Web.Models
{
    public class DeletedDocumentDto
    {
        public Guid DocumentId { get; set; }
        public string DocumentName { get; set; }
        public string DocumentType { get; set; }
        public DateTime ArchivedDate { get; set; }
        public string ArchivedBy { get; set; }
        public DateTime DeletedDate { get; set; }
        public string DeletedBy { get; set; }
        public bool IsProtected { get; set; }
        public DateTime? ProtectionStartDate { get; set; }
        public DateTime? ProtectionEndDate { get; set; }
        public List<string> MetadataItems { get; set; }

        public string ProtectionPeriod
        {
            get
            {
                if (!IsProtected || !ProtectionEndDate.HasValue || ProtectionEndDate < DateTime.UtcNow)
                    return string.Empty;

                return string.Format("{0} year(s)", ProtectionEndDate.Value.Year - ArchivedDate.Year);
            }
        }

        public string ProtectionInfo
        {
            get
            {
                string period = ProtectionPeriod;

                if (string.IsNullOrEmpty(period))
                    return string.Empty;

                return string.Format("{0}, until {1}", ProtectionPeriod, ProtectionEndDate.Value.ToString("dd/MM/yyyy"));
            }
        }

        //private static Func<int, int> DaysOfYear = (year) => DateTime.IsLeapYear(year) ? 366 : 365;

        private const int _max = 1024;
        private static List<DeletedDocumentDto> _mock;

        public static List<DeletedDocumentDto> MockDeletedDocuments
        {
            get
            {
                if (_mock == null)
                {
                    _mock = new List<DeletedDocumentDto>();

                    for (int i = 1; i <= _max; i++)
                    {
                        var prime = IsPrime(i);
                        DateTime? protectionStart = null;
                        DateTime? protectionEnd = null;

                        if (prime)
                        {
                            protectionStart = DateTime.Now;
                            protectionEnd = protectionStart.Value.AddMonths(i);
                        }
                        //else
                        //{
                        //    protectionStart = DateTime.Now;
                        //    protectionEnd = protectionStart.Value.AddDays(i);
                        //}

                        _mock.Add(new DeletedDocumentDto
                        {
                            DocumentId = Guid.NewGuid(),
                            DocumentName = "Test" + i,
                            DocumentType = "Transaction" + i,
                            ArchivedDate = DateTime.Now.AddDays(i - 1),
                            ArchivedBy = "Supakit.T",
                            DeletedDate = DateTime.Now,
                            DeletedBy = "Supakit.T",
                            IsProtected = prime,
                            ProtectionStartDate = protectionStart,
                            ProtectionEndDate = protectionEnd
                        });
                    }
                }

                return _mock;
            }
        }

        private static bool IsPrime(int number)
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
    }
}