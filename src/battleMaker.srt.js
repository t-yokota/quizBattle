0
00:00:00,000 --> 00:00:00,999
doOnce[index] = true;
player.setSize(document.documentElement.clientWidth, 420);
//
const myElem = {
    test        : document.createElement('text'),
    setTitle    : document.createElement('text'),
    setPosition : document.createElement('text'),
    setRange1   : document.createElement('text'),
    setRange2   : document.createElement('text'),
    setState    : document.createElement('text'),
    setNumQues  : document.createElement('text'),
    setAnswer   : document.createElement('text'),
    regist      : document.createElement('text'),
    script      : document.createElement('script'),
};
//
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
document.styleSheets.item(0).insertRule('p.part1 { margin-top: 16px; margin-bottom: 1px; }');
document.styleSheets.item(0).insertRule('p.part2 { margin: 1px; }');
document.styleSheets.item(0).insertRule('p.regist { margin: 10px; }');
//
myElem.setRange1.id = 'setrange1';
myElem.setAnswer.id = 'setanswer';
//
// myElem.setRange1.tabIndex = 0;
//
myElem.setTitle.innerHTML = `
    <p>
    <b>Set title :</b>
    <input type='text' value='' id='title' style='width:400px'>
    </p>`;
myElem.setPosition.innerHTML = `
    <p class='part1'>
    <input type='button' value='pause' onclick='player.pauseVideo()' style='width:165px'>
    <input type='button' value='play' onclick='player.playVideo()' style='width:165px'>
    </p>
    <p class='part2'>
    <input type='button' value='<< 10sec' onclick='player.seekTo(player.getCurrentTime()-10)' style='width:80px'>
    <input type='button' value='< 1sec' onclick='player.seekTo(player.getCurrentTime()-1)' style='width:80px'>
    <input type='button' value='1sec >' onclick='player.seekTo(player.getCurrentTime()+1)' style='width:80px'>
    <input type='button' value='10sec >>' onclick='player.seekTo(player.getCurrentTime()+10)' style='width:80px'>
    </p>`;
myElem.setRange2.innerHTML = `
    <p class='part2'>
    <input type='button' value='toStartPos' onclick='player.seekTo(myApp.val.startTime)' style='width:145px'>
    <input type='button' value='toEndPos' onclick='player.seekTo(myApp.val.endTime)' style='width:145px'>
    </p>
    <p class='part2'>
    <input type='button' value='<<< 1sec' onclick='tweakRange(-1)' style='width:70px'>
    <input type='button' value='<< 0.1sec' onclick='tweakRange(-0.1)' style='width:70px'>
    <input type='button' value='< 0.01sec' onclick='tweakRange(-0.01)' style='width:70px'>
    <input type='button' value='0.01sec >' onclick='tweakRange(0.01)' style='width:70px'>
    <input type='button' value='0.1sec >>' onclick='tweakRange(0.1)' style='width:70px'>
    <input type='button' value='1sec >>>' onclick='tweakRange(1)' style='width:70px'>
    </p>`;
myElem.setState.innerHTML = `
    <form id='radio'>
    <b>Select Status :</b>
    <input type='radio' name='status' value='Question' id='state1' checked>
    <label for='state1'>During Question</label>
    <input type='radio' name='status' value='OthAnswer' id='state2'>
    <label for='state2'>During Other's Answer
    </form>`;
myElem.setNumQues.innerHTML = `
    <p>
    <b><label for='numques'>Set Question Number :</label></b>
    <input type='number' value='1' id='numques' min='1' style='width:30px'>
    <input type='button' value='+' onclick='up()' style='width:30px'>
    <input type='button' value='-' onclick='down()' style='width:30px'>
    </p>`;
myElem.setAnswer.innerHTML = `
    <p class='part1'>
    <b><label for='answer'>Set Answer :&nbsp;&nbsp;</label></b>
    <input type='button' value='add' onclick='add()'>
    </p>
    <p class='part2'>
    00:&nbsp;<input type='text' id='answer0'>
    </p>`;
