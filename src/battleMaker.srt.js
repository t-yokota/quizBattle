0
00:00:00,000 --> 00:00:00,999
doOnce[index] = true;
player.setSize(640, 360);
//
const myElem = {
    setPosition : document.createElement('text'),
    setTitle    : document.createElement('text'),
    setNumQues  : document.createElement('text'),
    setState    : document.createElement('text'),
    setRangeTxt : document.createElement('text'),
    setRangeUI  : document.createElement('text'),
    setAnswer   : document.createElement('text'),
    regist      : document.createElement('text'),
    download    : document.createElement('text'),
    output      : document.createElement('text'),
    script      : document.createElement('script'),
};
//
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
document.styleSheets.item(0).insertRule('p.top { margin-bottom: 1px; }');
document.styleSheets.item(0).insertRule('p.middle { margin-top: 1px; margin-bottom: 1px; }');
document.styleSheets.item(0).insertRule('p.bottom { margin-top: 1px;}');
document.styleSheets.item(0).insertRule('div.output { margin: auto 30px; text-align:left;}');
//
myElem.setRangeTxt.id = 'setrangetxt';
myElem.setAnswer.id = 'setanswer';
myElem.output.id = 'output';
myElem.script.id = 'script';
//
myElem.setTitle.innerHTML = `
    <p>
    <b>Set title :</b>
    <input type='text' value='' id='title' style='width:400px'>
    </p>`;
myElem.setPosition.innerHTML = `
    <p class='middle'>
    <input type='button' value='play / pause' onclick='playPauseVideo()' style='width:165px'>
    </p>
    <p class='bottom'>
    <input type='button' value='<< 10sec' onclick='player.seekTo(player.getCurrentTime()-10)' style='width:80px'>
    <input type='button' value='< 1sec' onclick='player.seekTo(player.getCurrentTime()-1)' style='width:80px'>
    <input type='button' value='1sec >' onclick='player.seekTo(player.getCurrentTime()+1)' style='width:80px'>
    <input type='button' value='10sec >>' onclick='player.seekTo(player.getCurrentTime()+10)' style='width:80px'>
    </p>`;
myElem.setRangeUI.innerHTML = `
    <p class='bottom'>
    <input type='button' value='<<< 1sec' onclick='tweakRange(-1)' style='width:70px'>
    <input type='button' value='<< 0.1sec' onclick='tweakRange(-0.1)' style='width:70px'>
    <input type='button' value='< 0.01sec' onclick='tweakRange(-0.01)' style='width:70px'>
    <input type='button' value='0.01sec >' onclick='tweakRange(0.01)' style='width:70px'>
    <input type='button' value='0.1sec >>' onclick='tweakRange(0.1)' style='width:70px'>
    <input type='button' value='1sec >>>' onclick='tweakRange(1)' style='width:70px'>
    </p>`;
myElem.setState.innerHTML = `
    <p>
    <form id='radio'>
    <b>Select Status :</b>
    <input type='radio' name='status' value='Question' id='state1' checked>
    <label for='state1'>During Question</label>
    <input type='radio' name='status' value='OthAnswer' id='state2'>
    <label for='state2'>During Other's Answer</label>
    </form>
    </p>`;
myElem.setNumQues.innerHTML = `
    <p class='top'>
    <b><label for='numques'>Set Question Number :</label></b>
    <input type='number' value='1' id='numques' min='1' style='width:30px'>
    <input type='button' value='+' onclick='upNumQues(); jumpRangeTime()' style='width:30px'>
    <input type='button' value='-' onclick='downNumQues(); jumpRangeTime()' style='width:30px'>
    </p>
    <p class='middle'>
    <input type='button' value='to Start Position' onclick='player.seekTo(myApp.val.startTime)' style='width:152px'>
    <input type='button' value='to End Position' onclick='player.seekTo(myApp.val.endTime)' style='width:152px'>
    </p>
    <p class='bottom'>
    <input type='button' value="delete Other's Answer in this Question" onclick='deleteOthAns()'>
    <input type='button' value='delete last Question' onclick='deleteLastQues()'>
    </p>`;
