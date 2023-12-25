const express = require("express");
//const rp = require('request-promise');
const app = express();
const bodyParser = require('body-parser');
var multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');
const md5File = require('md5-file');

//const posix = require('posix');
//posix.setrlimit('nofile', { soft: 10000 });

var saveStorage = './upload';

storage = multer.diskStorage({
    destination: function (req, file, next) {
          next(null, saveStorage);
       },
       filename: function (req, file, next) {
          next(null, file.originalname);
       }
});


var upload = multer({ storage: storage });
var fUpload = upload.fields([{name: 'file'}]);

var upload2 = multer({dest: './upload2'});
var upload3 = multer({dest: './upload3', onError: function(err, next) {
		console.log('error', err);
		next(err);
	}
});
var upload4 = multer({ storage: storage, onError: function(err, next) {
                console.log('error', err);
                next(err);
        }
 });

var fUpload2 = upload4.fields([{name: 'file'}]);

function generateChecksum(str, algorithm, encoding) {
    return crypto.createHash(algorithm || 'md5').update(str, 'utf8').digest(encoding || 'hex');
}

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
} 


app.use(bodyParser.json());


app.post('/fileUpload',  fUpload2, function(req , res, next) {
    console.log(req.body);
    console.log(req.files);
    res.send("Form data saved!");
});


app.post('/fileUpload2',  function(req , res, next) {
    fUpload(req, res, function (err) {
    	console.log(req.body);
    	console.log(req.files);
        console.log(req.connection.remotePort);
        if (err) {
            console.log("An error occurred when uploading");
            console.log(err);
            res.send(err);
        }else{
	    if(req.headers.customheader == "multifile") {
		//originalname = req.headers.customfilename;
		fileCnt = req.headers.customfilecnt;
		checksumValue = req.headers.customchecksum;
		//fileSize = req.headers.customfilesize;
		fileprefix = req.headers.customtmpname;
		fileNum = fileCnt.split('/')[0];
		fileName = fileprefix + "-" + fileNum;
		console.log("file num: " + fileNum);
		console.log(saveStorage + "/" + fileName);
		//fs.readFile(saveStorage + "/" + fileName, function(err, data) {
		//    var checksum = generateChecksum(data);
		//    console.log(checksum);
		//});
                //console.log(md5File.sync(saveStorage + "/" + fileName));
                //res.set('customchecksum', md5File.sync(saveStorage + "/" + fileName));
		res.set('customfilecnt', fileCnt);
		res.set('customtmpname', fileprefix);
            	res.send("Formdata saved!");
                console.log("upload finished: " + fileCnt);
	    }
        }
    });
});


async function merge(cnt, fileName, randomName) {
    	var CombinedStream = require('combined-stream2');
    	var combinedStream = CombinedStream.create();
    	for(var i=1; i<=cnt; i++) {
            combinedStream.append(fs.createReadStream(saveStorage + "/" + randomName + "-" + i));
    	}
    	await combinedStream.pipe(fs.createWriteStream(saveStorage + "/" + fileName));
} 

/*
async function merge(cnt, fileName, randomName) {
    return new Promise(function(resolve, reject) {
    	var CombinedStream = require('combined-stream2');
    	var combinedStream = CombinedStream.create();
    	for(var i=1; i<=cnt; i++) {
            combinedStream.append(fs.createReadStream(saveStorage + "/" + randomName + "-" + i));
    	}
        combinedStream.pipe(fs.createWriteStream(saveStorage + "/" + fileName));
    	resolve();
    })
}*/

app.post('/fileMerge', function(req , res, next) {
    console.log(req.headers);

    var fileCnt = req.headers.customfilecnt;
    var fileName = req.headers.customfilename;
    var randomName = req.headers.customtmpname;
    var fileSize = req.headers.customfilesize;

    async function app() {
    	await merge(fileCnt, fileName, randomName);
	await sleep(2);
        //checksum = md5File.sync(saveStorage + "/" + fileName);
	//console.log("internal checksum: " + checksum);
        //res.set('customchecksum', checksum);
        res.send('merge end').end();

        for(var i=1; i<=fileCnt; i++) {
            filefullname = saveStorage + "/" + randomName + "-" + i;
            //console.log(filefullname);
            try {
                fs.unlinkSync(filefullname);
            } catch(err) {
                console.log("file delete err: " + filefullname + " of " + fileName + " err log: " + err);
            }
        }
    }

    app();
});


app.post('/fileUpload3',  upload2.single('file'), function(req , res) {
    console.log(req.body);
    console.log(req.file);
    //res.send('file upload success');
    //res.end();
    // Error handling
    res.status(204).end();
});

app.post('/fileUpload4',  upload3.single('file'), function(req , res) {
    console.log(req.body);
    console.log(req.file);
    res.status(204).end();
});

const server = app.listen(3001, function () {
    console.log('Server listening on port 3001');
});
