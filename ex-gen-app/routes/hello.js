//ルーティングの設定
var express = require('express');
var router = express.Router();

//sqliteモジュールのロード
var sqlite3 = require('sqlite3');

//dbオブジェクトの取得
var db = new sqlite3.Database('mydb.db');

//express-validater
var { check, validationResult } = require('express-validator/check');

//getリクエスト(index)
router.get('/',(req,res,next) => {
    //dbのシリアライズ
    db.serialize( () => {
        //レコードの取り出し
        db.all("SELECT * FROM mydata ",(err,rows) => {
            //DBアクセス完了時の処理
            if(!err) {
                var data = {
                    title: 'Hello!',
                    content: rows
                }
                res.render('hello/index',data);
            }
        });
    });
});

//getリクエスト(add)
router.get('/add', (req,res,next) => {
    var data = {
        title:'Hello/Add',
        content:'新しいレコードを入力:',
        name_error:"",
        mail_error :"",
        age_error:"",
        form:{name:'',mail:'',age:0}
    }
    res.render('hello/add',data);
});

//postリクエスト(add)
router.post('/add',[
    check('name','NAME は必ず入力してください').isLength({min:1}),
    check('mail','MAIL は必ずメールアドレスを入力してください').isEmail(),
    check('age','age は数字を入力してください').isInt()
], (req,res) => {
    var response = res;
    var errors = validationResult(req);
    if(!errors.isEmpty()){
        //var res = ' <ul class="error"> ';
        var result_arr = errors.array();
        var name_error = result_arr[0].msg;
        var mail_error  = result_arr[1].msg;
        var age_error = result_arr[2].msg;
        var data = {
            title:'Hello/Add',
            content:"",
            name_error:name_error,
            mail_error :mail_error,
            age_error:age_error,
            form:req.body
        }
        response.render('hello/add',data);
    } else {
        var nm = req.body.name;
        var ml = req.body.mail;
        var ag = req.body.age;
        //dbへのインサート
        db.run('insert into mydata (name , mail, age) values ( ?, ?, ? )',nm,ml,ag);
        res.redirect('/hello');
    }
    // req.getValidationResult().then((result) => {
    //     if(!result.isEmpty()){
    //         var res = '<ul class="error">';
    //         var result_arr = result.array();
    //         for(var n in result_arr){
    //             res += '<li>' + result_arr[n].msg + '</li>'
    //         }
    //         res += '</ul>';
    //         var data = {
    //             title:'Hello/Add',
    //             content:res,
    //             form:req.body
    //         }
    //         response.render('hello/add',data);
    //     } else {
    //         var nm = req.body.name;
    //         var ml = req.body.mail;
    //         var ag = req.body.age;
    //         //dbへのインサート
    //         db.run('insert into mydata (name , mail, age) values ( ?, ?, ? )',nm,ml,ag);
    //         res.redirect('/hello');
    //     }
    // });
});

//getリクエスト(show)
router.get('/show',(req,res,next) => {
    var id = req.query.id;
    db.serialize(() => {
        //レコードの取り出し
        var q = "SELECT * FROM mydata WHERE id = ?";
        db.get(q,[id],(error,row) => {
            if(!error){
                var data = {
                    title:'Hello/show',
                    content:'id = '+id+' のレコード',
                    mydata: row
                }
                //取り出した値を表示
                res.render('hello/show',data);
            }
        });
    });
});

//getリクエスト(edit)
router.get('/edit',(req,res,next) => {
    var id = req.query.id;
    db.serialize(() => {
        var q = "SELECT * FROM mydata WHERE id = ? ";
        db.get(q,[id],(error,row) => {
            if(!error){
                var data = {
                    title: 'hello/edit',
                    content: 'id = '+id+' のレコードを編集 :',
                    mydata:row
                }
                res.render('hello/edit',data);
            }
        });
    });
});

//postリクエスト(edit)
router.post('/edit',(req,res,next) => {
    var id = req.body.id;
    var nm = req.body.name;
    var ml = req.body.mail;
    var ag = req.body.age;
    var q  = "UPDATE mydata SET name = ? , mail = ? , age = ?  WHERE id = ? ";
    db.run(q,nm,ml,ag,id);
    res.redirect('/hello');
});

//getリクエスト(delete)
router.get('/delete',(req,res,next) => {
    var id = req.query.id;
    db.serialize(() => {
        var q = "SELECT * FROM mydata WHERE id = ? ";
        db.get(q,[id],(error,row) => {
            if(!error){
                var data = {
                    title:'Hello/delete',
                    content:'id = '+id+' のレコードを削除 ：',
                    mydata: row
                }
            }
            res.render('hello/delete',data);
        });
    });
});

//postリクエスト(edit)
router.post('/delete',(req,res,next) => {
    var id = req.body.id;
    var q = "DELETE FROM mydata WHERE id = ? ";
    db.run(q,id);
    res.redirect('/hello');
});

module.exports = router;