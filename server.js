"use strict";
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 5000;
var mongoose = require('mongoose');
var mongodbUri = process.env.MONGOLAB_URI;

mongoose.connect(mongodbUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.use('/lib', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, function () {
    console.log('listening on ' + port + '...');
});

var events = [];
fs.readFile('events.json', function (error, result) {
    if (result) {
        result = JSON.parse(result);
        events = result.events;
    }
});

app.get('/events', function (request, response) {
    if (events) {
        response.send(events);
    } else {
        response.end();
    }
});


db.on('open', function callback() {
    console.log('db connection opened');
    function addEvents() {
        var eventsCollection = {};
        var exists = false;
        db.db.listCollections().toArray(function (error, names) {
            if (error) {
                console.log('Error: ' + error);
            } else {
                eventsCollection = names.filter(function (obj) {
                    return obj.name === 'events'
                });
                console.log(eventsCollection);
                if(addFileEvents.length === 0){
                    addCollection();
                    console.log('added');
                } else {
                    console.log('already exists');
                }
            }
        });
        return exists;
    }

    function addFileEvents() {
        var eventSchema = mongoose.Schema({
            "venueId": String,
            "venueName": String,
            "venueCoverPicture": String,
            "venueProfilePicture": String,
            "venueLocation": {
                "city": String,
                "country": String,
                "latitude": Number,
                "longitude": Number,
                "street": String,
                "zip": String
            },
            "eventId": String,
            "eventName": String,
            "eventCoverPicture": String,
            "eventProfilePicture": String,
            "eventDescription": String,
            "eventStarttime": String,
            "eventDistance": String,
            "eventTimeFromNow": Number,
            "eventStats": {
                "attendingCount": Number,
                "declinedCount": Number,
                "maybeCount": Number,
                "noreplyCount": Number
            }
        });
        // Store Event documents in a collection called "events"
        var Event = mongoose.model('events', eventSchema);
        var currentEvent = {};
        events.forEach(function writeToDb(event) {
            currentEvent = new Event(event);
            currentEvent.save();
        });
    }

    addEvents();
});

