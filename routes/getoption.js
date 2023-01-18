var getoption= function(req,res){
  console.log('getoption')
  var date = req.body.date||0; 
  console.log(date);
  var now = parseInt(Date.now())+(date*86400000);
  var theaterDay_d = new Date(now);
  var theaterDay_dy=theaterDay_d.getFullYear();
  var theaterDay_dm=theaterDay_d.getMonth()+1;
  var theaterDay_dd=theaterDay_d.getDate();
  if(theaterDay_dm<10){
      theaterDay_dm='0'+theaterDay_dm;
  }
  if(theaterDay_dd<10){
      theaterDay_dd='0'+theaterDay_dd;
  }
  var theaterDay=`${theaterDay_dy}${theaterDay_dm}${theaterDay_dd}`; 
  var database = req.app.get('database');
  var output ={};
  output.movieList =[];
  output.movieScreen={};
  output.screen=[];
  console.log('theaterDay:'+theaterDay);
  if(database){
    database.DetailModel.find({day:theaterDay},(err,results)=>{
      if(err){
        console.log('getoption: DetailModel.find err');
        output.status=401;
        res.send(output);
        return;
      }
      if(results.length>0){
        output.movieList=results[0]._doc.movieList.map(x=>x);
        output.movieScreen=results[0]._doc.movieScreen;
        output.screen=results[0]._doc.screen.map(x=>x);
        output.status=100;
        res.send(output);
      }else{
        console.log('getoption: DetailModel.find results.length==0 -->err');
        output.status=402;
        res.send(output);
      }
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.getoption = getoption;