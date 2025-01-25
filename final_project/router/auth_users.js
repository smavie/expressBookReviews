const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
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

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
// Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
}}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }

});




// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN from the request parameter
  const review = req.body.review; // Get the review from the request body
  const username = req.session.authorization?.username; // Get the username from the session

  // Check if the username and review are provided
  if (!username) {
      return res.status(403).json({ message: "User not logged in" });
  }

  if (!review) {
      return res.status(400).json({ message: "Review cannot be empty" });
  }

  // Find the book by ISBN
  const book = Object.values(books).find((b) => b.isbn === isbn);

  if (!book) {
      return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }

  // Initialize reviews if not already present
  if (!book.reviews) {
      book.reviews = {};
  }

  // Add or update the review by the current user
  book.reviews[username] = review;

  return res.status(200).json({
      message: `Review for ISBN ${isbn} added/updated successfully.`,
      reviews: book.reviews,
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
