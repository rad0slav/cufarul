var express = require ('express');
var app = express();
var path = require('path');
var fs = require('fs');
var port = process.env.PORT || 3000;

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
