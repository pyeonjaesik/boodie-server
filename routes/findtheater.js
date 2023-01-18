var findtheater= function(req,res){
  console.log('findtheater')
  var location = req.body.location||[0,0]; 
  var date = req.body.date||0; 
  var movieList=req.body.movieList||[];
  var movieScreen=req.body.movieScreen||[];
  console.log(location);
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
    console.log('--movieScreen--');
    console.log(movieScreen);
    console.log('--movieList--');
    console.log(movieList);
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
          // var lat_older=parseFloat(em._doc.geometry.coordinates[1]);
          // var long_older=parseFloat(em._doc.geometry.coordinates[0]);
          // var x = (location[0]-lat_older)*100000.0*0.884;
          // var y = (location[1]-long_older)*100000.0*1.110;
          output.post.push({
            name:em._doc.name,
            type:em._doc.type,
            code:em._doc.cinemaCode,
            geo:{lat:em._doc.geometry.coordinates[1],long:em._doc.geometry.coordinates[0]},
            movieList:em._doc.movieList.map(x=>x),
            movieScreen:em._doc.movieScreen.map(x=>x),
          })
        });
        console.log(output.post);
        output.status=100;
        res.send(output);
      }else{
        console.log('findTheater: callback results.length==0');
        output.status=102;
        res.send(output);
        return;
      }
    }
    database.TheaterModel.findSpecial({
      lat:location[0],
      long:location[1],
      limit:50,
      maxDistance:1000000000000,
      day:theaterDay,
      movieList,
      movieScreen,
      callback
    });
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.findtheater = findtheater;