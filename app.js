var express = require('express')
  , http = require('http')
  , path = require('path');
var helmet = require('helmet')
const spdy = require('spdy');
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');
const Guid = require('guid');
const Mustache  = require('mustache');
const Request  = require('request');
const Querystring  = require('querystring');
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');
var cors = require('cors');
var config = require('./config');
var database = require('./database/database');
var route_loader = require('./routes/route_loader');
var fs = require('fs');
var app = express();
app.set('port', 80);
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use('/uploads_p', static(path.join(__dirname, 'uploads_p')));
app.use('/dist', static(path.join(__dirname, 'dist')));
app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));
app.use(cors());


app.get('/elbcheck', function(request, response){
  console.log('elbcheck')
  response.send(200);
});

var register= require('./register/register');
setTimeout(function(){
  var date=1;
  register({app,date});
},1000);

route_loader.init(app, express.Router());
var errorHandler = expressErrorHandler({
 static: {
   '404': './public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

///
//const options = {
//  key: fs.readFileSync('/etc/letsencrypt/live/www.yomencity.xyz/privkey.pem'),
//  cert:  fs.readFileSync('/etc/letsencrypt/live/www.yomencity.xyz/cert.pem')
//};
//spdy
//  .createServer(options, app)
//  .listen(8443, (err) => {
//    if (err) {
//      throw new Error(err);
//    }
//    database.init(app, config);
//    console.log('Listening on port: ' + 8443 + '.');
//  });

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

    // 데이터베이스 초기화
    database.init(app, config);
   
});