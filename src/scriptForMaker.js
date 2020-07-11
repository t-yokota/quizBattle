const myApp = {
    state : {
        SetTitle     : 0,
        SetStatus    : 1,
        SetNumQues   : 2,
        SetStartTime : 3,
        SetEndTime   : 4,
        SetAnswer    : 5,
        QuitState    : 6,
    },
    val : {
        status    : null,
        key_e     : 69,
        key_p     : 80, 
        key_q     : 81,
        key_r     : 82,
        key_s     : 83,
        key_shift : 16,
        key_left  : 37,
        key_right : 39,
        quesNum   : 1,
        currTime  : 0,
        startTime : 0,
        endTime   : 0,
        currTimeStamp  : '00:00:00,00',
        startTimeStamp : '00:00:00,00',
        endTimeStamp   : '00:00:00,00',
        countAnsId : 0,
        initSetAnswerHTML : null,
        ansArray : [],
        quesRangeArray : [],
        othAnsRangeArray : [],
    },
};
myApp.val.status = myApp.state.SetNumQues;
myApp.val.initSetAnswerHTML = document.getElementById('setanswer').innerHTML;
//
document.onkeydown = myKeyDownEvent;
setInterval(myIntervalEvent, interval = 10);
//
function playPauseVideo(){
    if(player.getPlayerState() == 2){
        player.playVideo();
    }else if(player.getPlayerState() == 1){
        player.pauseVideo();
    }
}
function myKeyDownEvent(){
    if(document.activeElement.id == ''){
        if(event.keyCode == myApp.val.key_p){
            playPauseVideo();
        }
        if(event.keyCode == myApp.val.key_s){ //s key
            if(myApp.val.status == myApp.state.SetStartTime){
                updateStartTime(player.getCurrentTime());
            }else{
                myApp.val.status = myApp.state.SetStartTime;
            }
        }
        if(event.keyCode == myApp.val.key_e){ //e key
            if(myApp.val.status == myApp.state.SetEndTime){
                updateEndTime(player.getCurrentTime());
            }else{
                myApp.val.status = myApp.state.SetEndTime;
            }
        }
        if(event.keyCode == myApp.val.key_q){ //q key
            myApp.val.status = myApp.state.QuitState;
        }
        if(event.keyCode == myApp.val.key_r){ //r key
            if(myApp.val.status == myApp.state.QuitState){
                registStatusRange();
                if(document.getElementById('radio').status.value === 'Question'){
                    upNumQues();
                }
            }
        }
        if(event.keyCode == myApp.val.key_left){
            let val;
            if(event.shiftKey == false && event.ctrlKey == false){
                val = -0.1;
            }else if(event.shiftKey == true && event.ctrlKey == false){
                val = -0.01;
            }else if(event.shiftKey == true && event.ctrlKey == true){
                val = -1.0;
            }
            if(myApp.state.QuitState){
                player.seekTo(player.getCurrentTime()+val);
            }
            if(myApp.val.status == myApp.state.SetStartTime || myApp.val.status == myApp.state.SetEndTime){
                tweakRange(val);
            }
        }
        if(event.keyCode == myApp.val.key_right){
            let val;
            if(event.shiftKey == false && event.ctrlKey == false){
                val = 0.1;
            }else if(event.shiftKey == true && event.ctrlKey == false){
                val = 0.01;
            }else if(event.shiftKey == true && event.ctrlKey == true){
                val = 1.0;
            }
            if(myApp.state.QuitState){
                player.seekTo(player.getCurrentTime()+val);
            }
            if(myApp.val.status == myApp.state.SetStartTime || myApp.val.status == myApp.state.SetEndTime){
                tweakRange(val);
            }
        }
    }
}
function myIntervalEvent(){
    // console.log(document.activeElement.id+', '+myApp.val.status);
    updateCurrTime(player.getCurrentTime());
    printRange();
    if(document.activeElement.id == 'player'){
        document.getElementById('answer0').focus();
        document.getElementById('answer0').blur();
    }
    if(document.activeElement.id == 'title'){
        myApp.val.status = myApp.state.SetTitle;
    }
    if(document.activeElement.id.indexOf('state') === 0){
        myApp.val.status = myApp.state.SetStatus;
        document.getElementById('answer0').focus();
        document.getElementById('answer0').blur();
    }
    if(document.activeElement.id == 'numques'){
        myApp.val.status = myApp.state.SetNumQues;
    }
    if(document.activeElement.id.indexOf('answer') === 0){
        myApp.val.status = myApp.state.SetAnswer;
    }
}
function updateCurrTime(time){
    myApp.val.currTime = Math.round(time*100)/100;
    myApp.val.currTimeStamp = getTimeStamp(myApp.val.currTime);
}
function updateStartTime(time){
    myApp.val.startTime = Math.round(time*100)/100;
    myApp.val.startTimeStamp = getTimeStamp(myApp.val.startTime);
}
function updateEndTime(time){
    myApp.val.endTime = Math.round(time*100)/100;
    myApp.val.endTimeStamp = getTimeStamp(myApp.val.endTime);
}
function jumpRangeTime(){
    // executed just numQues is changed by ui button.
    let tmp = [];
    tmp = myApp.val.quesRangeArray.filter(function(value){
        return value[0] == parseInt(document.getElementById('numques').value, 10);
    });
    if(tmp.length != 0){
        updateStartTime(tmp[0][2]);
        updateEndTime(tmp[0][3]);
    }
}
function getTimeStamp(time){
    let h, m, s1, s2;
    h  = Math.floor(Math.floor(time)/3600);
    m  = Math.floor(Math.floor(time)/60)-h*60;
    s1 = Math.floor(time)-h*3600-m*60;
    s2 = Math.round((time-Math.floor(time))*100);
    if(h  < 10){ h  = '0'+h;  }
    if(m  < 10){ m  = '0'+m;  }
    if(s1 < 10){ s1 = '0'+s1; }
    if(s2 < 10){ s2 = '0'+s2; }
    return h+':'+m+':'+s1+','+s2;
}
function tweakRange(time){
    if(myApp.val.status == myApp.state.SetStartTime){
        if(myApp.val.startTime+time >= 0){
            player.seekTo(myApp.val.startTime+time);
            updateStartTime(myApp.val.startTime+time);
        }
    }
    if(myApp.val.status == myApp.state.SetEndTime){
        if(myApp.val.endTime+time >= 0){
            player.seekTo(myApp.val.endTime+time);
            updateEndTime(myApp.val.endTime+time);
        }
    }
}
function printRange(){
    if(myApp.val.status == myApp.state.SetStartTime){
        document.getElementById('setrange1').innerHTML = '<p class="part1"><b>Set Range :&nbsp;</b><u>'+myApp.val.startTimeStamp+'</u> ->&nbsp;'+myApp.val.endTimeStamp+'（'+myApp.val.currTimeStamp+'）</p>';
    }else if(myApp.val.status == myApp.state.SetEndTime){
        document.getElementById('setrange1').innerHTML = '<p class="part1"><b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;<u>'+myApp.val.endTimeStamp+'</u>（'+myApp.val.currTimeStamp+'）</p>';
    }else{
        document.getElementById('setrange1').innerHTML = '<p class="part1"><b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;'+myApp.val.endTimeStamp+'（'+myApp.val.currTimeStamp+'）</p>';
    }
}
function upNumQues(){
    var val = parseInt(document.getElementById('numques').value, 10); 
    if(myApp.val.quesRangeArray.length >= val){
        document.getElementById('numques').value = val+1;
    }
}
function downNumQues(){
    var val = parseInt(document.getElementById('numques').value, 10); 
    if(val > 1){
        document.getElementById('numques').value = val-1;
    }
}
function addAnsCol(){
    let tmpAns = [];
    for(let i = 0; i < myApp.val.countAnsId+1; i++){
        tmpAns.push(document.getElementById('answer'+i).value);
    }
    myApp.val.countAnsId += 1;
    if(myApp.val.countAnsId < 10){
        document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                        "<p class='part2'>0"+myApp.val.countAnsId+":&nbsp;<input type='text' id=answer"+myApp.val.countAnsId+"></p>";
    }else{
        document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                        "<p class='part2'>"+myApp.val.countAnsId+":&nbsp;<input type='text' id=answer"+myApp.val.countAnsId+"></p>";
    }
    for(let i = 0; i < myApp.val.countAnsId; i++){
        document.getElementById('answer'+i).value = tmpAns[i];
    }
}
function registAnswer(){
    let count  = 0;
    let tmpRow = [];
    tmpRow.push(Number(document.getElementById('numques').value));
    for(let i = 0; i < myApp.val.countAnsId+1; i++){
        if(document.getElementById('answer'+i).value != ''){
            tmpRow.push(document.getElementById('answer'+i).value);
            count++;
        }
    }
    if(count != 0){
        for(let i = 0; i < myApp.val.ansArray.length; i++){
            if(myApp.val.ansArray[i][0] == document.getElementById('numques').value){
                myApp.val.ansArray.splice(i, 1);
            }
        }
        myApp.val.ansArray.push(tmpRow);
        myApp.val.ansArray.sort();
        //
        console.log(myApp.val.ansArray);
        for(let i = 0; i < myApp.val.ansArray.length; i++){
            console.log(myApp.val.ansArray[i]);
        }
    }
    myApp.val.countAnsId = 0;
    document.getElementById('setanswer').innerHTML = myApp.val.initSetAnswerHTML;
}
function registStatusRange(){
    if(myApp.val.endTime > myApp.val.startTime){
        let tmpRow = [];
        let numQues = Number(document.getElementById('numques').value);
        // tmpRow.push(numQues);
        // tmpRow.push(document.getElementById('radio').status.value);
        if(document.getElementById('radio').status.value === 'Question'){
            if(numQues == 1 || myApp.val.startTime > myApp.val.quesRangeArray[numQues-2][3]){
                for(let i = 0; i < myApp.val.quesRangeArray.length; i++){
                    if(myApp.val.quesRangeArray[i][0] == document.getElementById('numques').value){
                        myApp.val.quesRangeArray.splice(i, 1);
                    }
                }
                tmpRow.push(numQues);
                tmpRow.push(document.getElementById('radio').status.value);
                tmpRow.push(myApp.val.startTime);
                tmpRow.push(myApp.val.endTime);
                myApp.val.quesRangeArray.push(tmpRow);
                myApp.val.quesRangeArray.sort();
                //
                console.log(myApp.val.quesRangeArray);
                for(let i = 0; i < myApp.val.quesRangeArray.length; i++){
                    console.log(myApp.val.quesRangeArray[i]);
                }
            }
        }else if(document.getElementById('radio').status.value === 'OthAnswer'){
            let overlapBool = false;
            tmp = myApp.val.othAnsRangeArray.filter(function(value){
                return value[0] == numQues;
            })
            for(let i = 0; i < tmp.length; i++){
                if(tmp[i][2] <= myApp.val.startTime && myApp.val.startTime < tmp[i][3]){
                    overlapBool = true;
                }
                if(tmp[i][2] < myApp.val.endTime && myApp.val.endTime <= tmp[i][3]){
                    overlapBool = true;
                }
                if(myApp.val.startTime <= tmp[i][2] && tmp[i][3] <= myApp.val.endTime){
                    overlapBool = true;
                }
            }
            if(tmp.length == 0 || overlapBool == false){
                tmpRow.push(0);
                tmpRow.push(document.getElementById('radio').status.value);
                tmpRow.push(myApp.val.startTime);
                tmpRow.push(myApp.val.endTime);
                myApp.val.othAnsRangeArray.push(tmpRow);
                myApp.val.othAnsRangeArray.sort(funcCompare);
                //
                console.log(myApp.val.othAnsRangeArray);
                for(let i = 0; i < myApp.val.othAnsRangeArray.length; i++){
                    console.log(myApp.val.othAnsRangeArray[i]);
                }
            }
        }
    }
}
function funcCompare(a, b){
    if (a[0] < b[0]) return -1;
    if (a[0] > b[0]) return 1;
    if (a[2] < b[2]) return -1;
    if (a[2] > b[2]) return 1;
    return 0;
}
function download(){
    let res = [];
    res = combineRangeArray(myApp.val.quesRangeArray, myApp.val.othAnsRangeArray);
    res = addTalkRange(res);
    console.log(res);
    for(let i = 0; i < res.length; i++){
        console.log(res[i]);
    }
    setSrtTimeRange(res);
}
function combineRangeArray(quesRangeArray, othAnsRangeArray){
    let tmp = []
    let res = []
    let start;
    let end;
    for(let i = 0; i < quesRangeArray.length; i++){
        // tmp = othAnsRangeArray.filter(function(value){
        //     return value[0] == i+1;
        // });
        // tmp = tmp.filter(function(value){
        //     return quesRangeArray[i][2] <= value[2] && value[3] <= quesRangeArray[i][3];
        // });
        tmp = othAnsRangeArray.filter(function(value){
            return quesRangeArray[i][2] <= value[2] && value[3] <= quesRangeArray[i][3];
        });
        if(tmp.length > 0){
            if(quesRangeArray[i][2] < tmp[0][2]){
                start = quesRangeArray[i][2];
                end   = tmp[0][2];
                res.push([i+1, 'Question', start, end]);
            }
            for(let j = 0; j < tmp.length; j++){
                start = tmp[j][2];
                end   = tmp[j][3];
                res.push([i+1, 'OthAnswer', start, end]);
                if(j != tmp.length-1){
                    start = tmp[j][3];
                    end   = tmp[j+1][2];
                    res.push([i+1, 'Question', start, end]);
                }
            }
            if(quesRangeArray[i][3] > tmp[tmp.length-1][3]){
                start = tmp[tmp.length-1][3]; 
                end   = quesRangeArray[i][3];
                res.push([i+1, 'Question', start, end]);
            }
        }else{
            res.push([i+1, 'Question', quesRangeArray[i][2], quesRangeArray[i][3]]);           
        }
    }
    return res;
}
function addTalkRange(array){
    let res = [];
    let start;
    let end;
    let videoEnd = Math.round(player.getDuration()*100)/100;
    if(array[0][2] > 0){
        start = 0;
        end   = array[0][2];
        res.push([0, 'Talk', start, end]);
    }
    for(let i = 0; i < array.length; i++){
        res.push(array[i]);
        if(i != array.length-1){
            if(array[i][3] < array[i+1][2]){
                let start = array[i][3];
                let end   = array[i+1][2];
                res.push([0, 'Talk', start, end]);
            }
        }
    }
    if(videoEnd > array[array.length-1][3]){
        start = array[array.length-1][3];
        end   = videoEnd;
        res.push([0, 'Talk', start, end]);
    }
    return res;
}
function setSrtFuncArray(array){
    //
}
function setSrtTimeRange(array){
    let res;
    for(let i = 0; i < array.length; i++){
        let start = getTimeStamp(array[i][2]);
        let end = getTimeStamp(array[i][3]);
        res = i+1 +'\n';
        res = res + start+'0 --> '+end+'0\n\n';
        console.log(res);
        // console.log(str);
    }
}