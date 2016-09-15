var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    exec = require('child_process').exec,
    fs = require('fs'),
    db = require('./arraydb'),
    hostsDb = require('./hostsdb'),
    child_process = require('child_process'),
    tempObject = {};
console.log('connecting to db...');
db.dbConnect('data.json');
hostsDb.dbConnect('hosts.json');
app.use(express.static('./public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/addhardware', function(req, res) {
    hostsDb.dbCreate({
        "hostname": req.body.hostname,
        "ip": req.body.ip,
        "mac": req.body.mac,
        "cores": req.body.cores,
        "ram": req.body.ram,
	"alive": false
    });
    res.send('done');

});
app.post('/resetvm/', function(req, res) {
    var host = db.dbRead(req.params.uuid).host;

    var theCommand = 'ssh ' + host + ' vboxmanage controlvm ' + req.body.vm + ' reset';

    console.log(theCommand);
    exec(theCommand, function(error, stdout, stderr) {
        console.log('done resetting...');
    });
});

app.post('/startvm/', function(req, res) {
    tempObject.name = req.body.vm;
    tempObject.host = req.body.host;
    tempObject.template = req.body.os;
    tempObject.ip = "none";

    res.send('<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="../style.css"></head><body><ul><li><a href="/">Home</a></li><li><a href="/start" class="active">Start a VM</a></li><li><a href="/runningvms">Manage VMs</a></li><li><a href="http://tronovan.servebeer.com">Network</a></li><li style="float:right"><a href="/help.html">Help</a></li></ul><h1>Working...</h1></body></html>');

    var theCommand = 'ssh ' + tempObject.host + ' /home/dono/.scripts/cloneVM.sh ' + req.body.vm + " " + req.body.os + ";ssh " + tempObject.host + " vboxmanage showvminfo " + req.body.vm + " | grep UUID: | head -1 | awk '{print $2}' > /home/dono/frankenstack/ips/tempip.txt";

    console.log(theCommand);

    exec(theCommand, function(error, stdout, stderr) {
        console.log('done running clone VM...');
        fs.readFile('ips/tempip.txt', {
            encoding: 'utf-8'
        }, function(err, data) {
            if (!err) {

            } else {
                console.log(err);
            }

        });
    });

});

app.post('/anounce', function(req, res) {
    tempObject.ip = req.body.ip;
    res.send(tempObject.name);
    console.log('--name--' + tempObject.name);
    fs.readFile('/home/dono/frankenstack/ips/tempip.txt', 'utf8', function(err, contents) {
        console.log("uuid --> " + contents);
        tempObject.uuid = contents.trim();

        console.log('creating object in db ...' + tempObject.uuid);

        db.dbCreate({
            "ip": tempObject.ip,
            "name": tempObject.name,
            "uuid": tempObject.uuid,
            "host": tempObject.host,
            "template": tempObject.template
        });
    });


    console.log("anounce received..." + req.body.ip);
});

app.get('/runningvms/', function(req, res) {

    var theCommand = 'vboxmanage list runningvms > temp.txt';
    exec(theCommand, function(error, stdout, stderr) {
        console.log('done getting running vms.');

        fs.readFile('temp.txt', {
            encoding: 'utf-8'
        }, function(err, data) {
            if (!err) {
                var HTML = '<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="style.css"></head><body><ul><li><a href="/">Home</a></li><li><a href="/start">Start a VM</a></li><li><a class="active" href="/runningvms">Manage VMs</a></li><li><a href="http://tronovan.servebeer.com">Network</a></li><li style="float:right"><a href="/help.html">Help</a></li></ul><h1><center>Manage VMs</center></h1><center><table width=\'96%\'"><tr><th>name</th><th>ip</th><th>host</th><th>template</th><th>uuid</th><th>commands</th></tr><tr>';

                var temp = "";
                for (var i = 0; i < db.all().length; i++) {
                    temp = temp + "<td>" + db.all()[i].name + "</td>"
                    temp = temp + "<td>" + db.all()[i].ip + "</td>"
                    temp = temp + "<td>" + db.all()[i].host + "</td>"

var templateName ="";
switch(db.all()[i].template){
case "f8abbb6b-0e43-4b26-be0a-741923cda6a0" :
	templateName="CentOS7";
	break;
case "69b9d1ac-4f79-4856-9e9c-de3b12c2c6b3":
	templateName="Ubuntu16";
	break;
case "b9dbce55-4caa-4c92-a07d-66a91fff8ce0":
	templateName="Turnkey";
	break;
case "3715454d-5eae-456b-a866-5971d1cc127a":
	templateName="Debian";
	break;
}




                    temp = temp + "<td>" + templateName + "</td>"
                    temp = temp + "<td>" + "<a href='/probe/" + db.all()[i].uuid + "'> " + db.all()[i].uuid + "</a></td><td><button type='button' onclick=\"if (confirm('Are you sure you want to permanently delete "+db.all()[i].name +"?')){window.location.href='/killvm/" + db.all()[i].uuid + "'}\">kill</button><button type='button' onclick=window.location.href='/startvm/" + db.all()[i].uuid + "'>start</button><button type='button' onclick=\"if (confirm('Are you sure?')){window.location.href='/stopvm/" + db.all()[i].uuid + "'}\">stop</button></td></tr>"
                }

                HTML = HTML + temp + '</table></center></body></html>';
                res.send(HTML);
            } else {
                console.log(err);
            }

        });

    });
});

app.get('/vms/', function(req, res) {

    var theCommand = 'vboxmanage list vms > temp.txt';

    exec(theCommand, function callback(error, stdout, stderr) {
        console.log('done listing vms.');

        fs.readFile('temp.txt', {
            encoding: 'utf-8'
        }, function(err, data) {
            if (!err) {
                res.send(data);
            } else {
                console.log(err);
            }

        });

    });
});
app.get('/wol/:mac/', function(req, res) {
    exec('wakeonlan ' + req.params.mac, function(error, stdout, stderr) {
        console.log('tried to wake...' + req.params.mac);
        res.send('tried');
    });
});
app.get('/startvm/:uuid/', function(req,res){
	var host = db.dbRead(req.params.uuid).host;
	var theCommand = 'ssh ' + host + ' sh /home/dono/.scripts/startvm ' + req.params.uuid;
	console.log(theCommand);
	exec(theCommand, function(error, stdout, stderr){
		res.send('start vm ' + req.params.uuid);
	});
});
app.get('/stopvm/:uuid/', function(req,res){
	var host = db.dbRead(req.params.uuid).host;
	var theCommand = 'ssh ' + host + ' sh /home/dono/.scripts/stopvm ' + req.params.uuid;
	console.log(theCommand);
	exec(theCommand, function(error, stdout, stderr){
		res.send('stop vm ' + req.params.uuid);
	});
});
app.get('/killvm/:uuid/', function(req, res) {
    var host = db.dbRead(req.params.uuid).host;
    console.log("--------------------" + host + "-----------------------");
    var theCommand = 'ssh ' + host + ' sh /home/dono/.scripts/killvm ' + req.params.uuid;
    console.log(theCommand);
    exec(theCommand, function(error, stdout, stderr) {
        res.send('<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="../style.css"></head><body><ul><li><a href="/">Home</a></li><li><a href="/start">Start a VM</a></li><li><a class="active" href="/runningvms">Manage VMs</a></li><li><a href="http://tronovan.servebeer.com">Network</a></li><li style="float:right"><a href="/help.html">Help</a></li></ul><h1>Deleted VM: ' + req.params.uuid + '</h1></body></html>');
    });
    db.dbDelete(req.params.uuid);
});

app.get('/stopvm/:uuid/', function(req, res) {
    var host = db.dbRead(req.params.uuid).host;

    exec('ssh ' + host + ' sh /home/dono/.scripts/stopvm ' + req.params.uuid, function(error, stdout, stderr) {
        res.send('<html>done</html>');
    });
});
app.get('/', function(req, res) {
testall();
    var htmlstart = '<html><head><link rel="stylesheet" type="text/css" href="style.css"></head><body><ul><li><a class="active" href="#">Home</a></li><li><a href="/start">Start a VM</a></li><li><a href="/runningvms">Manage VMs</a></li><li><a href="http://tronovan.servebeer.com">Network</a></li><li style="float:right"><a href="/help.html">Help</a></li></ul><br><center><img src="frankenstack.svg" width="700"><br><table width = "50%"><tr><th>hostname</th><th>alive</th><th>ip</th><th>mac</th><th>cores</th><th>ram</th><th>Wake On LAN</th></tr>'

    var htmlend = '</table><br><br><br><input type="submit" onclick="window.location.href=\'/hardware.html\'" value="Add More Hardware Servers"></center></body></html>';

    //var wol = function(mac){
    //    exec('wakeonlan ' + mac, function (error, stdout, stderr) {
    //        console.log('tried to wake...' + mac);
    //	res.send('tried');
    //    });
    //};
    var htmltable = ""
    for (var i = 0; i < hostsDb.all().length; i++) {
        htmltable = htmltable + "<tr><td>" + hostsDb.all()[i].hostname + "</td>"
        htmltable = htmltable + "<td>" + hostsDb.all()[i].alive + "</td>"
        htmltable = htmltable + "<td>" + hostsDb.all()[i].ip + "</td>"
        htmltable = htmltable + "<td>" + hostsDb.all()[i].mac + "</td>"
        htmltable = htmltable + "<td>" + hostsDb.all()[i].cores + "</td>"
        htmltable = htmltable + "<td>" + hostsDb.all()[i].ram + "</td><td><button type='button'  onclick=window.location.href='/wol/" + hostsDb.all()[i].mac + "'>WOL</button></td></tr>"

    }
    res.send(htmlstart + htmltable + htmlend);

});
app.get('/probe/:uuid/', function(req, res) {
    var host = db.dbRead(req.params.uuid).host;

    exec('ssh ' + host + ' vboxmanage showvminfo ' + req.params.uuid + ' > showinfo.txt', function callback(error, stdout, stderr) {

        fs.readFile('showinfo.txt', {
            encoding: 'utf-8'
        }, function(err, data) {
            if (!err) {

                var HTML = '<!DOCTYPE html><html><head></script><link rel="stylesheet" type="text/css" href="../style.css"></head><body><ul><li><a href="/">Home</a></li><li><a href="/start">Start a VM</a></li><li><a class="active" href="/runningvms">Manage VMs</a></li><li><a href="http://tronovan.servebeer.com">Network</a></li><li style="float:right"><a href="/help.html">Help</a></li></ul> <br>clone, snapshot, delete, stop, reboot, group<br><pre>';

                HTML = HTML + data + '</pre></body></html>';
                res.send(HTML);

            } else {
                console.log(err);
            }

        });

    });
});
app.get('/start', function(req, res) {
    var html_start = '<!DOCTYPE html><html><head><link rel="stylesheet" type="text/css" href="style.css"></head><body><ul><li><a href="/">Home</a></li><li><a class="active" href="/start">Start a VM</a></li><li><a href="/runningvms">Manage VMs</a></li><li><a href="http://tronovan.servebeer.com">Network</a></li><li style="float:right"><a href="/help.html">Help</a></li></ul><br><center><h1>Start VM</h1><form action="/startvm/" method="post"><table class="formtable"><tr><td>Enter a name for your VM</td><td><input type="text" name="vm"></td></tr><tr><td>select os image</td><td><select name="os"><option value="3715454d-5eae-456b-a866-5971d1cc127a">Debian</option><option value="69b9d1ac-4f79-4856-9e9c-de3b12c2c6b3">Ubuntu 16</option><option value="b9dbce55-4caa-4c92-a07d-66a91fff8ce0">Turnkey</option><option value="f8abbb6b-0e43-4b26-be0a-741923cda6a0">CentOS7</option></select></td></tr><tr><td>select host</td><td><select name="host">'

    var html_middle = "";
    for (var i = 0; i < hostsDb.all().length; i++) {
        html_middle = html_middle + '<option value="' + hostsDb.all()[i].hostname + '">' + hostsDb.all()[i].hostname + '</option>';
    }
    var html_end = '</select></td></tr><tr><td>press submit</td><td><input type="submit" value="Start VM"></td></tr></table></form></center></body></html>'

    res.send(html_start + html_middle + html_end);
});
function testall(){
var theCommand="";
var tempObject = {}
for (var i = 0 ; i < hostsDb.all().length; i++){
tempObject=hostsDb.all()[i];
//theCommand="ssh " + hostsDb.all()[i].hostname + " uptime";
theCommand="ssh " + tempObject.hostname + " uptime";
console.log(theCommand);
try{
	var checkUptime = child_process.execSync(theCommand);
	process.stdout.write(checkUptime);
	tempObject.alive=true;
        hostsDb.dbUpdate(tempObject.hostname, tempObject);
	console.log('true ' + tempObject.hostname);
} catch(err) {
	tempObject.alive=false;
	hostsDb.dbUpdate(tempObject.hostname, tempObject);
        console.log('false ' + tempObject.hostname);
}
}

};
app.listen(3000);
console.log('starting server on port 3000...');
