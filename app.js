const mysql = require("mysql");
const express = require("express");
const app = express();
const ejs = require("ejs");
const request = require("request");

// create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Irfu@1996",
  database: "Users",
});

// connect to MySQL database
connection.connect((error) => {
  if (error) {
    console.error("Error connecting to MySQL database: ", error);
  } else {
    console.log("Connected to MySQL database.");
    // create the Users_table if it does not already exist
    const createTableQuery = `CREATE TABLE IF NOT EXISTS Users_table (
        id INT(11) NOT NULL AUTO_INCREMENT,
  gender VARCHAR(255),
  title VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  street_number INT(11),
  street_name VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  postcode VARCHAR(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255),
  timezone_offset VARCHAR(255),
  timezone_description VARCHAR(255),
  email VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  salt VARCHAR(255),
  md5 VARCHAR(255),
  sha1 VARCHAR(255),
  sha256 VARCHAR(255),
  dob_date DATE,
  dob_age INT(11),
  registered_date DATE,
  registered_age INT(11),
  phone VARCHAR(255),
  cell VARCHAR(255),
  ssn_name VARCHAR(255),
  ssn_value VARCHAR(255),
  picture_large VARCHAR(255),
  picture_medium VARCHAR(255),
  picture_thumbnail VARCHAR(255),
  nat VARCHAR(255),
  PRIMARY KEY (id)
    )`;
    connection.query(createTableQuery, (error, results) => {
      if (error) {
        console.error("Error creating Users_table: ", error);
      } else {
        console.log("Users_table created successfully.");
      }
    });
  }
});

// set up Express app to use EJS as its view engine
app.set("view engine", "ejs");

// define route to retrieve data from MySQL and render .ejs file
app.get("/", (req, res) => {
  connection.query("SELECT * FROM Users_table", (error, results) => {
    if (error) {
      console.error("Error retrieving data from MySQL database: ", error);
    } else {
      res.render("index", { data: results });
    }
  });
});
app.post("/fetch-users", (req, res) => {
  const options = {
    url: "https://randomuser.me/api/?results=50",
    json: true,
  };

  // Make request to the API
  request(options, (error, response, body) => {
    if (error) {
      console.error("Error fetching data from API: ", error);
      res.send("Error fetching data from API");
      return;
    }

    // Parse response from the API
    const users = body.results.map((user) => {
      return [
        user.gender,
        user.name.title,
        user.name.first,
        user.name.last,
        user.location.street.number,
        user.location.street.name,
        user.location.city,
        user.location.state,
        user.location.country,
        user.location.postcode,
        user.location.coordinates.latitude,
        user.location.coordinates.longitude,
        user.location.timezone.offset,
        user.location.timezone.description,
        user.email,
        user.login.username,
        user.login.password,
        user.login.salt,
        user.login.md5,
        user.login.sha1,
        user.login.sha256,
        new Date(user.dob.date),
        user.dob.age,
        new Date(user.registered.date),
        user.registered.age,
        user.phone,
        user.cell,
        user.id.name,
        user.id.value,
        user.picture.large,
        user.picture.medium,
        user.picture.thumbnail,
        user.nat,
      ];
    });

    // Insert users into the Users_table
    const insertQuery =
      "INSERT INTO Users_table (gender, title, first_name, last_name, street_number, street_name, city, state, country, postcode, latitude, longitude, timezone_offset, timezone_description, email, username, password, salt, md5, sha1, sha256, dob_date, dob_age, registered_date, registered_age, phone, cell, ssn_name, ssn_value, picture_large, picture_medium, picture_thumbnail, nat) VALUES ?";
    connection.query(insertQuery, [users], (error, results) => {
      if (error) {
        console.error("Error inserting users into database: ", error);
        res.send("Error inserting users into database");
        return;
      }

      console.log(`Inserted ${results.affectedRows} users into database.`);
      res.redirect("/");
    });
  });
});
app.post("/delete-users", (req, res) => {
  const sql = "DELETE FROM Users_table";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    console.log(`Deleted ${result.affectedRows} rows.`);
    res.send("Deleted all users.");
  });
});

// In your server-side code:
// app.get('/user-details', function(req, res) {

//   var limit = 10; // set the limit to 10 data per page
//   var offset = (req.query.page - 1) * limit || 0; // calculate the offset based on the current page

//   connection.query('SELECT * FROM Users_table LIMIT ? OFFSET ?', [limit, offset], function(err, results) {
//     if (err) throw err;

//     res.render('user-details', { users: results }); // render the EJS template with the query results
//   });
// });
app.get("/user-details", function (req, res) {
  const limit = 10; // set the limit to 10 data per page
  const page = parseInt(req.query.page) || 1; // parse the current page from the query parameter, default to 1
  const offset = (page - 1) * limit; // calculate the offset based on the current page

  connection.query(
    "SELECT COUNT(*) AS total FROM Users_table",
    function (err, result) {
      if (err) throw err;

      const total = result[0].total; // get the total number of rows
      const pages = Math.ceil(total / limit); // calculate the total number of pages

      connection.query(
        "SELECT * FROM Users_table LIMIT ? OFFSET ?",
        [limit, offset],
        function (err, results) {
          if (err) throw err;

          res.render("user-details", {
            data: results,
            pages: pages,
            current: page,
            total: total,
            hasPrevoiuspage: page > 1,
            hasNextpage: limit * page < total,
            previousPage: page - 1,
            nextPage: page + 1,
            lastPage: Math.ceil(total / limit),
          });
        }
      );
    }
  );
});

// start server
app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
