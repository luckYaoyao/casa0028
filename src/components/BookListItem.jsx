export default function BookListItem(props) {
    const book = props.book;

    return (
        <div className="mb-4 flex items-center space-x-4">
            {book.cover_i ? (
                <img
                    src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                    alt={`${book.title} cover`}
                    className="h-24 w-auto rounded"
                />
            ) : (
                <div className="flex h-24 w-16 items-center justify-center rounded bg-gray-200 text-sm text-gray-500">
                    No Cover
                </div>
            )}
            <div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                {book.author_name && (
                    <p className="text-sm text-gray-600">by {book.author_name.join(', ')}</p>
                )}
            </div>
        </div>
    );
}