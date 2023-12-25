const express = require("express");
const rp = require('request-promise');
const app = express();
const bodyParser = require('body-parser');
var multer = require('multer')();
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');
const v4 = require('uuid');
const md5File = require('md5-file');
const crypto = require('crypto');

app.use(bodyParser.json());

var fileName = process.argv[2]
var fileSize = fs.statSync(fileName).size;
var divSize = process.argv[3];
var divUnit = process.argv[4];
var divCustom = process.argv[5];

const KB = 1024;
const MB = KB * 1024;
const GB = MB * 1024;

var fileCnt = parseInt(fileSize/KB);
console.log(fileCnt);
var extFileCnt = fileSize % KB;
console.log(extFileCnt);

var totalFileCnt;

if(extFileCnt == 0) {
	totalFileCnt = fileCnt;
} else {
	totalFileCnt = fileCnt + 1;
}

var fileOrder = 1;
var randomFileName = v4();


console.log(process.argv[2]);
console.log(totalFileCnt);
console.log(randomFileName);

var totalPercent = 0;


async function upload(fileOrder, totalFileCnt, start, end) {
	transData = fs.createReadStream(fileName, {start: start, end: end});
	md5 = crypto.createHash('md5').update(JSON.stringify(transData), 'utf8').digest('hex');
	console.log(md5);
	let options = {
		url: 'http://localhost:3001/fileUpload2',
		method: 'POST',
		headers: {
			customheader: 'multifile',
			customfilecnt: fileOrder + "/" + totalFileCnt,
			customfilesize: "file range=" + start + "-" + end + "/" + fileSize,
			customtmpname: randomFileName,
			customchecksum: md5,
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
			url: 'http://localhost:3001/fileMerge',
                	method: 'POST',
                	headers: {
                            customheader: 'merge',
                            customfilecnt: totalFileCnt,
                            customfilesize: fileSize,
                            customtmpname: randomFileName,
                            customfilename: fileName,
                            customchecksum: md5File.sync(fileName),
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

/*
app.post('/fileUpload',  multer.single('fileFieldName'), (req , res) => {
    const fileRecievedFromClient = req.file; //File Object sent in 'fileFieldName' field in multipart/form-data
    console.log(req.file)

  let form = new FormData();
    form.append('fileFieldName', fileRecievedFromClient.buffer, fileRecievedFromClient.originalname);

    axios.post('http://server2url/fileUploadToServer2', form, {
        headers: {
            'Content-Type': `multipart/form-data; boundary=${form._boundary}`
        }
    }).then((responseFromServer2) => {
        res.send("SUCCESS")
    }).catch((err) => {
        res.send("ERROR")
    })

})


const server = app.listen(3002, function () {
    console.log('Server listening on port 3002');
});
*/

for(var i=1; i<=totalFileCnt; i++) {
    if(i==1) {
	start = 0;
    } else {
	start = (i-1)*KB;
    }
    console.log(start);

    if(i != totalFileCnt) {
	end = i*KB -1;
    } else {
	end = fileSize -1;
    }
    console.log(end);

    upload(i, totalFileCnt, start, end);
}