myElem.regist.innerHTML = `
    <p class='regist'>
    <input type='button' value='regist' onclick='regist()' id='regist'>
    </p>
    `;
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
            key_s     : 83,
            key_e     : 69,
            key_q     : 81,
            quesNum   : 1,
            startTime : 0,
            endTime   : 0,
            startTimeStamp : '00:00:00',
            endTimeStamp   : '00:00:00',
            countAnsId : 0,
            initSetAnswerHTML : null,
            ansArray  : [],
            statusRangeArray : [],
        },
    };
    myApp.val.status = myApp.state.SetNumQues;
    myApp.val.initSetAnswerHTML = document.getElementById('setanswer').innerHTML;
    //
    document.onkeydown = myKeyDownEvent;
    setInterval(myIntervalEvent, interval = 10);
    //
    function myKeyDownEvent(){
        if(document.activeElement.id == ''){
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
        }
    }
    function myIntervalEvent(){
        console.log(document.activeElement.id+', '+myApp.val.status);
        printRange();
        if(document.activeElement.id == 'player'){
            document.getElementById('regist').focus();
            document.getElementById('regist').blur();
        }
        if(document.activeElement.id == 'title'){
            myApp.val.status = myApp.state.SetTitle;
        }
        if(document.activeElement.id.indexOf('state') === 0){
            myApp.val.status = myApp.state.SetStatus;
        }
        if(document.activeElement.id == 'numques'){
            myApp.val.status = myApp.state.SetNumQues;
        }
        if(document.activeElement.id.indexOf('answer') === 0){
            myApp.val.status = myApp.state.SetAnswer;
        }
    }
    function updateStartTime(time){
        myApp.val.startTime = Math.round(time*100)/100;
        myApp.val.startTimeStamp = updateTimeStamp(myApp.val.startTime);
    }
    function updateEndTime(time){
        myApp.val.endTime = Math.round(time*100)/100;
        myApp.val.endTimeStamp = updateTimeStamp(myApp.val.endTime);
    }
    function updateTimeStamp(time){
        let m, s1, s2;
        m  = Math.floor(Math.floor(time)/60);
        s1 = Math.floor(time)-m*60;
        s2 = Math.floor((time-Math.floor(time))*100);
        if(m  < 10){ m  = '0'+m;  }
        if(s1 < 10){ s1 = '0'+s1; }
        if(s2 < 10){ s2 = '0'+s2; }
        return m+':'+s1+':'+s2;
    }
    function tweakRange(time){
        if(myApp.val.status == myApp.state.SetStartTime){
            player.seekTo(myApp.val.startTime+time);
            updateStartTime(myApp.val.startTime+time);
        }
        if(myApp.val.status == myApp.state.SetEndTime){
            player.seekTo(myApp.val.endTime+time);
            updateEndTime(myApp.val.endTime+time);
        }
    }
    function printRange(){
        if(myApp.val.status == myApp.state.SetStartTime){
            document.getElementById('setrange1').innerHTML = '<p class="part1"><b>Set Range :&nbsp;</b><u>'+myApp.val.startTimeStamp+'</u> ->&nbsp;'+myApp.val.endTimeStamp+'</p>';
        }else if(myApp.val.status == myApp.state.SetEndTime){
            document.getElementById('setrange1').innerHTML = '<p class="part1"><b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;<u>'+myApp.val.endTimeStamp+'</u></p>';
        }else{
            document.getElementById('setrange1').innerHTML = '<p class="part1"><b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;'+myApp.val.endTimeStamp+'</p>'
        }
    }
    function up(){ 
        var val = parseInt(document.getElementById('numques').value, 10); 
        document.getElementById('numques').value = val+1;
    }
    function down(){ 
        var val = parseInt(document.getElementById('numques').value, 10); 
        if(val > 1){
            document.getElementById('numques').value = val-1;
        }
    }
    function add(){
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
    function regist(){
        registAnswer();
        registStatusRange();
        myApp.val.countAnsId = 0;
        document.getElementById('setanswer').innerHTML = myApp.val.initSetAnswerHTML;
    }
    function registAnswer(){
        let tmpRow = [];
        tmpRow.push(document.getElementById('numques').value);
        for(let i = 0; i < myApp.val.countAnsId+1; i++){
            if(document.getElementById('answer'+i).value != ''){
                tmpRow.push(document.getElementById('answer'+i).value);
            }
        }
        for(let i = 0; i < myApp.val.ansArray.length; i++){
            if(myApp.val.ansArray[i][0] == document.getElementById('numques').value){
                myApp.val.ansArray.splice(i, 1);
            }
        }
        myApp.val.ansArray.push(tmpRow);
        myApp.val.ansArray.sort();
        console.log(myApp.val.ansArray);
        for(let i = 0; i < myApp.val.ansArray.length; i++){
            console.log(myApp.val.ansArray[i]);
        }
    }
    function registStatusRange(){
        let tmpRow = [];
        tmpRow.push(document.getElementById('numques').value);
        tmpRow.push(document.getElementById('radio').status.value);
        tmpRow.push(myApp.val.startTimeStamp);
        tmpRow.push(myApp.val.endTimeStamp);
        for(let i = 0; i < myApp.val.statusRangeArray.length; i++){
            if(myApp.val.statusRangeArray[i][0] == document.getElementById('numques').value){
                if(myApp.val.statusRangeArray[i][1] == document.getElementById('radio').status.value){
                    if(document.getElementById('radio').status.value == 'Question'){
                        myApp.val.statusRangeArray.splice(i, 1);
                    }
                }
            }
        }
        myApp.val.statusRangeArray.push(tmpRow);
        myApp.val.statusRangeArray.sort();
        console.log(myApp.val.statusRangeArray);
        for(let i = 0; i < myApp.val.statusRangeArray.length; i++){
            console.log(myApp.val.statusRangeArray[i]);
        }
    }`;
//
document.getElementsByTagName('body')[0].appendChild(myElem.test);
document.getElementsByTagName('body')[0].appendChild(myElem.setPosition);
document.getElementsByTagName('body')[0].appendChild(myElem.setTitle);
document.getElementsByTagName('body')[0].appendChild(myElem.setNumQues);
document.getElementsByTagName('body')[0].appendChild(myElem.setState);
document.getElementsByTagName('body')[0].appendChild(myElem.setRange1);
document.getElementsByTagName('body')[0].appendChild(myElem.setRange2);
document.getElementsByTagName('body')[0].appendChild(myElem.setAnswer);
document.getElementsByTagName('body')[0].appendChild(myElem.regist);
document.getElementsByTagName('body')[0].appendChild(myElem.script);