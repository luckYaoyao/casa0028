import { useState, useEffect } from 'react';
import BookListItem from './BookListItem';

function PlaqueModal(props) {

    function closeModal() {
        props.setIsModalOpen(false)
    }

    const [books, setBooks] = useState([]);

    async function fetchBooks() {
        const author = props.selectedPlaque.properties.lead_subject_name;
        

        try {
            const response = await fetch(`http://openlibrary.org/search.json?author=${author}&limit=5`);
            const data = await response.json();
            console.log("Fetched books data:", data);
            setBooks(data.docs);
        } catch (error) {
            console.error("Error fetching books data:", error);
        }
    }

    useEffect(() => {
        fetchBooks();
    }, []);


    return (
        <div className="fixed inset-0 z-50 grid place-content-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="Books recommended for this plaque">
            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg h-full overflow-y-auto">
                <div class="flex items-start justify-between">
                    <div className="mt-4 relative">
                        <button
                            className="absolute top-0 right-0 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 focus:outline-none"
                            onClick={closeModal}
                            aria-label="Close modal"
                        >
                            &times;
                        </button>
                        {books.length === 0 ? (
                            <p>Loading recommended reading...</p>
                        ) : (
                            books.map((book) => (
                                <BookListItem key={book.cover_edition_key} book={book} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PlaqueModal