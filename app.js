var http = require("http");
var fs = require("fs");
var mysql = require("mysql");
var postQuery = require("querystring");

var port = 8080;


let loginPageTextHtml = '', registrationPageTextHtml = '';

//this spans the remaining code
http.createServer(function (req, res) {

  //getting and writing the login 
  if (req.url == '/') {
    fs.readFile("./index.html", function (err, data) {
      if (err) throw err;
      else {
        loginPageTextHtml = data;
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(loginPageTextHtml);
      }
    });
  }


  //creating login page
  if (req.url == '/registrationPage') {
    fs.readFile("./registrationPage.html", function (err, data) {
      if (err) throw err;
      else {
        registrationPageTextHtml = data;
        res.writeHead(200, { 'content-type': 'text/html' });
        res.end(data);
      }
    });
  }



  //getting the login information from the post method using querysring
  if (req.method == 'POST' && req.url == '/login') {
    var username, password, id, email, body = '';

    req.on('data', function (chunk) {
      body += chunk;
    });
    req.on('end', function () {
      var temp = postQuery.parse(body);
      username = temp.username;
      password = temp.password;



      //check internet connectivity
      require('dns').resolve('www.google.com', function (err) {
        if (err)
          res.end("<h1 style=\"margin:auto;text-align:center;\">please connect to internet and try again..</h1>");

        //now checking the username by searching it in database table, if found then password is checked
        else if (username) {

          //accessing mysql database

          var con = mysql.createConnection({
            host: 'sql12.freemysqlhosting.net',
            user: 'sql12359405',
            password: 'lQK1F9xnFY',
            database: 'sql12359405'
          });

          con.connect(function (err) {
            if (err) throw err;
            con.query('select * from credentials where username=\'' + username + '\';', function (err, result) {
              if (err) throw err;



              //if username not found
              if (result == false) {
                res.writeHead(200, { 'content-type': 'text/html' });
                res.end(loginPageTextHtml + "<script>alert(\"wrong username\");</script>");
              }

              //storing the id and email from the query 

              //if password is correct for given username
              else if (password == result[0].password) {
                id = result[0].id;
                email = result[0].email;

                fs.readFile("./welcome.html", function (err, data) {
                  if (err) throw err;
                  else {
                    res.end(data + "fillDetails(\"" + username + "\", \"" + id + "\", \"" + email + "\")</script></html>");
                  }
                });
              }

              //if password wrong for given username
              else {
                res.end(loginPageTextHtml + "<script>alert(\"wrong password\");</script>");
              }

            });
          });
        }
        else {
          res.writeHead(200, { 'content-type': 'text/html' });
          res.end(loginPageTextHtml + "<script>alert(\"please fill the form\");</script>");
        }
      });

    });
  }


  if (req.method == 'POST' && req.url == '/registration') {
    let username, id, email, password, confirmPassword, body = '';

    req.on('data', function (chunk) {
      body += chunk;
    });
    req.on('end', function () {
      var temp = postQuery.parse(body);
      username = temp.username;
      id = temp.id;
      email = temp.email;
      password = temp.password;
      confirmPassword = temp.confirmPassword;



      //check internet connectivity
      require('dns').resolve('www.google.com', function (err) {
        if (err)
          res.end("<h1 style=\"margin:auto;text-align:center;\">please connect to internet and try again..</h1>");


        else if (password != confirmPassword) {
          res.end(registrationPageTextHtml + "<script>alert(\"passwords do not match!\");keepFormData(\"" + username + "\", \"" + id + "\", \"" + email + "\", \"" + password + "\");</script>");
          res.end();
        }

        else {
          var con = mysql.createConnection({
            host: 'sql12.freemysqlhosting.net',
            user: 'sql12359405',
            password: 'lQK1F9xnFY',
            database: 'sql12359405'
          });

          con.connect(function (err, data) {
            if (err) throw err;
            con.query('select username from credentials where username=\'' + username + '\';', function (err, result) {
              if (err) throw err;

              else if (result != false) {
                res.end(registrationPageTextHtml + "<script>alert(\"this username is taken, try a new one\");keepFormData(\"\", \"" + id + "\", \"" + email + "\", \"" + password + "\");</script>");
                res.end();
              }
              else {
                con.query("insert into credentials values(\"" + username + "\", \"" + password + "\", \"" + id + "\", \"" + email + "\");", function (err, result) {
                  if (err) throw err;
                  else if (result.serverStatus == 2) {
                    res.end("<html><h1>registration successfull, <a href=\"/\">click here </a> to login.</h1>");
                  }
                  else {
                    res.end("please retry, some unknown error occured");
                  }
                });
              }
            });
          });
        }






      });
    });
  }
}).listen(port);