const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite3'
});

const Package = sequelize.define('Package', {
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tracking_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  courier_company: {
    type: DataTypes.STRING,
    allowNull: false
  },
  item_name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}); 

app.get('/', function(req, res) {
  res.send('Hello World!');
});

// 회원가입: 새로운 사용자 등록
app.post('/signup', async (req, res) => {
  const { phone_number } = req.body;

  try {
    const packageList = await Package.findAll({
      where: { phone_number: phone_number }
    });

    if (packageList.length > 0) {
      // 이미 등록된 전화번호인 경우
      res.status(409).json({ message: 'Phone number already exists' });
    } else {
      // 새로운 전화번호인 경우
      await Package.create(req.body);
      res.status(201).json({ message: 'Successfully registered' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 로그인: 사용자 정보 조회
app.get('/login', async (req, res) => {
  const { phone_number } = req.query;

  try {
    const packageList = await Package.findAll({
      where: { phone_number: phone_number }
    });

    if (packageList.length > 0) {
      // 사용자 정보 조회 성공
      res.status(200).json(packageList);
    } else {
      // 사용자 정보 조회 실패
      res.status(404).json({ message: 'Phone number not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//3.추가- 전화번호, 운송장번호, 택배회사, 품목명 등록(upadate)
//전화번호는 로그인한 번호로 자동등록
// 추가: 새로운 택배 정보 등록
app.post('/packages', async (req, res) => {
  const { phone_number, tracking_number, courier_company, item_name } = req.body;

  try {
    await Package.create({
      phone_number,
      tracking_number,
      courier_company,
      item_name
    });

    res.status(201).json({ message: 'Successfully added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 수정: 택배 정보 수정
app.put('/packages/:id', async (req, res) => {
  const { id } = req.params;
  const { tracking_number, courier_company, item_name } = req.body;

  try {
    const packageObj = await Package.findByPk(id);

    if (packageObj) {
      await packageObj.update({
        tracking_number,
        courier_company,
        item_name
      });

      res.status(200).json({ message: 'Successfully updated' });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 삭제: 택배 정보 삭제
app.delete('/packages/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const packageObj = await Package.findByPk(id);

    if (packageObj) {
      await packageObj.destroy();
      res.status(200).json({ message: 'Successfully deleted' });
    } else {
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 상세조회: 선택한 운송장번호, 택배회사 조회
app.get('/packages/:tracking_number/:courier_company', async (req, res) => {
  const { tracking_number, courier_company } = req.params;

  try {
    const packageList = await Package.findAll({
      where: {
        tracking_number: tracking_number,
        courier_company: courier_company
      }
    });

    if (packageList.length > 0) {
      // 조회 성공
      res.status(200).json(packageList);
    } else {
      // 조회 실패
      res.status(404).json({ message: 'Package not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(3000, () => console.log('Server started'));