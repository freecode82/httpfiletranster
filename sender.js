const express = require("express");
const rp = require('request-promise');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer')();
const fs = require('fs');
const v4 = require('uuid');
const args = require('args-parser')(process.argv);
//const md5File = require('md5-file');
//const crypto = require('crypto');
//const FormData = require('form-data');
//const axios = require('axios');
//const posix = require('posix');
//posix.setrlimit('nofile',{soft:10000});

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

var host = 'http://192.168.79.7';
var port = 3001;
var fileName, fileSize, divSize, divUnit, fileCnt, extFileCnt, totalFileCnt;
var randomFileName = v4();
var totalPercent = 0;
var atOnce = false;

if (args.h) { usage(); process.exit(0); }

if (args.s) host = args.s;
if (args.p) port = args.p;

if (!args.f) {
    console.log("no file name");
    process.exit(1);
} else {
    fileName = args.f;
    fileSize = fs.statSync(fileName).size;
}

if (!args.n || !args.u) {
    console.log("The division unit and size of the file are not specified.");
    console.log("Send it all at once.");
    console.log("Depending on the network environment, code error 416 may occur.");
    console.log("If this occurs, split the file and send it.");
    
    atOnce = true;

} else {

    if(isNaN(args.n)) { 
		console.log("The n argument can only be numbers.");
		process.exit(1);
    } else { divSize = args.n; }

    if (args.u == "KB") divUnit = KB;
    else if (args.u == "MB") divUnit = MB;
    else if (args.g == "GB") divUnit = GB;
    else {
		console.log("The u argument can only be KB, MB, or GB.");
		process.exit(1);
    }


    fileCnt = parseInt(fileSize/(divSize * divUnit));
    extFileCnt = fileSize % (divSize * divUnit);

    if(extFileCnt == 0) {
    	totalFileCnt = fileCnt;
    } else {
		totalFileCnt = fileCnt + 1;
	}
}

console.log("========= Summary of file transfer information ========");
if (atOnce == false) {
    console.log("fileCnt: " + fileCnt + ", " + "extFileCnt: " + extFileCnt);
    console.log("totalFileCnt: " + totalFileCnt);
    console.log("transter random code: " + randomFileName);
}
console.log("fielName: " + fileName);
console.log("=======================================================");


app.use(bodyParser.json());

function usage() {
    console.log("usage: node sender.js -f=<filename> -p=<remote receiver port>");
    console.log("usage: node sender.js -f=<filenaem> -p=3002 -n=<divide file size> -u=<transter unit: KB, MB, GB>");
    console.log("multi transfer example: node sender.js -f=asourcefile -p=3002 -n=1 -u=MB");
    console.log("sing transper example: node sender.js -f=asourcefile -p=3002");
}


function sleep(sec) {
  return new Promise(resolve => setTimeout(resolve, sec * 1000));
}


async function uploadOnce() {
	transData = fs.createReadStream(fileName);

	let options = {
		url: host + ":" + port + "/onceUpload",
                method: 'POST',
                resolveWithFullResponse: true,
                formData: {
                        name: 'file',
                        file: { value: transData, options: fileName }
                }
        };

        try {
            let res = await rp(options);
			console.log(res.headers);
		} catch(e) {
			console.log(e);
		}
}


async function upload(fileOrder, totalFileCnt, start, end) {
	transData = fs.createReadStream(fileName, {start: start, end: end});
	//md5 = crypto.createHash('md5').update(JSON.stringify(transData), 'utf8').digest('hex');
	//console.log(md5);
	let options = {
		url: host + ":" + port + "/fileUpload2",
		method: 'POST',
		headers: {
                        //'Connection': 'keep-alive',
			customheader: 'multifile',
			customfilecnt: fileOrder + "/" + totalFileCnt,
			customfilesize: "file range=" + start + "-" + end + "/" + fileSize,
			customtmpname: randomFileName,
			//customchecksum: md5,
		},
		resolveWithFullResponse: true,
		formData: {
			name: 'file',
			file: { value: transData, options: randomFileName + "-" + fileOrder }
        }
	};

	try {
		let res = await rp(options);
		console.log(res.headers);
		totalPercent = totalPercent + 1;
		console.log("totalpercent =" + totalPercent);
		if(totalPercent == totalFileCnt) {
		    console.log("file transter finished");
		    let merge_options = {
					url: host + ":" + port + "/fileMerge",
                	method: 'POST',
                	headers: {
			    			//'Connection': 'keep-alive',
                            customheader: 'merge',
                            customfilecnt: totalFileCnt,
                            customfilesize: fileSize,
                            customtmpname: randomFileName,
                            customfilename: fileName,
                            //customchecksum: md5File.sync(fileName),
                	},
                	resolveWithFullResponse: true,
		    }
		
		    try {
				let res = await rp(merge_options);
				console.log("============== merge =============");
				console.log(res.body);
				//console.log(res.headers.customchecksum);
				//if(res.headers.customchecksum == merge_options.headers.customchecksum) console.log("file check good");
				//else console.log("file not match");
		    } catch(e) {
				console.log("merge error" + e);
		    }
        }
	} catch(e) {
		console.log(e);
	}
}


if (atOnce == false) {
    for(var i=1; i<=totalFileCnt; i++) {
	    if(i==1) {
	    	start = 0;
        } else {
	    	start = (i-1)*(divSize * divUnit);
        }

        if(i != totalFileCnt) {
	    	end = i*(divSize * divUnit) - 1;
        } else {
	    	end = fileSize -1;
        }
        console.log("file size start-end info: " + start + " - " + end);

        upload(i, totalFileCnt, start, end);
    }
} else { 
    uploadOnce(); 
}

