const express = require('express');
const router = express.Router();
//==============================================

const connectDB = require('../config/connectDB.js');
const db = connectDB.init();
connectDB.open(db);
//==============================================
const offset = 1000 * 60 * 60 * 9
const krNow = new Date((new Date()).getTime() + offset)
now = krNow.toISOString().replace("T", " ").split('.')[0];
//==============================================

router.post('/',(req,res) => {
  const diary_no = req.body.diary_no;
  const selectQuery = `SELECT comments.comment_no, comments.diary_no, comments.user_no, comments.comment, comments.createdAt, comments.updatedAt, users.user_id FROM comments LEFT JOIN users on comments.user_no=users.user_no WHERE comments.diary_no=${diary_no};`;
  const countQuery = `SELECT COUNT(*) as cnt FROM comments WHERE diary_no=${diary_no};`
  db.query(selectQuery + countQuery, (err, result) => {
    if(err) console.log("err",err);
    else{
      // console.log("diary_no",diary_no);
      res.send(result);
      // console.log('result', result);
    }
  })
});
//==============================================
router.post('/insert', (req,res) => {
  const diary_no = req.body.diary_no;
  const comment = req.body.comment;
  const user = req.body.user;
  const insertQuery = `INSERT INTO comments (diary_no, user_no, comment) VALUES ('${diary_no}', '${user}', '${comment}');`
  db.query(insertQuery, (err,result) => {
    if(err) console.log("err",err);
    else {
      // console.log("diary_no",diary_no);
      res.send(result);
      // console.log('result', result);
    }
  })
})
//==============================================

router.post('/delete',(req,res)=>{
  const comment_no = req.body.comment_no;
  const deleteQuery = `DELETE FROM comments WHERE comment_no=${comment_no};`
  db.query(deleteQuery, (err,result)=>{
    if(err) console.log("err",err);
    else{
      console.log("comment_no",comment_no);
      res.send(result);
      console.log('result',result);
    }
  })
})
//==============================================

router.get('/count',(req,res)=>{
  const countQuery = `SELECT diary_no, COUNT(*) as cnt FROM comments GROUP BY diary_no;`
  db.query(countQuery, (err,result)=>{
    if(err) console.log("err",err);
    else{
      res.send(result);
      console.log(result)
    }
  })
})
//==============================================

router.post('/update', (req,res) => {
  const updateComment = req.body.updateComment;
  const comment_no = req.body.comment_no;
  const updateQuery = `UPDATE comments SET comment = '${updateComment}', updatedAt='${now}' WHERE comment_no = ${comment_no};`
  db.query(updateQuery, (err,result) => {
    if(err) console.log("err",err);
    else res.send(result);
  })
})
//==============================================
module.exports = router;