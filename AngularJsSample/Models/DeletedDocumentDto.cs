﻿using System;
using System.Collections.Generic;

namespace AngularJsSample.Models
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

        public int ProtectionPeriod
        {
            get
            {
                if (!IsProtected || !ProtectionEndDate.HasValue || ProtectionEndDate < DateTime.UtcNow.AddDays(-1).Date)
                    return 0;

                return ProtectionEndDate.Value.Year - ArchivedDate.Year;
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
                            protectionStart = DateTime.UtcNow;
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
                            ArchivedDate = DateTime.UtcNow.AddDays(i - 1),
                            ArchivedBy = "Supakit.T",
                            DeletedDate = DateTime.UtcNow,
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
            if ((number & 1) == 0) //even number
                return false;

            for (int i = 3; i < number; i++)
            {
                if (number%i == 0)
                    return false;
            }

            return true;
        }

        public static Func<DeletedDocumentDto, bool> Condition(string query)
        {
            if (string.IsNullOrEmpty(query))
                return x => true;

            Func<DeletedDocumentDto, bool> predicate = null;

            predicate = document => document.DocumentName.ToLower()
                .Contains(query.ToLower());

            return predicate;
        }
    }
}