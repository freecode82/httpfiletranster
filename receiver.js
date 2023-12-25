const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const CombinedStream = require('combined-stream2');
const crypto = require('crypto');
const args = require('args-parser')(process.argv);
//const rp = require('request-promise');
//const FormData = require('form-data');
//const crypto = require('crypto');
//const md5File = require('md5-file');
//const posix = require('posix');
//posix.setrlimit('nofile', { soft: 10000 });

if (args.h) { usage(); process.exit(0); }

var saveStorage = './upload';
var port = 3001;

if (args.s) saveStorage = args.s;
if (args.p) port = args.p;

fs.access(saveStorage, error => {
  if (error) {
      console.log(error.message);
      if (error.code === 'ENOENT') {
          console.log('The directory does not exist');
          fs.mkdirSync(saveStorage, {recursive: true});
      }
  } else {
      console.log('The directory exists');
  }
});


storage = multer.diskStorage({
    destination: function (req, file, next) {
          next(null, saveStorage);
       },
       filename: function (req, file, next) {
          next(null, file.originalname);
       }
});

var upload = multer({ storage: storage });
var upload2 = multer({ storage: storage, onError: function(err, next) {
                console.log('error', err);
                next(err);
        }
});

var fUpload = upload.fields([{name: 'file'}]);
var fUpload2 = upload2.fields([{name: 'file'}]);


function usage() {
    console.log("usage: node receiver.js -s=<upload folder name, default upload> -p=<server port, default 3001>");
    console.log("usage example: node receiver.js -s=upload2 -p=3002");
    console.log("usage example: node receiver.js");
    console.log("above default upload folder name is upload, default port 3001");
}

function generateChecksum(str, algorithm, encoding) {
    return crypto.createHash(algorithm || 'md5').update(str, 'utf8').digest(encoding || 'hex');
}

function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
} 


async function merge(cnt, fileName, randomName) {
    	var combinedStream = CombinedStream.create();
    	for(var i=1; i<=cnt; i++) {
            combinedStream.append(fs.createReadStream(saveStorage + "/" + randomName + "-" + i));
    	}
    	await combinedStream.pipe(fs.createWriteStream(saveStorage + "/" + fileName));
} 

app.use(bodyParser.json());


app.post('/onceUpload',  fUpload, function(req , res, next) {
    console.log(req.body);
    console.log(req.files);
    res.send("file saved!");
});


app.post('/fileUpload2',  function(req , res, next) {
    fUpload(req, res, function (err) {
    	console.log(req.headers);
    	console.log(req.files);
        console.log(req.connection.remotePort);
        if (err) {
            console.log("An error occurred when uploading");
            console.log(err);
            res.send(err);
        }else{
	    if(req.headers.customheader == "multifile") {
		fileCnt = req.headers.customfilecnt;
		checksumValue = req.headers.customchecksum;
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

const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});
