const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();



// Get the book list available in the shop
// Get the full list of books
public_users.get('/', (req, res) => {
  // Wrapping the synchronous operation in a Promise
  const getBooks = new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (err) {
      reject("Error retrieving book list.");
    }
  });

  getBooks
    .then((bookList) => {
      res.status(200).json({ message: "Full book list", books: bookList });
    })
    .catch((error) => {
      res.status(500).json({ message: error });
    });
});

// Get book details based on ISBN

// Get book details based on ISBN
public_users.get('/books/:isbn', (req, res) => {
  const { isbn } = req.params;

  // Wrapping the book search in a Promise
  const getBookByISBN = new Promise((resolve, reject) => {
    const book = Object.values(books).find((b) => b.isbn === isbn);

    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });

  getBookByISBN
    .then((book) => {
      res.status(200).json({ message: "Book found", book });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});
  
// Endpoint to get books by author
public_users.get('/author/:author', function (req, res) {
  const { author } = req.params;

  // Create a promise to fetch books and filter by author
  new Promise((resolve, reject) => {
    const matchingBooks = Object.values(books).filter((book) => book.author.toLowerCase() === author.toLowerCase());

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);  // Resolve with matching books
    } else {
      reject(`No books found by author: ${author}`);  // Reject with message if no books found
    }
  })
    .then((matchingBooks) => {
      res.status(200).json({ message: "Books found", books: matchingBooks });
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const { title } = req.params;

  // Create a promise to fetch books and filter by title
  new Promise((resolve, reject) => {
    const matchingBooks = Object.values(books).filter((book) => book.title.toLowerCase() === title.toLowerCase());

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);  // Resolve with matching books
    } else {
      reject(`No books found with title: ${title}`);  // Reject with message if no books found
    }
  })
    .then((matchingBooks) => {
      res.status(200).json({ message: "Books found", books: matchingBooks });
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});


// Endpoint to get reviews for a book by ISBN
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;

  // Find the book with the matching ISBN
  const book = Object.values(books).find((b) => b.isbn === isbn);

  if (book) {
    res.status(200).json({ message: "Reviews found", reviews: book.reviews });
  } else {
    res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
  }
});

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

module.exports.general = public_users;
