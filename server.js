var express = require ('express');
var app = express();
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var mongodbUri = process.env.MONGOLAB_URI;

mongoose.connect(mongodbUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use('/lib', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function(){
    console.log('listening on '+port+'...');
});

app.get('/events', function(request, response){
    var events = [];
    fs.readFile('events.json', function(error, result){
        if(result){
            result = JSON.parse(result);
            events = result.events;
            response.send(events);
        } else{
            response.end();
        }
    });
});



db.once('open', function callback () {
    console.log('opened');
    // Create song schema
    var songSchema = mongoose.Schema({
        decade: String,
        artist: String,
        song: String,
        weeksAtOne: Number
    });

    // Store song documents in a collection called "songs"
    var Song = mongoose.model('songs', songSchema);

    // Create seed data
    var seventies = new Song({
        decade: '1970s',
        artist: 'Debby Boone',
        song: 'You Light Up My Life',
        weeksAtOne: 10
    });

    var eighties = new Song({
        decade: '1980s',
        artist: 'Olivia Newton-John',
        song: 'Physical',
        weeksAtOne: 10
    });

    var nineties = new Song({
        decade: '1990s',
        artist: 'Mariah Carey',
        song: 'One Sweet Day',
        weeksAtOne: 16
    });

    /*
     * First we'll add a few songs. Nothing is required to create the
     * songs collection; it is created automatically when we insert.
     */
    seventies.save();
    eighties.save();
    nineties.save();

    /*
     * Then we need to give Boyz II Men credit for their contribution
     * to the hit "One Sweet Day".
     */
    Song.update({ song: 'One Sweet Day'}, { $set: { artist: 'Mariah Carey ft. Boyz II Men'} },
        function (err, numberAffected, raw) {

            if (err) return handleError(err);

            /*
             * Finally we run a query which returns all the hits that spend 10 or
             * more weeks at number 1.
             */
            Song.find({ weeksAtOne: { $gte: 10} }).sort({ decade: 1}).exec(function (err, docs){

                if(err) throw err;

                docs.forEach(function (doc) {
                    console.log(
                        'In the ' + doc['decade'] + ', ' + doc['song'] + ' by ' + doc['artist'] +
                        ' topped the charts for ' + doc['weeksAtOne'] + ' straight weeks.'
                    );
                });

                // Since this is an example, we'll clean up after ourselves.
                mongoose.connection.db.collection('songs').drop(function (err) {
                    if(err) throw err;

                    // Only close the connection when your app is terminating
                    mongoose.connection.db.close(function (err) {
                        if(err) throw err;
                    });
                });
            });
        }
    )
});
