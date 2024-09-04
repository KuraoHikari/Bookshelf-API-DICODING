const Hapi = require("@hapi/hapi");
const { nanoid } = require("nanoid");

const books = [];

const getCurrentTimestamp = () => new Date().toISOString();

const STATUS_SUCCESS = "success";
const STATUS_FAIL = "fail";
const STATUS_CODE_OK = 200;
const STATUS_CODE_CREATED = 201;
const STATUS_CODE_BAD_REQUEST = 400;
const STATUS_CODE_NOT_FOUND = 404;

const HTTP_METHOD_GET = "GET";
const HTTP_METHOD_POST = "POST";
const HTTP_METHOD_PUT = "PUT";
const HTTP_METHOD_DELETE = "DELETE";

const BOOKS_PATH = "/books";

const init = async () => {
 const server = Hapi.server({
  port: 9000,
  host: "localhost",
 });

 server.route([
  {
   method: HTTP_METHOD_POST,
   path: BOOKS_PATH,
   handler: (request, h) => {
    const {
     name,
     year,
     author,
     summary,
     publisher,
     pageCount,
     readPage,
     reading,
    } = request.payload;

    if (!name)
     return h
      .response({
       status: STATUS_FAIL,
       message: "Gagal menambahkan buku. Mohon isi nama buku",
      })
      .code(STATUS_CODE_BAD_REQUEST);

    if (readPage > pageCount)
     return h
      .response({
       status: STATUS_FAIL,
       message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(STATUS_CODE_BAD_REQUEST);

    const id = nanoid(5);
    const finished = pageCount === readPage;
    const insertedAt = getCurrentTimestamp();
    const updatedAt = insertedAt;

    const newBook = {
     id,
     name,
     year,
     author,
     summary,
     publisher,
     pageCount,
     readPage,
     finished,
     reading,
     insertedAt,
     updatedAt,
    };

    books.push(newBook);

    return h
     .response({
      status: STATUS_SUCCESS,
      message: "Buku berhasil ditambahkan",
      data: {
       bookId: id,
      },
     })
     .code(STATUS_CODE_CREATED);
   },
  },
  {
   method: HTTP_METHOD_GET,
   path: BOOKS_PATH,
   handler: (request, h) => {
    const { name, reading, finished } = request.query;

    let filteredBooks = books;

    if (name)
     filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
     );

    if (reading !== undefined)
     filteredBooks = filteredBooks.filter(
      (book) => book.reading === Boolean(parseInt(reading))
     );

    if (finished !== undefined)
     filteredBooks = filteredBooks.filter(
      (book) => book.finished === Boolean(parseInt(finished))
     );

    return h
     .response({
      status: STATUS_SUCCESS,
      data: {
       books: filteredBooks.map(({ id, name, publisher }) => ({
        id,
        name,
        publisher,
       })),
      },
     })
     .code(STATUS_CODE_OK);
   },
  },
  {
   method: HTTP_METHOD_GET,
   path: `${BOOKS_PATH}/{bookId}`,
   handler: (request, h) => {
    const { bookId } = request.params;
    const book = books.find((b) => b.id === bookId);

    if (!book)
     return h
      .response({
       status: STATUS_FAIL,
       message: "Buku tidak ditemukan",
      })
      .code(STATUS_CODE_NOT_FOUND);

    return h
     .response({
      status: STATUS_SUCCESS,
      data: {
       book,
      },
     })
     .code(STATUS_CODE_OK);
   },
  },
  {
   method: HTTP_METHOD_PUT,
   path: `${BOOKS_PATH}/{bookId}`,
   handler: (request, h) => {
    const { bookId } = request.params;
    const {
     name,
     year,
     author,
     summary,
     publisher,
     pageCount,
     readPage,
     reading,
    } = request.payload;

    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1)
     return h
      .response({
       status: STATUS_FAIL,
       message: "Gagal memperbarui buku. Id tidak ditemukan",
      })
      .code(STATUS_CODE_NOT_FOUND);

    if (!name)
     return h
      .response({
       status: STATUS_FAIL,
       message: "Gagal memperbarui buku. Mohon isi nama buku",
      })
      .code(STATUS_CODE_BAD_REQUEST);

    if (readPage > pageCount)
     return h
      .response({
       status: STATUS_FAIL,
       message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
      })
      .code(STATUS_CODE_BAD_REQUEST);

    const updatedAt = getCurrentTimestamp();

    books[bookIndex] = {
     ...books[bookIndex],
     name,
     year,
     author,
     summary,
     publisher,
     pageCount,
     readPage,
     reading,
     finished: pageCount === readPage,
     updatedAt,
    };

    return h
     .response({
      status: STATUS_SUCCESS,
      message: "Buku berhasil diperbarui",
     })
     .code(STATUS_CODE_OK);
   },
  },
  {
   method: HTTP_METHOD_DELETE,
   path: `${BOOKS_PATH}/{bookId}`,
   handler: (request, h) => {
    const { bookId } = request.params;

    const bookIndex = books.findIndex((b) => b.id === bookId);

    if (bookIndex === -1)
     return h
      .response({
       status: STATUS_FAIL,
       message: "Buku gagal dihapus. Id tidak ditemukan",
      })
      .code(STATUS_CODE_NOT_FOUND);

    books.splice(bookIndex, 1);

    return h
     .response({
      status: STATUS_SUCCESS,
      message: "Buku berhasil dihapus",
     })
     .code(STATUS_CODE_OK);
   },
  },
 ]);

 await server.start();
 console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
 console.log(err);
 process.exit(1);
});

init();
