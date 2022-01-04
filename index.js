const express = require("express");
const { Client } = require("pg");
var bodyParser = require("body-parser");

const app = express();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "rootpass",
  port: 5432,
});
client.connect();

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  //AUTHS-----------------

  if (email || password) {
    client
      .query(`SELECT id FROM users WHERE password='${password}' AND email='${email}'`)
      .then((response) => {
        const userId = response.rows[0];
        if (userId) {
          return res.send(userId);
        } else {
          res.status(404).send({ message: "Kullanıcı adı veya şifresi yanlış!" });
        }
      })
      .catch((e) => console.error(e.stack));
  } else {
    res.status(400).send();
  }
});

app.post("/register", (req, res) => {
  console.log(req.body);
  const { firstname, lastname, password, email } = req.body;
  if (firstname || lastname || password || email) {
    client
      .query(
        `INSERT INTO users(firstname, lastname, password, email) VALUES('${firstname}', '${lastname}', '${password}', '${email}')`
      )
      .then((response) => {
        console.log(response);
        return res.status(200).send();
      })
      .catch((e) => {
        console.error(e.stack);
        res.status(500).send();
      });
  } else {
    res.status(400).send();
  }
});

//EVENTS----------------

app.post("/event/new", (req, res) => {
  const userId = req.headers.id;
  const { name, latitude, longitude, startDate, description } = req.body;
  if (!userId) return res.status(403).send();
  if (name || latitude || longitude || startDate) {
    client
      .query(
        `INSERT INTO events(userId, name, latitude, longitude, startDate,description) VALUES('${userId}', '${name}', '${latitude}', '${longitude}', '${startDate}', '${description}')`
      )
      .then((response) => {
        console.log(response);
        return res.status(200).send();
      })
      .catch((e) => {
        console.error(e.stack);
        return res.status(500).send();
      });
  } else {
    res.status(400).send();
  }
});

app.get("/events", (req, res) => {
  const userId = req.headers.id;

  if (!userId) return res.status(403).send();

  client
    .query(`SELECT id,name,latitude,longitude,startDate,description FROM events `)
    .then((events) => {
      if (events) {
        return res.send(events.rows);
      } else {
        return res.status(404).send();
      }
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).send();
    });
});

app.get("/event/:id", (req, res) => {
  const userId = req.headers.id;
  const eventId = req.params.id;

  if (!userId) return res.status(403).send();
  if (!eventId) return res.status(400).send();

  client
    .query(
      `SELECT events.id, events.name, events.userid, 
      events.startdate, events.description, users.firstname, users.lastname
      FROM events 
      LEFT JOIN users ON events.userid=users.id
      WHERE events.id = '${eventId}' 
      `
    )
    .then((events) => {
      if (events.rows[0]) {
        return res.send(events.rows[0]);
      } else {
        return res.status(404).send();
      }
    })
    .catch((e) => {
      console.error(e.stack);
      res.status(500).send();
    });
});

//USERS----------------
app.get("/me", (req, res) => {
  const userId = req.headers.id;
  if (userId) {
    client
      .query(`SELECT email,firstname,lastname,age FROM users WHERE id='${userId}'`)
      .then((response) => {
        const user = response.rows[0];
        if (user) {
          console.log(user);
          return res.send(user);
        } else {
          res.status(404).send({ error: "Böyle bir kullanıcı bulunamadı!" });
        }
      })
      .catch((e) => {
        console.error(e.stack);
        res.status(500).send();
      });
  } else {
    res.status(404).send({ error: "Böyle bir kullanıcı bulunamadı!" });
  }
});

app.listen(8000, () => console.log("Example app listening on port 8000!"));
