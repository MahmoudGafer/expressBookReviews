const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
 return users.some((user) => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "username and password are required"}) 
  }

  if (authenticatedUser(username, password)) {

    let accessToken = jwt.sign(
      { data: username },
      "access", 
      { expiresIn: 60 * 60 }
    )

    req.session.authorization = { accessToken, username };

    return res.status(200).json({message: "User logged in successfully", token: accessToken});
  } else {
    return res.status(401).json({message: "Invalid username or password"});
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;
  
  if (!username) {
    return res.status(401).json({message: "You must be logged in to post a review"})
  }

  if (!review) {
    return res.status(400).json({message: "Review text is required"});
  }

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

    books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added successfully",
    reviews: books[isbn].reviews
  });
  });

  regd_users.delete("/auth/review/:isbn", (req, res) => {
     const isbn = req.params.isbn;
     const username = req.session.authorization?.username;

     if (!books[isbn]) {
      return res.status(404).json({message: "Book not found"});
     }

     if (!books[isbn].reviews[username]) {
      return res.status(404).json({message: "user does not exist"});
     }

     delete books[isbn].reviews[username];
     return res.status(200).json({ message: "Review successfully deleted", reviews: books[isbn].reviews });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;