var MongoClient = require('mongodb').MongoClient,
    GridStore = require('mongodb').GridStore,
    ObjectID = require('mongodb').ObjectID,
    Db = null;

//use the same database by default - sails.js
var mongoConfig = sails.config.adapters.mongo;

if(mongoConfig.user !== 'undefined' && mongoConfig.user != null && mongoConfig.user != "" && mongoConfig.password !== 'undefined' && mongoConfig.password != null && mongoConfig.password != "" ) {
    MongoClient.connect("mongodb://" + mongoConfig.user + ":" + mongoConfig.password + "@" + mongoConfig.host + ":"+mongoConfig.port + "/" + mongoConfig.database, function(err, database) {
          if(err) throw err;
          Db = database;
    });
} else {
    MongoClient.connect("mongodb://" + mongoConfig.host + ":" + mongoConfig.port + "/" + mongoConfig.database, function(err, database) {
          if(err) throw err;
          Db = database;
    });
}

module.exports = {

    setConfig: function(config) {
        mongoConfig = config;
    },

    test: function() {
        var accountCollection = Db.collection('account');
        accountCollection.find().each(function(err, account) {
                if(account != null) {
                    console.log("ACCOUNT: " + account.name);
                } else {
                }
        });
    },
    readFile: function(filename, callback) {
        GridStore.read(Db, filename, function(err, data) {
          console.log(data.toString());
          if(callback != null) callback();
        });
    },
    readDumpFile: function(filename, callback) {
          GridStore.read(Db, filename, function(err, data) {
            console.log(data);
            if(callback != null) callback();
          });
    },
    getFileOld: function(callback,id) {
        var gs = new GridStore(Db,new ObjectID(id), 'r');
        gs.open(function(err,gs){
            gs.read(callback);
        });
    },
    getFile: function(id, callback) {
        var gs = new GridStore(Db,new ObjectID(id), 'r');
        var content, contentType;

        gs.open(function(err,gs){
            gs.read(function(err, content){
                callback(content, gs.contentType, gs.filename, gs.length)
            });
        });
    },
    putFile: function(path, filename, contentType, callback) {

        var fileId = new ObjectID();
        var gs = new GridStore(Db, fileId, filename,'w', {content_type: contentType});

        gs.open(function(err,gs){
            gs.writeFile(path, function(err, doc) {
                callback(doc.fileId, doc.contentType, doc.filename, doc.length)
            });
        });
    }

}
