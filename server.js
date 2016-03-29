var express = require ('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.use('/lib', express.static(__dirname + '/node_modules/'));
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, function(){
    console.log('listening on 3000...');
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
