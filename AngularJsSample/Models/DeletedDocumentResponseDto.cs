using System.Collections.Generic;

namespace AngularJsSample.Models
{
    /// <summary>
    /// Details of documents matching search criteria.
    /// </summary>
    public class DeletedDocumentResponseDto
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="DeletedDocumentResponseDto"/> class.
        /// </summary>
        public DeletedDocumentResponseDto()
        {
        }

        /// <summary>
        /// Gets or sets the total deleted documents.
        /// </summary>
        /// <value>The total deleted documents.</value>
        public int TotalDocuments { get; set; }

        /// <summary>
        /// Gets or sets the list of deleted documents.
        /// </summary>
        /// <value>The list of deleted documents.</value>
        public IEnumerable<DeletedDocumentDto> DeletedDocuments { get; set; }
    }
}
