var cors = require('cors')
var express = require('express');
var mysql = require('mysql');

var app = express();
var con = mysql.createConnection({
    host: '192.168.1.10',
    user: 'tblexcelsior',
    password: 'tblexcelsior',
    database: 'Smart_Bin'
})

app.use(express.json());
app.use(cors())
app.get("/", cors(), async (req, res) => {
    res.send("Hello World!");
  });

app.get('/percent', (req, res) => {
    con.query("SELECT * FROM bin_percentage;", (err, results, fields) => {
      if(err) throw err;
      res.send(results);
    });
  });
app.get('/day', (req, res) => {
    con.query("select g_type, count(g_type) as total from garbage_statistic where date(updated_time) = curdate() group by g_type;", (err, results, fields) => {
      if(err) throw err;
      res.send(results);
    });
  });

app.get('/month', (req, res) => {
    con.query("select g_type, count(g_type) as total from garbage_statistic where month(updated_time) = month(current_date()) group by g_type;", (err, results, fields) => {
      if(err) throw err;
      res.send(results);
    });
  });

app.get('/day/category', (req, res) => {
    con.query("select g_type, hour(updated_time) as hour, count(g_type) as total from garbage_statistic where day(updated_time) = day(current_date()) and hour(updated_time) between 8 and 19 group by g_type, hour(updated_time);", (err, results, fields) => {
      if(err) throw err;
      res.send(results);
    });
  });

app.get('/month/category', (req, res) => {
    con.query("select g_type, month(updated_time) as month, count(g_type) as total from garbage_statistic where year(updated_time) = year(current_date())  group by  g_type, month(updated_time);", (err, results, fields) => {
      if(err) throw err;
      res.send(results);
    });
  });

app.get('/processing', (req, res) => {
  con.query("select processing from process where id=1;", (err, results, fields) => {
    if(err) throw err;
    res.send(results);
  })
})

app.listen(4000, () => {
    console.log('Node server is running at http://localhost:4000')
})