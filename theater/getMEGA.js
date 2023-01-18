var axios = require('axios');
var DomParser = require('dom-parser');
var getMEGA = async ({app,cinema,date,geo,cinemaName})=>{
    console.log('getMEGA');
    var database = app.get('database');
    var d = new Date(parseInt(Date.now()));
    var dh=d.getHours();
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
    if(dh<6){
        date++;
    }
    try{
        var schedule_Data= await axios.post(`http://www.megabox.co.kr/pages/theater/Theater_Schedule.jsp?count=${date}&cinema=${cinema}`);
    }catch(e){
        console.log(e);
        return;
    }
    console.log('mega1');
    var parser = new DomParser();
    var dom = parser.parseFromString(schedule_Data.data);
    var tagA=dom.getElementsByTagName("A");
    var tagA_leng=tagA.length;
    var movieCode=[];
    var output ={};
    output.schedule=[];
    for(var i=0;i<tagA_leng;i++){
        if(tagA[i].getAttribute("title")=='영화상세 보기'){
            var moviceCodeSliced=tagA[i].getAttribute('href').split("'");
            movieCode.push({name:tagA[i].innerHTML,code:moviceCodeSliced[1]})
        }
    }
    console.log('mega2');
    var cinema_time=dom.getElementsByClassName("cinema_time");
    var cinema_time_leng=cinema_time.length;
    for(var i=0;i<cinema_time_leng;i++){
        var dom2 = parser.parseFromString(cinema_time[i].innerHTML);
        var dom2_tagA =dom2.getElementsByTagName("A");
        if(dom2_tagA.length>0){
            var dom2_TIME =dom2.getElementsByClassName("time");
            var dom2_SEAT =dom2.getElementsByClassName("seat");
            var dom2_LUX =dom2.getElementsByClassName("type");
            var time = dom2_LUX[0].innerHTML;
            var dom2_tagA_sliced=dom2_tagA[0].getAttribute('onclick').split("'");
            var movieIndex=movieCode.findIndex(em=>em.code==dom2_tagA_sliced[1]);
            var seat =dom2_SEAT[0].innerHTML.split("/");
            output.schedule.push({
                name:movieCode[movieIndex].name,
                place:dom2_tagA_sliced[9],
                start:dom2_tagA_sliced[13],
                end:0,
                size:seat[1],
                remain:seat[0],
                time,
                movie:dom2_tagA_sliced[1],
                screen:''
            });
        }
    }
    console.log('mega3');
    var regex = /^[A-Za-z0-9ㄱ-ㅎㅏ-ㅣ가-힣+]*$/;
    var movieList=[];
    var movieScreen=[];
    var Screen=[];
    await output.schedule.map((em,index)=>{
        var str_result=''
        for(var i=0;i<em.name.length;i++){
            if( regex.test(em.name[i]) ) {
                str_result+=em.name[i];
            }
        }
        var movieIndex=movieList.indexOf(str_result);
        if(movieIndex==-1){
            movieList.push(str_result);
        }
        if(em.place.indexOf('더부티크')!==-1){
            output.schedule.splice(index,1,{...em,screen:'더부티크'});
            var screenIndex=movieScreen.indexOf(str_result+'*더부티크');
            if(screenIndex==-1){
                movieScreen.push(str_result+'*더부티크');
            }
            var screenIndex2=Screen.indexOf('더부티크');
            if(screenIndex2==-1){
                Screen.push('더부티크');
            }
        }
        if(em.place.indexOf('컴포트')!==-1){
            output.schedule.splice(index,1,{...em,screen:'컴포트'});
            var screenIndex=movieScreen.indexOf(str_result+'*컴포트');
            if(screenIndex==-1){
                movieScreen.push(str_result+'*컴포트');
            }
            var screenIndex2=Screen.indexOf('컴포트');
            if(screenIndex2==-1){
                Screen.push('컴포트');
            }
        }
        if(em.place.indexOf('MX')!==-1){
            output.schedule.splice(index,1,{...em,screen:'MX'});
            var screenIndex=movieScreen.indexOf(str_result+'*MX');
            if(screenIndex==-1){
                movieScreen.push(str_result+'*MX');
            }
            var screenIndex2=Screen.indexOf('MX');
            if(screenIndex2==-1){
                Screen.push('MX');
            }
        }
        if(em.place.indexOf('키즈')!==-1){
            output.schedule.splice(index,1,{...em,screen:'키즈'});
            var screenIndex=movieScreen.indexOf(str_result+'*키즈');
            if(screenIndex==-1){
                movieScreen.push(str_result+'*키즈');
            }
            var screenIndex2=Screen.indexOf('키즈');
            if(screenIndex2==-1){
                Screen.push('키즈');
            }
        }
        if(em.place.indexOf('The First Club')!==-1){
            output.schedule.splice(index,1,{...em,screen:'The First Club'});
            var screenIndex=movieScreen.indexOf(str_result+'*The First Club');
            if(screenIndex==-1){
                movieScreen.push(str_result+'*The First Club');
            }
            var screenIndex2=Screen.indexOf('The First Club');
            if(screenIndex2==-1){
                Screen.push('The First Club');
            }
        }
        if(em.place.indexOf('발코니')!==-1){
            output.schedule.splice(index,1,{...em,screen:'발코니'});
            var screenIndex=movieScreen.indexOf(str_result+'*발코니');
            if(screenIndex==-1){
                movieScreen.push(str_result+'*발코니');
            }
            var screenIndex2=Screen.indexOf('발코니');
            if(screenIndex2==-1){
                Screen.push('발코니');
            }
        }
    });
    console.log('mega4');
    output.movieList=movieList;
    output.movieScreen=movieScreen;
    output.screen=Screen;
    output.name=cinemaName;
    output.type='MEGA';
    var findNumber=0;
    try{
        let find=await database.TheaterModel.find({cinemaCode:cinema,type:'MEGA',day:theaterDay});
        findNumber=find.length;
        console.log('findNumber'+findNumber);
    }catch(e){
        console.log(e);
        return;
    }
    if(findNumber>0){
        console.log(findNumber);
        try{
            await database.TheaterModel.update({cinemaCode:cinema,type:'MEGA',day:theaterDay},{
                schedule:output.schedule,
                movieList:output.movieList,
                movieScreen:output.movieScreen,
                screen:output.screen,
            });
            console.log('MEGA update success');
            return output;
        }catch(e){
            console.log(e);
            return;
        }
    }else{
        console.log(findNumber);
        try{
            var Theater = new database.TheaterModel({
                cinemaCode:cinema,
                type:'MEGA',
                day:theaterDay,
                name:cinemaName,
                schedule:output.schedule,
                movieList:output.movieList,
                movieScreen:output.movieScreen,
                screen:output.screen,
                geometry:{type:'Point',coordinates:[geo[1],geo[0]]}
            });
            try{
                await Theater.save();
                console.log('MEGA save success');
                return output;
            }catch(e){
                console.log(e);
                return;
            }   
        }catch(e){
            console.log(e);
            return;
        }
    }
}
//더부티크
//컴포트
//MX관
//키즈관
//The First Club관
//발코니
module.exports = getMEGA;