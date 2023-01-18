var getdetail = function(req,res){
  console.log('getdetail')
  var findoption = req.body.findoption||[]; 
  var date = req.body.date||0; 
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
    var regex = /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣+]*$/;
    var counter=0;
    var db_recycle=({db_count})=>{
      database.TheaterModel.find({
        type:findoption[db_count].type,
        cinemaCode:findoption[db_count].code,
        day:theaterDay
      },(err,results)=>{
        if(err){
          console.log('TheaterModel.find err db_count:'+db_count);
          output.status=401;
          res.send(output);
          return;
        }
        if(results.length>0){
          var schedule=results[0]._doc.schedule.map(x=>x);
          var schedule2=results[0]._doc.schedule.map(em=>{
            var str_result='';
            for(var i=0;i<em.name.length;i++){
                if( regex.test(em.name[i]) ) {
                    str_result+=em.name[i];
                }
            }
            return {
              ...em,
              name:str_result
            }
          });
          var schedule_r=[];
          findoption[db_count].movieList.map(emP=>{
            schedule2.map((emS,index)=>{
              if(emP==emS.name){
                schedule_r.push(schedule[index]);
              }
            });
          });
          console.log(schedule_r);
          var f_movieScreen=findoption[db_count].movieScreen
          for( var key in f_movieScreen){
            f_movieScreen[key].map(emP=>{
              schedule2.map((emS,index)=>{
                if(key==emS.name&&emP==emS.screen){
                  schedule_r.push(schedule[index]);
                }
              });
            })
          }
          output.post.push({
            name:results[0]._doc.name,
            type:results[0]._doc.type,
            code:results[0]._doc.cinemaCode,
            schedule:schedule_r,
            geo:{lat:results[0]._doc.geometry.coordinates[1],long:results[0]._doc.geometry.coordinates[0]},
          });
          counter++;
          if(f_l===counter){
            output.status=100;
            res.send(output);
          }
        }else{
          console.log('TheaterModel.find results.length ==0 --> err');
          output.status=102;
          res.send(output);
          return;
        }
      });
    };
    var f_l=findoption.length;
    for(var r=0;r<f_l;r++){
      db_recycle({db_count:r});
    }
  }else{
    console.log('database 없음');
    output.status =410;
    res.send(output);
  }
};
module.exports.getdetail = getdetail;