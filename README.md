# httpfiletranster

[root@srvr1 httpsender]# cat sender2.js 
const express = require("express");
const rp = require('request-promise');
const app = express();
const bodyParser = require('body-parser');
var multer = require('multer')();
const FormData = require('form-data');
const axios = require('axios');
const fs = require('fs');

app.use(bodyParser.json());

console.log(process.argv[2]);
let pas = process.argv[2];


async function upload() {
	let options = {
		url: 'http://localhost:3001/fileUpload3',
		method: 'POST',
		formData: {
			name: 'file',
			file: { value: fs.createReadStream(process.argv[2]), options: process.argv[2] }
        	}
	};

	try {
		let res = await rp(options);
		console.log(res);
	} catch(e) {
		console.log(e);
	}
}

app.post('/fileUpload',  multer.single('fileFieldName'), (req , res) => {
    const fileRecievedFromClient = req.file; //File Object sent in 'fileFieldName' field in multipart/form-data
    console.log(req.file)

/*  let form = new FormData();
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
*/
})


//const server = app.listen(3002, function () {
//    console.log('Server listening on port 3002');
//});

upload();

[root@srvr1 httpsender]# cat sender.js 
const express = require("express");
//const rp = require('request-promise');
const app = express();
const bodyParser = require('body-parser');
var multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

var upload2 = multer({dest: './upload2'});
var upload3 = multer({dest: './upload3', onError: function(err, next) {
		console.log('error', err);
		next(err);
	}
});


storage = multer.diskStorage({
    destination: function (req, file, next) {
          next(null, './uploads');
       },
       filename: function (req, file, next) {
          next(null, file.originalname);
       }
    });
upload = multer({ storage: storage });
fUpload = upload.fields([{name: 'file'}]);

app.use(bodyParser.json());



app.post('/fileUpload',  fUpload, function(req , res, next) {
    console.log(req.body);
    console.log(req.files);

    // Error handling
    fUpload(req, res, function (err) {
        if (err) {
            console.log("An error occurred when uploading");
        }else{
            res.send("Form data saved!");
        }
    });
});


//correct
app.post('/fileUpload2',  function(req , res, next) {
    console.log(req.body);
    console.log(req.files);
    //error handling
    fUpload(req, res, function (err) {
        if (err) {
            console.log("An error occurred when uploading");
            console.log(err);
        }else{
            res.send("Form data saved!");
        }
    });
});

//correct
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
[root@srvr1 httpsender]# 

Connecting to 192.168.79.7:22...
Connection established.
To escape to local shell, press 'Ctrl+Alt+]'.

Last login: Tue Dec 19 00:08:14 2023 from 192.168.79.1
[root@srvr1 ~]# cd httpsender/
[root@srvr1 httpsender]# ls
sender.js  sender2.js  tomcat-connectors-1.2.43-src.tar.gz  upload2  upload3  uploads
[root@srvr1 httpsender]# cd upload3/
[root@srvr1 upload3]# ls
935e294f3c17bc9e126081019f0ad3b6
[root@srvr1 upload3]# ll
합계 3168
-rw-r--r--. 1 root root 3242555 12월 19 01:10 935e294f3c17bc9e126081019f0ad3b6
[root@srvr1 upload3]# cd ..
[root@srvr1 httpsender]# ls
sender.js  sender2.js  tomcat-connectors-1.2.43-src.tar.gz  upload2  upload3  uploads
[root@srvr1 httpsender]# cd upload2
[root@srvr1 upload2]# sl
bash: sl: 명령을 찾을 수 없습니다...
유사한 명령: 'ls'
[root@srvr1 upload2]# ll
합계 0
[root@srvr1 upload2]# ls
[root@srvr1 upload2]# ll
합계 3168
-rw-r--r--. 1 root root 3242555 12월 19 01:11 c0c83993c12eaf348d4258feba7c0fb0
[root@srvr1 upload2]# 
