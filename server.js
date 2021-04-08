const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const PORT = 3000;

const app = express();

app.use(bodyParser.json());

app.use(cors());



const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';

const dbName = 'rosh'


let db

MongoClient.connect(url, { useNewUrlParser: true }, (
    err, client) => {
    if (err) return console.log(err)

    db = client.db(dbName)
    console.log(`Connected MongoDb: ${url}`)
    console.log(`Database:${dbName}`)
})


/*
app.get('/getallprofile', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rosh");
        dbo.collection("rn").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})

app.get('/getAllSchools', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rosh");
        dbo.collection("school").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})*/




app.get('/getallaudits', function(req, res) {

    var searchuserId = req.query.userId
    var searchdocId = req.query.docId
    console.log(searchuserId)

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rosh");
        var mysort = { Date: -1 };
        dbo.collection("Audit_Trails").aggregate(
            [{
                '$lookup': {
                    'from': 'Document',
                    'localField': 'docId',
                    'foreignField': 'docId',
                    'as': 'All'
                }
            }, {
                '$lookup': {
                    'from': 'User',
                    'localField': 'userId',
                    'foreignField': 'userId',
                    'as': 'Allu'
                }
            }]
        ).sort(mysort).toArray(function(err, result) {

            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})


/*
app.get('/getalldarchive1', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rosh");

        dbo.collection("Documentarchive").find({}).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})*/

app.get('/getalldarchive', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rosh");
        const pipeline = [{
            '$project': {
                'docId': 1,
                'AdminId': 1,
                'Title': 1,
                'Type': 1,
                'ExpiredDate': 1,
                'Achieved': {
                    '$cond': {
                        'if': {
                            '$lt': [
                                '$ExpiredDate', new Date()
                            ]
                        },
                        'then': 1,
                        'else': 0
                    }
                }
            }
        }];
        var query = { Title: "research" }
        dbo.collection("Document").aggregate(pipeline).toArray(function(err, result) {
            if (err) throw err;
            console.log(result);
            res.send(result);
            db.close();
        });
    });
})




app.post('/setAchiveDate', function(req, res) {
    var NewexpireDate = req.query.exipireDate
    var documentId = req.query.docId
   
    var date = new Date(NewexpireDate);

    console.log("expire date is " + date)
    console.log("docId is " + documentId)


    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("rosh");
        var myquery = { docId: documentId };
        var newvalues = { $set: { ExpiredDate:date} };
        
        dbo.collection("Document").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;

            
            console.log("1 document updated");
            db.close();
        });
    });
})




app.get('/', function(req, res) {
    res.send('Hello from  server');
})

app.listen(PORT, function() {
    console.log("Server running on localhost:" + PORT);

});










