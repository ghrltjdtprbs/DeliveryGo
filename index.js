const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("views"));
app.engine("html", require("ejs").renderFile);
app.set("views", __dirname + "/views");

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

// 데이터베이스 정의
const sequelize1 = new Sequelize({
  dialect: 'sqlite',
  storage: 'database1.sqlite',
});

const Feedbacks = sequelize1.define('Feedbacks', {
  
  feedback: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

(async () => {
  try {
    await sequelize1.authenticate();
    console.log('Connection has been established successfully.');
    await Feedbacks.sync();
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();

// 피드백 등록 페이지
app.get('/feedback', async function (req, res) {
  res.render('feedback', {  feedback: '' });
});

// 피드백 등록 처리
app.post('/feedback', async function (req, res) {
  const { feedback } = req.body;

  try {
    await Feedbacks.create({  feedback });
    res.status(401).send('<script>alert("소중한 의견 감사합니다."); location.href="/";</script>');
    res.render('/');
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
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
      res.redirect('/login')
      console.log('데이터저장성공');
      
    }
    res.redirect('/')
    console.log('데이터입력값',phone);
   
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

//main
app.get('/', async function (req, res) {
  res.render('main');
});

//login 페이지
app.get('/login', async function (req, res) {
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
      res.render('login', { phone, message: '로그인 실패! 회원가입을 해주세요' });
    }
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

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
      res.status(401).send('<script>alert("로그인에 실패하였습니다. 회원가입이 필요합니다."); location.href="/login";</script>');
      res.redirect('login')
    }
    
    const users = await Users.findAll({where: { phone }});
    res.render('new', { phone, company, number, itemname, users });
     console.log('데이터입력값', phone, company, number, itemname);
    console.log(itemname); 
   
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.get('/new?phone=', async function (req, res) {
  const phone = req.params.phone;

  try {
    const users = await Users.findAll({where: { phone }});
    res.render('phone', { phone, users });
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

app.post('/detailsearch', function(req, res) {
  var phone = req.query.phone;
  var itemname = req.query.itemname;
  var company = req.query.company;
  var number = req.query.number;

  res.render('detailsearch', {
    phone: phone,
    itemname: itemname,
    company: company,
    number: number
  });
});

app.post('/delete', async function (req, res) {
  const { id, phone } = req.body;

  try {
    await Users.destroy({ where: { id } });
    const users = await Users.findAll({ where: { phone } });
    res.render('new', { phone, users });
  } catch (error) {
    console.error(error);
    res.render('error', { message: '데이터베이스 오류가 발생했습니다.' });
  }
});

app.listen(3000, function () {
  console.log('Server is listening on port 3000');
});