var theater= require('../theater/theater');
var getCGV= require('../theater/getCGV');
var getMEGA= require('../theater/getMEGA');
var getLOTTE= require('../theater/getLOTTE');

var register = async function({app,date}){
  console.log(date);
  var database = app.get('database');
  var findTheater=theater.CGV.concat(theater.MEGA,theater.LOTTE);
  var result=[];
  var findnumber=1;
  var date=date;
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
  var theaterLength=findTheater.length;
  var getSchedule= async ()=>{
    findnumber=0;
    result=[]
    for(var i=0;i<theaterLength;i++){
      ex=findTheater[i];
      switch (ex.type){
        case 'CGV':
          var result_temp=  await getCGV({
            app,
            cinemaName:ex.name,
            RegionCode:ex.RegionCode,
            theaterCd:ex.TheaterCode,
            date,
            geo:ex.geo
          });
          result=result.concat(result_temp);
          console.log('----------------------CGV----------------------'+i);
          findnumber++;
          break;
        case 'MEGA':
          var result_temp=  await getMEGA({
            app,
            cinemaName:ex.name,
            cinema:ex.cinema,
            date,
            geo:ex.geo
          });
          result=result.concat(result_temp);
          console.log('----------------------MEGA----------------------'+i);
          findnumber++;
          break; 
        case 'LOTTE':
            var result_temp= await getLOTTE({
              app,
              cinemaName:ex.name,
              divisionCode:ex.divisionCode,
              detailDivisionCode:ex.detailDivisionCode,
              cinemaID:ex.cinemaID,
              date,
              geo:ex.geo
            });
            result=result.concat(result_temp);
            console.log('----------------------LOTTE----------------'+i);
            findnumber++;
            break;    
        default:
          break;    
      }
      if(findnumber===theaterLength){
        console.log('데이터 검증');
        findComplement();
      }
    }
  }
  var findComplement= async ()=>{
    var failIndex=0;
    await result.map((ex,index)=>{
      if(ex==undefined){
        failIndex++;
      }
    });
    if(failIndex>0){
      console.log('누락된 정보가 있어서 데이터 다시 불러오기 시작');
      getSchedule();
    }else{ 
      console.log('success!');
      var result_movieList=[];
      var result_movieScreen=[];
      var result_screen=[];
      await result.map(ex=>{
        result_movieList=result_movieList.concat(ex.movieList);
        result_movieScreen=result_movieScreen.concat(ex.movieScreen);
        result_screen=result_screen.concat(ex.screen);
      });
      result_movieList=await result_movieList.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });
      result_movieScreen=await result_movieScreen.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });
      result_screen=await result_screen.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });
      console.log(result_movieList);
      console.log(result_movieScreen);
      var result_movieScreenArray={};
      var movieList=[];
      await result_movieScreen.map(em=>{
        var movieScreen_sliced=em.split('*');
        var movieIndex=movieList.indexOf(movieScreen_sliced[0]);
        if(movieIndex==-1){
          movieList.push(movieScreen_sliced[0]);
          result_movieScreenArray={...result_movieScreenArray,...{[movieScreen_sliced[0]]:[movieScreen_sliced[1]]}}
        }else{
          result_movieScreenArray[movieScreen_sliced[0]].push(movieScreen_sliced[1]);    
        }
      });
      console.log(result_movieScreenArray);
      console.log(result_screen);
      try{
        var detail_result=await database.DetailModel.find({day:theaterDay});
        if(detail_result.length>0){
          try{
            await database.DetailModel.update({day:theaterDay},{
              screen:result_screen,
              movieScreen:result_movieScreenArray,
              movieList:result_movieList
            });
            console.log('최종 완료- update');
          }catch(e){
            console.log(e);
          }
        }else{
          var Detail = new database.DetailModel({
            day:theaterDay,
            screen:result_screen,
            movieScreen:result_movieScreenArray,
            movieList:result_movieList
          });
          try{
            await Detail.save();
            console.log('최종완료 - save');
          }catch(e){
            console.log(e);
          }   
        }
      }catch(e){
        console.log(e);
      }
    }
  }
  await getSchedule();
  console.log('완료!')
  // findTheater.map(async (ex)=>{
  //   console.log('aaaaaaa');
  //   await findSchedule(ex);
  // })
};
module.exports = register;