const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 1000;

app.use(bodyParser.json());
app.use(express.static('public'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/signup', (req, res) => {
  // 회원 가입 로직을 처리.
  const { 이름, 아이디, 비밀번호, 이메일, 추천인ID, 동의 } = req.body;

  // 가입 데이터를 서버 콘솔에 출력.
  console.log('회원 가입 데이터:', req.body);
  res.status(200).json({ message: '회원 가입 성공!' });
});


const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('in-memory SQLite database에 연동 성공.');
});

db.serialize(() => {
  db.run('CREATE TABLE reservations (name TEXT, phone TEXT)');
});

app.post('/api/reservation', (req, res) => {
  const phone = req.body.phone;
  const name = req.body.name;

  db.run(`INSERT INTO reservations (name, phone) VALUES (?, ?)`, [name, phone], (err) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }
    res.status(201).send({ success: true });
  });
});

app.get('/api/reservation/check', (req, res) => {
  const name = req.query.name;
  const phone = req.query.phone;

  db.get('SELECT * FROM reservations WHERE name = ? AND phone = ?', [name, phone], (err, row) => {
    if (err) {
      res.status(500).send({ success: false, error: err.message });
      return;
    }
    if (row) {
      res.status(200).send({ success: true, reservation: row });
    } else {
      res.status(404).send({ success: false, reservation: null });
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
