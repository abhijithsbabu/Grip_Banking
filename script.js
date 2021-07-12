var express = require('express');
app = express();

var bodyparser = require('body-parser');
var urlencoded = bodyparser.urlencoded({ extended: false });

var mysql = require("mysql");
const { Console } = require('console');
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "escn1838",
    database:"grip_banking"
  });

  connection.connect(function (err) {

});
app.use(express.static(__dirname + "/resources"));

app.get("/",function(req,res)
{
    res.sendFile(__dirname + '/' + 'index.html');
});

app.get("/users",urlencoded, function(req,res)
{
    
        connection.query("select * from customers;",function(err,result,fields){
            if(err) throw err;
            var i = 0;
            var html_string = "";
            html_string += "<html><head><link rel='stylesheet' href='mystyle.css'></head><body><center>";
            html_string += "<br><h1>USERS</h1><br><br><table align = 'center'>"
            html_string += "<tr id = 'head'><td>name</td><td>account Number</td><td>Balance</td><td></td></tr>"
            //console.log(html_string);
            while(i<result.length)
            {
                str = "<tr><td>" + result[i].name + "</td>";
                str += "<td>" + result[i].account_no + "</td>";
                str += "<td>" + result[i].balance + "</td>";
                str += "<td><form method = 'post' action = 'details'>";
                str += "<input type = 'hidden' name = 'acc_no' value = '" + result[i].account_no + "'/>"
                str += "<input type = 'submit' id = 'detail' value ='view'/></form>"
                html_string+=str;
                i++;
            }
            res.send(html_string)
    });
});


app.post('/details',urlencoded,function(req,res){
    var ac_no = req.body.acc_no;
    console.log(ac_no);
    var sql = "SELECT * FROM CUSTOMERS WHERE Account_no = " + ac_no + ";";
    
    connection.query(sql,function(err,result,fields){
        if(err) throw err;
        var i = 0;
        var html_string = "";
        html_string += "<html><head><link rel='stylesheet' href='mystyle.css'></head><body><center>";
        html_string += "<br><h1>USER DETAILS</h1><br><br><table id = 'dtl'>";
        console.log(html_string);
        while(i<result.length)
        {
            str = "<tr><td>Name : " + result[i].name + "</td></tr>";
            str += "<tr><td>Account Number : " + result[i].account_no + "</td></tr>";
            str += "<tr><td>Balance : " + result[i].balance + "</td></tr></table><br><br>";
            str += "<form method = 'post' action = 'transact'>";
            str += "<input type = 'hidden' name = 'acc_no' value = '" + result[i].account_no + "'/>"
            str += "<input type = 'hidden' name = 'nm' value = '" + result[i].name + "'/>"
            str += "<input type = 'submit' id = 'Transfer'  value ='Transfer Money'/></form>"
            html_string+=str;
            i++;
        }
        res.send(html_string)
    });

});


app.post("/transact",urlencoded,function(req,res)
{
    console.log("transaction page loading");
    var ac_no = req.body.acc_no;
    var usernm = req.body.nm;
    console.log(ac_no);
    var sql = "SELECT * FROM CUSTOMERS WHERE ACCOUNT_NO != " +ac_no+ ";";
    
    connection.query(sql,function(err,result,fields){
        if(err) throw err;
        var i = 0;
        var html_string = "";
        html_string += "<html><head><link rel='stylesheet' href='mystyle2.css'></head><body>";
        html_string += "<br><center><h1>USER DETAILS</h1></center><div style = 'margin-left:150px'><table>";
        html_string += "<tr><td>Sender : </td><td>" + usernm + " - " + ac_no + "</td></tr><tr>";
        html_string += "<form method = 'post' action = 'transfer'> ";
        html_string += "<input type = 'hidden' name = 'sender' value = "+ ac_no +">";
        html_string += "<td>Send to : </td><td><select name = 'reciever'>";
        
        while(i<result.length)
        {
            console.log('connection success');
        html_string += "<option value = '" + result[i].account_no + "'>" + result[i].name + " - ";
        html_string += result[i].account_no + "</option>";
        i++;
        }
        html_string += "</select></td></tr><tr><td>Enter Amount : </td><td><input type = 'Number' id = 'amtin' name = 'amount'/></td></tr>"        
        html_string += "<tr><td><input type = 'submit' id = 'transfer' value = 'send money'></form></td></tr></div></body></html>";
        
        
        res.send(html_string)
    });

});

app.post('/transfer',urlencoded,function(req,res)
{
    var reciever = req.body.reciever;
    var sender = req.body.sender;
    var amount = Number(req.body.amount);
    sql = "SELECT * FROM CUSTOMERS WHERE account_no = " + sender + ";";
    connection.query(sql,function(err,results,fields)
    {
        var bal1 = Number(results[0].balance);
        if(bal1<amount)
        {
            console.log("insufficient balance");
            var html_string = '';
            html_string += "<html><head><link rel='stylesheet' href='mystyle.css'></head><body><center>";
            html_string += "<br><h1>INSUFFICIENT BALANCE</h1><br><br>";
            html_string += "<form action = '/users'><input id = 'transfer' type = 'submit' value = 'Back to Home '/></form></html>"
            res.send(html_string)
            
        }
        else{
            bal1 -= amount;
            var stm = "UPDATE CUSTOMERS SET BALANCE = " + bal1 + " WHERE ACCOUNT_NO = " + sender;
            connection.query(stm,function(err,reslt)
            {
                html_string = '';
                html_string += "<html><head><link rel='stylesheet' href='mystyle.css'></head><body><center>";
                html_string += "<br><h1>TRANSACTION SUCCESSFUL</h1><br><br>";
                html_string += "<form action = '/users'><input id = 'transfer' type = 'submit' value = 'Back to home page'/></form></html>"
                res.send(html_string)
                sql2 = "SELECT * FROM CUSTOMERS WHERE account_no = " + reciever + ";";
                connection.query(sql2,function(er,rs,field)
                {
                    var bal2 = rs[0].balance;
                    bal2 = Number(bal2)
                    bal2 += Number(amount);
                    var stm2 = "UPDATE CUSTOMERS SET BALANCE = " + bal2 + " WHERE ACCOUNT_NO = " + reciever;
                    console.log(stm2);
                    connection.query(stm2, function(err1,rs1)
                    {
                        console.log("Transaction complete");
                    });
                });
    
            });
        }
    });
});

const port = process.env.PORT || 4400;
var server = app.listen(port);