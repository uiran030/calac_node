const express = require("express");
const router = express.Router();
//==============================================
const connectDB = require("../config/connectDB.js");
const db = connectDB.init();
connectDB.open(db);
//======================================================
// 날짜
let today = new Date();
let year = today.getFullYear();
let month = ("0" + ( today.getMonth() + 1 )).slice(-2);
let currentMonth = year+'-'+month;
//======================================================
// ledger page의 expense에 대한 이번달 카테고리별 total 데이터
router.get('/', (req, res) => {
  const currentMonthCategoryDataQuery = `SELECT ledger_category, SUM(ledger_count) AS sum_count FROM ledger WHERE ledger_createdAt LIKE '${currentMonth}%' and ledger_type='expense' GROUP BY ledger_category;`
  db.query( currentMonthCategoryDataQuery, (err, result) => {
    res.send(result);
  });
});
//======================================================
// ledger page의 type값에 따라 이번달기준 작성일 최신순 전체 리스트 뽑아내기
router.get('/total', (req, res) => {
  let type = req.query.type;
  const currentMonthlyQuery = `SELECT * FROM ledger WHERE ledger_type = '${type}' AND ledger_createdAt LIKE '${currentMonth}%' order by ledger_createdAt DESC`
  db.query( currentMonthlyQuery, (err, result) => {
    res.send(result);
  });
});
//======================================================
// ledger page의 월별 카테고리 데이터 합계 (type = 'expense')
router.get('/monthly/category', (req, res) => {
  const monthlyCategoryQuery = "SELECT ledger_category, DATE_FORMAT(ledger_createdAt, '%Y-%m') AS current_month, SUM(ledger_count) AS monthly_sum_count FROM ledger WHERE ledger_type='expense' GROUP BY current_month, ledger_category ORDER BY current_month ASC;"
  db.query( monthlyCategoryQuery, (err, result) => {
    res.send(result);
  });
});
// ledger page의 현재 달의 타입별(지출 or 수입)의 총액
router.get('/monthly/total', (req, res) => {
  let type = req.query.type;
  const monthlyTotalQuery = `SELECT ledger_type, SUM(ledger_count) AS sum_count FROM ledger WHERE ledger_createdAt LIKE '${currentMonth}%' AND ledger_type='${type}';`
  db.query(monthlyTotalQuery, (err, result) => {
    res.send(result);
  });
});
// ledger page의 작성일 최신순 3개 리스트 뽑아내기
router.get('/monthly/recent', (req, res) => {
  let type = req.query.type;
  const recentThreeQuery = `SELECT * from ledger WHERE ledger_createdAt LIKE '${currentMonth}%' and ledger_type='${type}' order BY ledger_createdAt desc LIMIT 3;`
  db.query(recentThreeQuery, (err, result) => {
    res.send(result);
  });
});
//======================================================
// ledger page의 weekly data (지난주)
router.get('/weekly', (req, res) => {
  const weeklyStartDay = req.query.weeklyStartDay
  const weeklyLastDay = req.query.weeklyLastDay
  const weeklyQuery = `SELECT ledger_category, sum(ledger_count) AS weekly_sum_count FROM ledger WHERE ledger_createdAt BETWEEN '${weeklyStartDay}%' AND '${weeklyLastDay}%' AND ledger_type = 'expense' GROUP BY ledger_category ORDER BY weekly_sum_count DESC;`;
  db.query(weeklyQuery, (err, result) => {
    res.send(result);
  })
})
//======================================================
//======================================================
// 우측 하단 modal의 insert
router.post("/insert", (req, res) => {
  const category = req.body.category;
  const type = req.body.type;
  const description = req.body.description;
  const count = req.body.count;
  const insertQuery = `INSERT INTO ledger (ledger_category, ledger_type, ledger_description, ledger_count) VALUES ('${category}', '${type}', '${description}', '${count}');`;
  db.query(insertQuery, (err, result) => {
    res.send("success!!!!!!!!!!");
  });
});
//======================================================
// ledger graph의 현재 달의 타입 구분없이 총액
router.get('/monthly/all/total', (req, res) => {
  const TotalExpenseIncomeQuery = `SELECT ledger_type, SUM(ledger_count) AS sum_count FROM ledger WHERE ledger_createdAt LIKE '${currentMonth}%' GROUP BY ledger_type ORDER BY ledger_type;`
  db.query(TotalExpenseIncomeQuery, (err, result) => {
    res.send(result);
  });
});
//======================================================
// ledger goal의 현재 달의 목표 지출액
router.get('/goal', (req, res) => {
  const goalMoneyQuery = `SELECT * FROM goal_money where money_createdAt LIKE '${currentMonth}%'`
  db.query(goalMoneyQuery, (err, result) => {
    res.send(result);
  });
});
// ledger goal의 insert
router.post('/goal/insert', (req, res) => {
  let count = req.body.count
  const goalMoneyInsertQuery = `INSERT INTO goal_money (money_count) VALUES ('${count}');`
  db.query(goalMoneyInsertQuery, (err, result) => {
    res.send(result);
  });
});
// ledger goal graph의 update (이번달 목표 지출 금액 수정)
router.put("/goal/update/:id", (req, res) => {
  const count = req.body.count;
  const no = req.body.no;
  const updateGoalQuery = `UPDATE goal_money  SET money_count=${count}, money_updatedAt=current_timestamp WHERE money_no= ${no};`;
  db.query(updateGoalQuery, (err, result) => {
    res.send("success!!!!!!!!!!");
  });
});
//======================================================
// ledger total page의 select
router.get("/total/select/:id", (req, res) => {
  const id = req.params.id;
  const insertQuery = `SELECT * FROM ledger WHERE ledger_no = ${id}`;
  db.query(insertQuery, (err, result) => {
    res.send(result);
  });
});

// ledger total page의 update 
router.put("/total/update/:id", (req, res) => {
  const id = req.params.id;
  const category = req.body.category;
  const description = req.body.description;
  const count = req.body.count;
  const updateQuery = `UPDATE ledger SET ledger_category='${category}', ledger_description='${description}', ledger_count='${count}', ledger_updatedAt=current_timestamp WHERE ledger_no = '${id}'`;
  db.query(updateQuery, (err, result) => {
    res.send(result);
  });
});

// ledger total page의 delete
router.delete("/delete/:id", (req, res) => {
  const id = req.params.id;
  const insertQuery = `DELETE FROM ledger WHERE ledger_no = ${id}`;
  db.query(insertQuery, (err, result) => {
    res.send("success!!!!!!!!!!");
  });
});

module.exports = router;
