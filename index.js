const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// 데이터베이스 정의
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

const Users = sequelize.define('Users', {
  phone: {
    type: DataTypes.TEXT,
    allowNull: false,
    
  },
  company: {
    type: DataTypes.TEXT,
  },
  number: {
    type: DataTypes.TEXT,
  },
  itemname: {
    type: DataTypes.TEXT,
  },
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await Users.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// login 페이지
app.get('/', async function (req, res) {
  try {
    const users = await Users.findAll();
    res.render('login', { phone: '', users });
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.post('/new', async function (req, res) {
  const { phone, company, number, itemname } = req.body;

  try {
    let user = await Users.findOne({ where: { phone } });
    if (user) {
      await user.update({ company, number, itemname });
    } else {
      await Users.create({ phone, company, number, itemname });
    }
    res.render('new', { phone, company, number, itemname });
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.get('/new', async function (req, res) {
  try {
    let phone = '';
    if (req.query.phone) {
      phone = req.query.phone;
    }
    const user = await Users.findOne({ where: { phone } });
    if (user) {
      // 기존 전화번호인 경우
      res.render('new', { phone: user.phone, company: user.company, number: user.number, itemname: user.itemname });
    } else {
      // 새로운 전화번호인 경우
      res.render('new', { phone: phone, company: '', number: '', itemname: '' });
    }
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.listen(3000, function () {
  console.log('Server is listening on port 3000');
});