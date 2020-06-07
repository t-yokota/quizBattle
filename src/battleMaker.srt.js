0
00:00:00,000 --> 00:00:00,999
doOnce[index] = true;
player.setSize(document.documentElement.clientWidth, 420);
//
const myElem = {
    test        : document.createElement('text'),
    setTitle    : document.createElement('text'), 
    setPosition : document.createElement('text'), 
    setState    : document.createElement('text'),
    setRange    : document.createElement('text'),
    setNumQues  : document.createElement('text'),
    setAnswer   : document.createElement('text'),
    regist      : document.createElement('text'),
    script      : document.createElement('script'),
};
//
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
document.styleSheets.item(0).insertRule('p.setanswer1 { margin-top: 16px; margin-bottom: 1px; }');
document.styleSheets.item(0).insertRule('p.setanswer2 { margin: 1px; }');
document.styleSheets.item(0).insertRule('p.regist { margin: 10px; }');
//
myElem.setRange.id   = 'setrange';
myElem.setAnswer.id  = 'setanswer';
//
myElem.setRange.tabIndex = 0;
//
myElem.setTitle.innerHTML = `
    <p>
    <b>Set title :</b>
    <input type='text' name='title' value='' id='title' style='width:400px'>
    </p>`;
myElem.setPosition.innerHTML = `
    <p>
    <input type='button' value='<<< 1sec' onclick='setVideoPosition(-1)'>
    <input type='button' value='<< 0.1sec' onclick='setVideoPosition(-0.1)'>
    <input type='button' value='< 0.01sec' onclick='setVideoPosition(-0.01)'>
    <input type='button' value='0.01sec >' onclick='setVideoPosition(0.01)'>
    <input type='button' value='0.1sec >>' onclick='setVideoPosition(0.1)'>
    <input type='button' value='1sec >>>' onclick='setVideoPosition(1)'>
    </p>`;
myElem.setState.innerHTML = `
    <p>
    <b>Select Status :</b>
    <input type='radio' name='state' value='Question' id='radio1' checked>
    <label for='radio1'>During Question</label>
    <input type='radio' name='state' value='OthAnswer' id='radio2'>
    <label for='radio2'>During Other's Answer
    </p>`;
myElem.setNumQues.innerHTML = `
    <p>
    <b><label for='numques'>Set Question Number :</label></b>
    <input type='text' name='numques' value='1' id='numques'>
    <input type='button' value='+' onclick='up()'>
    <input type='button' value='-' onclick='down()'>
    </p>`;
myElem.setAnswer.innerHTML = `
    <p class='setanswer1'>
    <b><label for='answer'>Set Answer :&nbsp;&nbsp;</label></b>
    <input type='button' value='add' onclick='add()'>
    </p>
    <p class='setanswer2'>
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
            SetNumQues   : 1,
            SetStartTime : 2,
            SetEndTime   : 3,
            SetAnswer    : 4,
        },
        val : {
            status    : null,
            key_s     : 83,
            key_e     : 69,
            quesNum   : 1,
            startTime : 0,
            endTime   : 0,
            startTimeStamp : '00:00:00',
            endTimeStamp   : '00:00:00',
        },
    };
    myApp.val.status = myApp.state.SetNumQues;
    document.getElementById('setrange').innerHTML = '<b>Set Range :&nbsp;</b>00:00:00 -> 00:00:00';
    //
    document.onkeydown = myKeyDownEvent;
    setInterval(myIntervalEvent, interval = 10);
    //
    function myKeyDownEvent(){
        if(document.activeElement.id == '' || document.activeElement.id == 'setrange'){
            if(event.keyCode == myApp.val.key_s){ //s key
                myApp.val.status = myApp.state.SetStartTime;
            }
            if(event.keyCode == myApp.val.key_e){ //e key
                myApp.val.status = myApp.state.SetEndTime;
            }
        }
    }
    function myIntervalEvent(){
        console.log(document.activeElement.id);
        if(document.activeElement.id == 'player'){
            document.getElementById('regist').focus();
            document.getElementById('regist').blur();
        }
        if(document.activeElement.id == 'numques'){
            myApp.val.status = myApp.state.SetNumQues;
        }
        if(document.activeElement.id.indexOf('answer') === 0){
            myApp.val.status = myApp.state.SetAnswer;
        }
        if(myApp.val.status == myApp.state.SetStartTime){
            updateStartTime();
            document.getElementById('setrange').innerHTML = '<b>Set Range :&nbsp;</b><u>'+myApp.val.startTimeStamp+'</u> ->&nbsp;'+myApp.val.endTimeStamp;
        }else if(myApp.val.status == myApp.state.SetEndTime){
            updateEndTime();
            document.getElementById('setrange').innerHTML = '<b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;<u>'+myApp.val.endTimeStamp+'</u>';
        }else{
            document.getElementById('setrange').innerHTML = '<b>Set Range :&nbsp;</b>'+myApp.val.startTimeStamp+' ->&nbsp;'+myApp.val.endTimeStamp;
        }
    }
    function setVideoPosition(diff){
        let currTime = player.getCurrentTime();
        player.seekTo(currTime+diff);
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
    function updateStartTime(){
        myApp.val.startTime = Math.round(player.getCurrentTime()*100)/100;
        myApp.val.startTimeStamp = updateTimeStamp(myApp.val.startTime);
    }
    function updateEndTime(){
        myApp.val.endTime = Math.round(player.getCurrentTime()*100)/100;
        myApp.val.endTimeStamp = updateTimeStamp(myApp.val.endTime);
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
    var countAnsId = 0;
    var initSetAnswerHTML = document.getElementById('setanswer').innerHTML;
    function add(){
        let tmpAns = [];
        for(let i = 0; i < countAnsId+1; i++){
            tmpAns.push(document.getElementById('answer'+i).value);
        }
        countAnsId += 1;
        if(countAnsId < 10){
            document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                            "<p class='setanswer2'>0"+countAnsId+":&nbsp;<input type='text' id=answer"+countAnsId+"></p>";
        }else{
            document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                            "<p class='setanswer2'>"+countAnsId+":&nbsp;<input type='text' id=answer"+countAnsId+"></p>";
        }
        for(let i = 0; i < countAnsId; i++){
            document.getElementById('answer'+i).value = tmpAns[i];
        }
    }
    function regist(){
        countAnsId = 0;
        document.getElementById('setanswer').innerHTML = initSetAnswerHTML;
    }`;
//
document.getElementsByTagName('body')[0].appendChild(myElem.test);
document.getElementsByTagName('body')[0].appendChild(myElem.setPosition);
document.getElementsByTagName('body')[0].appendChild(myElem.setTitle);
document.getElementsByTagName('body')[0].appendChild(myElem.setState);
document.getElementsByTagName('body')[0].appendChild(myElem.setNumQues);
document.getElementsByTagName('body')[0].appendChild(myElem.setRange);
document.getElementsByTagName('body')[0].appendChild(myElem.setAnswer);
document.getElementsByTagName('body')[0].appendChild(myElem.regist);
document.getElementsByTagName('body')[0].appendChild(myElem.script);