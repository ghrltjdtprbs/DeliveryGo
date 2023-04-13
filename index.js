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
    type: DataTypes.ARRAY(DataTypes.STRING),
  },
  number: {
    type: DataTypes.ARRAY(DataTypes.STRING),
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

//register
app.get('/register', async function (req, res) {
  try {
    const users = await Users.findAll();
    res.render('register', { phone: '', users });
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.post('/register', async function (req, res) {
  const { phone } = req.body;

  try {
    let user = await Users.findOne({ where: { phone } });
    if(user){
      console.log('이미 가입된 사용자입니다.');
    }else{
      //register페이지에서 정보 입력하면 갱신해줌
      await Users.create(req.body);
      console.log('데이터저장성공');
      res.redirect('/new?phone=' + phone);
    }
    
    console.log('데이터입력값',phone);
   
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

//login 페이지
app.get('/', async function (req, res) {
  try {
    const users = await Users.findAll();
    res.render('login', { phone: '', users })
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.post('/login', async function (req, res) {
  const { phone } = req.body;
  try {
    const user = await Users.findOne({ where: { phone } })
    if (user) {
      // 전화번호가 일치하는 경우
      res.redirect('/new?phone=' + phone)
    } else {
      // 전화번호가 일치하지 않는 경우
      console.log('로그인 실패! 회원가입해주세요');
      res.status(401).send('로그인에 실패하였습니다.');
    }
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

/*
app.get('/register', async function (req, res) {
  console.log('회원가입창')
});*/

app.post('/new', async function (req, res) {
  const { phone, company, number, itemname } = req.body;

  try {
    let user = await Users.findOne({ where: { phone } });
    if(user){
      //new페이지에서 정보 입력하면 갱신해줌
      await Users.create({ phone, company, number, itemname });
      console.log('데이터저장성공')
    }else{
      console.log('로그인실패! 회원가입해주세요')
      
      res.redirect('/')
      
    }
    
    res.render('new', { phone, company:user.company, number:user.number, itemname });
     console.log('데이터입력값', user.phone);
    console.log(itemname); 
   
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
//
app.listen(3000, function () {
  console.log('Server is listening on port 3000');
});