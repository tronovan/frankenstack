
//CRUD OPERATIONS//

var 	fs = require('fs'),
	db = [],
	idCounter = 1,
	dbFilename = "data.json";

//CREATE//
exports.dbCreate = function(record){
	//console.log('----------------DB CREATE --------------');
        record.id = idCounter++;
        db.push(record);
};


//READ//
exports.dbRead = function(uuidToSearch){
	//console.log('----------------DB READ --------------');
        for(var i=0; i < db.length; i++){
                if(db[i].uuid === uuidToSearch){
                        return db[i];
                }
        }
};

//UPDATE//
exports.dbUpdate = function(nameToSearch, newRecord){
	console.log('----------------DB UPDATE --------------' + nameToSearch + " " + newRecord);
        for(var i=0; i < db.length; i++){
                if(db[i].name === nameToSearch){
                        db[i] = newRecord;
                }
        }
};

//UPDATE NEW IP
exports.dbUpdateNewIp = function(ip){
	//console.log('----------------DB UPDATE IP --------------');
        for(var i=0; i < db.length; i++){
                if(db[i].ip == "none"){
                        db[i].ip = ip;
			console.log("IP - Updated");
                }
        }
};

//DELETE//
exports.dbDelete = function(uuidToSearch){
	//console.log('----------------DB DELETE --------------');
        for(var i=0; i < db.length; i++){
                if(db[i].uuid === uuidToSearch){
                	if(i != -1) {
				db.splice(i, 1);
			}	
                }
        }
};

//PRINT ALL//
exports.all = function(){
	//console.log('----------------DB ALL-------------');

	return db;
};

//SAVE TO DISK//
	
exports.dbSaveToDisk = function(){
	//console.log('----------------DB SAVE TO DISK-------------');
	fs.writeFile(dbFilename, JSON.stringify(db), function(err){
		if(err){
			return console.log("The following error occurred" + err);
		}
	});	
};

//READ FROM DISK//
exports.dbReadFromDisk = function(){
	db = JSON.parse(fs.readFileSync(dbFilename, 'utf8'));
	//find the highest id and set idCounter
	for(var i=0; i<db.length; i++){
		if(db[i].id > idCounter){
			idCounter=db[i].id+1;
		}	
	}
};

exports.dbConnect = function(filename){
	dbFilename = filename;
	exports.dbReadFromDisk();
	setInterval(function(){ exports.dbSaveToDisk(dbFilename); }, 30000);
};
