# httpfiletransfer


## This is a program that transmits files remotely by loading file data in the body of the http request.

### usage
#### receiver.js is a program that receives files.

usage: node receiver.js -s=< upload folder name, default upload > -p=< server port, default 3001 >  
usage example: node receiver.js -s=upload2 -p=3002  
usage example: node receiver.js  
above default upload folder name is upload, default port 3001  

#### sender.js is a program that transmits files.

usage: node sender.js -f=< filename > -p=< remote receiver port >  
usage: node sender.js -f=< filenaem > -p=3002 -n=< divide file size > -u=< transter unit: KB, MB, GB >  
multi transfer example: node sender.js -f=asourcefile -p=3002 -n=1 -u=MB  
sing transper example: node sender.js -f=asourcefile -p=3002  
example: node sender.js -s=< http://your dns or ip > -f=< filename > -p=< port >  


```
<Example of split file transfer>
[root@localhost httpsender]# node sender.js -f=asourcefile -p=3002 -n=1 -u=MB
========= Summary of file transfer information ========
fileCnt: 2, extFileCnt: 270224
totalFileCnt: 3
transter random code: 18417c78-b491-4320-ab2c-23557b8ab6c9
fielName: asourcefile
=======================================================
file size start-end info: 0 - 1048575
file size start-end info: 1048576 - 2097151
file size start-end info: 2097152 - 2367375
{
  'x-powered-by': 'Express',
  customfilecnt: '3/3',
  customtmpname: '18417c78-b491-4320-ab2c-23557b8ab6c9',
  'content-type': 'text/html; charset=utf-8',
  'content-length': '15',
  etag: 'W/"f-vAoHieN5kHpvK8tuNOK1i3/oVKE"',
  date: 'Mon, 25 Dec 2023 11:23:37 GMT',
  connection: 'close'
}
totalpercent =1
{
  'x-powered-by': 'Express',
  customfilecnt: '1/3',
  customtmpname: '18417c78-b491-4320-ab2c-23557b8ab6c9',
  'content-type': 'text/html; charset=utf-8',
  'content-length': '15',
  etag: 'W/"f-vAoHieN5kHpvK8tuNOK1i3/oVKE"',
  date: 'Mon, 25 Dec 2023 11:23:37 GMT',
  connection: 'close'
}
totalpercent =2
{
  'x-powered-by': 'Express',
  customfilecnt: '2/3',
  customtmpname: '18417c78-b491-4320-ab2c-23557b8ab6c9',
  'content-type': 'text/html; charset=utf-8',
  'content-length': '15',
  etag: 'W/"f-vAoHieN5kHpvK8tuNOK1i3/oVKE"',
  date: 'Mon, 25 Dec 2023 11:23:37 GMT',
  connection: 'close'
}
totalpercent =3
file transter finished
============== merge =============
merge end
[root@localhost httpsender]#

<Example of transfer without splitting>
[root@localhost httpsender]# node sender.js -f=asourcefile -p=3002
The division unit and size of the file are not specified.
Send it all at once.
Depending on the network environment, code error 416 may occur.
If this occurs, split the file and send it.
========= Summary of file transfer information ========
fielName: asourcefile
=======================================================
{
  'x-powered-by': 'Express',
  'content-type': 'text/html; charset=utf-8',
  'content-length': '11',
  etag: 'W/"b-p+z/i5NHvsnyKsSqZVV3kUgDT+4"',
  date: 'Mon, 25 Dec 2023 11:14:24 GMT',
  connection: 'close'
}
[root@localhost httpsender]#
```