myElem.setAnswer.innerHTML = `
    <p class='top'>
    <b><label for='answer'>Set Answer :&nbsp;&nbsp;</label></b>
    <input type='button' value='add' onclick='addAnsCol()'>
    </p>
    <p class='middle'>
    00:&nbsp;<input type='text' id='answer0'>
    </p>`;
myElem.regist.innerHTML = `
    <p class='top' style='margin-top:15px'>
    <input type='button' value='regist status' onclick='registStatusRange();' style='width:100px'>
    <input type='button' value='regist answer' onclick='registAnswer();' style='width:100px'>
    </p>`;
myElem.download.innerHTML = `
    <p class='bottom'>
    <input type='button' value='describe script' onclick='describeScript()' style='width:150px'>
    <input type='button' value='download answer.csv' onclick='downloadAnswer()' style='width:150px'>
    </p>`;
myElem.script.innerHTML = `
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
        // executed just numques is changed by ui button.
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
            document.getElementById('setrangetxt').innerHTML = '<p class="top"><b>Set Range :&nbsp;</b><u>'+myApp.val.startTimeStamp+'</u> ->&nbsp;'+myApp.val.endTimeStamp+'（'+myApp.val.currTimeStamp+'）</p>';
        }else if(myApp.val.status == myApp.state.SetEndTime){
            document.getElementById('setrangetxt').innerHTML = '<p class="top"><b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;<u>'+myApp.val.endTimeStamp+'</u>（'+myApp.val.currTimeStamp+'）</p>';
        }else{
            document.getElementById('setrangetxt').innerHTML = '<p class="top"><b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;'+myApp.val.endTimeStamp+'（'+myApp.val.currTimeStamp+'）</p>';
        }
    }
    function upNumQues(){
        let numques = parseInt(document.getElementById('numques').value, 10); 
        // if(myApp.val.quesRangeArray.length >= numques){
            document.getElementById('numques').value = numques+1;
        // }
    }
    function downNumQues(){
        let numques = parseInt(document.getElementById('numques').value, 10); 
        if(numques > 1){
            document.getElementById('numques').value = numques-1;
        }
    }
    function deleteLastQues(){
        let numques = parseInt(document.getElementById('numques').value, 10);
        myApp.val.quesRangeArray.pop();
        if(numques > myApp.val.quesRangeArray.length && numques != 1){
            document.getElementById('numques').value = numques-1;
        }
        console.log(myApp.val.quesRangeArray);
        for(let i = 0; i < myApp.val.quesRangeArray.length; i++){
            console.log(myApp.val.quesRangeArray[i]);
        }
    }
    function deleteOthAns(){
        let numques = parseInt(document.getElementById('numques').value, 10);
        if(myApp.val.quesRangeArray[numques-1]){
            myApp.val.othAnsRangeArray = myApp.val.othAnsRangeArray.filter(function(value){
                return value[2] < myApp.val.quesRangeArray[numques-1][2] || myApp.val.quesRangeArray[numques-1][3] < value[3];
            });
        }else{
            console.log('range of question is not registed.')
        }
        console.log(myApp.val.othAnsRangeArray);
        for(let i = 0; i < myApp.val.othAnsRangeArray.length; i++){
            console.log(myApp.val.othAnsRangeArray[i]);
        }
    }
    function addAnsCol(){
        let tmpAns = [];
        for(let i = 0; i <= myApp.val.countAnsId; i++){
            tmpAns.push(document.getElementById('answer'+i).value);
        }
        myApp.val.countAnsId += 1;
        if(myApp.val.countAnsId < 10){
            document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                            "<p class='middle'>0"+myApp.val.countAnsId+":&nbsp;<input type='text' id=answer"+myApp.val.countAnsId+"></p>";
        }else{
            document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                            "<p class='middle'>"+myApp.val.countAnsId+":&nbsp;<input type='text' id=answer"+myApp.val.countAnsId+"></p>";
        }
        for(let i = 0; i <= myApp.val.countAnsId-1; i++){
            document.getElementById('answer'+i).value = tmpAns[i];
        }
    }
    function registAnswer(){
        let count  = 0;
        let tmpRow = [];
        tmpRow.push(Number(document.getElementById('numques').value));
        for(let i = 0; i <= myApp.val.countAnsId; i++){
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
            myApp.val.ansArray.sort(funcCompare);
            upNumQues();
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
            let numques = Number(document.getElementById('numques').value);
            // tmpRow.push(numques);
            // tmpRow.push(document.getElementById('radio').status.value);
            if(document.getElementById('radio').status.value === 'Question'){
                try{
                    if(numques == 1 || myApp.val.startTime > myApp.val.quesRangeArray[(numques-1)-1][3]){
                        for(let i = 0; i < myApp.val.quesRangeArray.length; i++){
                            if(myApp.val.quesRangeArray[i][0] == document.getElementById('numques').value){
                                myApp.val.quesRangeArray.splice(i, 1);
                            }
                        }
                        tmpRow.push(numques);
                        tmpRow.push(document.getElementById('radio').status.value);
                        tmpRow.push(myApp.val.startTime);
                        tmpRow.push(myApp.val.endTime);
                        myApp.val.quesRangeArray.push(tmpRow);
                        myApp.val.quesRangeArray.sort(funcCompare);
                        //
                        // upNumQues();
                        console.log(myApp.val.quesRangeArray);
                        for(let i = 0; i < myApp.val.quesRangeArray.length; i++){
                            console.log(myApp.val.quesRangeArray[i]);
                        }
                    }else{
                        console.log('range of qustion is overlaped with privious question.')
                    }
                }catch(e){
                    console.log(e) // an error occurs when 'myApp.val.quesRangeArray[(numques-1)-1][3]' is undefined.
                }
            }else if(document.getElementById('radio').status.value === 'OthAnswer'){
                let overlapBool = false;
                tmp = myApp.val.othAnsRangeArray;
                for(let i = 0; i < tmp.length; i++){
                    if(tmp[i][2] <= myApp.val.startTime && myApp.val.startTime <= tmp[i][3]){
                        overlapBool = true;
                    }
                    if(tmp[i][2] <= myApp.val.endTime && myApp.val.endTime <= tmp[i][3]){
                        overlapBool = true;
                    }
                    if(myApp.val.startTime <= tmp[i][2] && tmp[i][3] <= myApp.val.endTime){
                        overlapBool = true;
                    }
                }
                if(overlapBool == false){
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
                }else{
                    console.log('range of others answer is overlaped with other ranges.')
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
    function downloadAnswer(){
        let numques = myApp.val.quesRangeArray.length;
        let numans  = myApp.val.ansArray.length
        if(numans >= numques && numans > 0){
            downloadAnsCSV(myApp.val.ansArray);
        }else{
            console.log('num of answer is not enough.');
        }
    }
    function describeScript(){
        let numques = myApp.val.quesRangeArray.length;
        if(numques > 0){
            let res = [];
            let script = [];
            document.getElementById('output').innerHTML = '';
            res = combineRangeArray(myApp.val.quesRangeArray, myApp.val.othAnsRangeArray);
            res = addTalkRange(res);
            console.log(res);
            for(let i = 0; i < res.length; i++){
                console.log(res[i]);
            }
            script = setSrtFuncArray(res);
            script = setSrtTimeRange(res, script);
            for(let i = 0; i < script.length; i++) {
                document.getElementById('output').innerHTML += '<div class="output">' + script[i] + '<br>';
            }
        }else{
            console.log('num of question is not enough.');
        }
    }
    var downloadAnsCSV = (function(){
        var tableToCsvString = function(table){
            var str = '\\uFEFF';
            for(var i = 0; i < table.length; i++){
                var row = table[i];
                for(var j = 1; j < row.length; j++){
                    str += row[j];
                    if (j !== row.length-1) {
                        str += ',';
                    }
                }
                if(i != table.length-1){
                    str += '\\r\\n';
                }
            }
            return str;
        };
        var createDataUriFromString = function(str){
            return 'data:text/csv,' + encodeURIComponent(str);
        }
        var downloadDataUri = function(uri, filename){
            var link = document.createElement('a');
            link.download = filename;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        return function(table, filename) {
            if(!filename) {
                filename = 'answer.csv';
            }
            var uri = createDataUriFromString(tableToCsvString(table));
            downloadDataUri(uri, filename);
        };
    })();
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
        // if(array[0][2] > 0){
        //     start = 0;
        //     end   = array[0][2];
        //     res.push([0, 'Talk', start, end]);
        // }
        for(let i = 0; i < array.length; i++){
            res.push(array[i]);
            if(i != array.length-1){
                if(array[i][3] < array[i+1][2]){
                    let start = array[i][3];
                    let end   = array[i+1][2];
                    // res.push([0, 'Talk', start, end]);
                    res.push([array[i][0], 'Talk', start, end]);
                }
            }
        }
        if(videoEnd > array[array.length-1][3]){
            start = array[array.length-1][3];
            end   = videoEnd;
            // res.push([0, 'Talk', start, end]);
            res.push([array[array.length-1][0], 'Talk', start, end]);
        }
        for(let i = 0; i < res.length; i++){
            res[i].push(i+1);
        }
        return res;
    }
    function setSrtFuncArray(array){
        let res = [];
        let quesCount = 0;
        let indent = '&nbsp;&nbsp;&nbsp;&nbsp;';
        res.push('myApp.val.jumpToAnsBool = false;');
        res.push('myApp.val.srtFuncArray = [');
        for(let i = 0; i < array.length; i++){
            res.push(indent+ 'function(){');
            if(array[i][1] === 'Question'){
                if(quesCount < array[i][0]){
                    quesCount = array[i][0];
                    if(quesCount == 1){
                        res.push(indent+indent+ 'myApp.val.viewFuncArray.shift()();');
                    }
                    res.push(indent+indent+ '/* 第'+quesCount+'問 */');
                    // res.push(indent+indent+ 'myApp.val.ansIndex = 
                    // res.push(indent+indent+ 'myApp.val.ansTime = 
                    res.push(indent+indent+ '//');
                    res.push(indent+indent+ 'myApp.val.status = myApp.state.Question;');
                    res.push(indent+indent+ 'myApp.val.numQues = '+quesCount+';');
                    res.push(indent+indent+ 'myApp.val.cntPush = 0;');
                    res.push(indent+indent+ 'myApp.val.correctBool = false;');
                    res.push(indent+indent+ 'myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";');
                    res.push(indent+indent+ 'myApp.elem.ansCol.value = "";');
                    res.push(indent+indent+ 'if(Math.abs(window.orientation) != 90){ myApp.elem.pushBtn.src = myApp.elem.imgBtn1.src; }');
                }else{
                    res.push(indent+indent+ 'myApp.val.status = myApp.state.Question;');
                }
            }else if(array[i][1] === 'Talk'){
                res.push(indent+indent+ 'myApp.val.status = myApp.state.Talk;');
            }else if(array[i][1] === 'OthAnswer'){
                res.push(indent+indent+ 'myApp.val.status = myApp.state.OthAnswer;');
            }
            res.push( indent + '},');
        }
        res.push('];');
        res.push('');
        // for(let i = 0; i < res.length; i++){
        //     console.log(res[i]);
        // }
        return res;
    }
    function setSrtTimeRange(array, output){
        let res = output;
        for(let i = 0; i < array.length; i++){
            let start = getTimeStamp(array[i][2]);
            let end = getTimeStamp(array[i][3]);
            res.push(i+1);
            res.push(start+'0 --> '+end+'0');
            res.push('');
            res.push('');
        }
        // for(let i = 0; i < res.length; i++){
        //     console.log(res[i]);
        // }
        return res;
    }
    `;
//
document.getElementsByTagName('body')[0].appendChild(myElem.setPosition);
document.getElementsByTagName('body')[0].appendChild(myElem.setTitle);
document.getElementsByTagName('body')[0].appendChild(myElem.setNumQues);
document.getElementsByTagName('body')[0].appendChild(myElem.setState);
document.getElementsByTagName('body')[0].appendChild(myElem.setRangeTxt);
document.getElementsByTagName('body')[0].appendChild(myElem.setRangeUI);
document.getElementsByTagName('body')[0].appendChild(myElem.setAnswer);
document.getElementsByTagName('body')[0].appendChild(myElem.regist);
document.getElementsByTagName('body')[0].appendChild(myElem.download);
document.getElementsByTagName('body')[0].appendChild(myElem.output);
document.getElementsByTagName('body')[0].appendChild(myElem.script);