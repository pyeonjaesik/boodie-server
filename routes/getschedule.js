var getschedule = function(req,res){
  console.log('getschedule')
  var geo = req.body.geo||[0,0]; 
  var date = req.body.date||0; 
  console.log(geo+'/'+date);
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
  console.log(`date: ${date}
    theaterDay: ${theaterDay}
  `)   
  var database = req.app.get('database');
  var output ={};
  output.post =[];
  if(database){
    var callback=(err,results)=>{
      if(err){
        console.log(err);
        output.status=401;
        res.send(output);
        return;
      }
      var rel=results.length;
      if(rel>0){
        results.map(em=>{
          output.post.push({
            name:em._doc.name,
            type:em._doc.type,
            code:em._doc.cinemaCode,
            schedule:em._doc.schedule.map(x=>x),
            geo:{lat:em._doc.geometry.coordinates[1],long:em._doc.geometry.coordinates[0]},
          })
        });
        console.log(output.post);
        output.status=100;
        res.send(output);
      }else{
        console.log('getschedule: callback results.length==0');
        output.status=102;
        res.send(output);
        return;
      }
    }
    database.TheaterModel.findNear({
      lat:geo[0],
      long:geo[1],
      limit:5,
      maxDistance:10000,
      day:theaterDay,
      callback
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.getschedule = getschedule;