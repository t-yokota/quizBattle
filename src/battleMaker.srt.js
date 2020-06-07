0
00:00:00,000 --> 00:00:00,999
const myApp = {
    state : {
        SetNumQues   : 0,
        SetStartTime : 1,
        SetEndTime   : 2,
        SetAnswer    : 3,
    },
    elem : {
        test       : document.createElement("text"),
        setState   : document.createElement("text"),
        setRange   : document.createElement("text"),
        setNumQues : document.createElement("text"),
        setAnswer  : document.createElement("text"),
        regist     : document.createElement("text"),
        script     : document.createElement("script"),
    },
    val : {
        status : null,
        key_s : 83,
        key_e : 69,
        quesNum   : 1,
        startTime : 0,
        endTime   : 0,
    },
};
//
document.styleSheets.item(0).insertRule('body { text-align: center; margin: auto; background: #EFEFEF; }');
document.styleSheets.item(0).insertRule('p.setanswer1 { margin-top: 16px; margin-bottom: 2.5px; }');
document.styleSheets.item(0).insertRule('p.setanswer2 { margin: 2.5px; }');
document.styleSheets.item(0).insertRule('p.regist { margin: 10px; }');
//
player.setSize(document.documentElement.clientWidth, 390);
myApp.elem.setNumQues.id = 'setnumques';
myApp.elem.setRange.id   = 'setrange';
myApp.elem.setAnswer.id  = 'setanswer';
myApp.elem.setState.innerHTML = `
    <p>
    <b>Select Status : </b>
    <input type='radio' name='state' value='Question' id='radio1' checked>
    <label for='radio1'>Question</label>
    <input type='radio' name='state' value='OthAnswer' id='radio2'>
    <label for='radio2'>Other's Answer
    </p>`;
myApp.elem.setNumQues.innerHTML = `
    <p>
    <b><label for='numques'>Set Question Number : </label></b>
    <input type='text' name='numques' value='1' id='numques'>
    <input type='button' value='+' onclick='up()'>
    <input type='button' value='-' onclick='down()'>
    </p>`;
myApp.elem.setAnswer.innerHTML = `
    <p class='setanswer1'>
    <b><label for='answer'>Set Answer :&nbsp;&nbsp;</label></b>
    <input type='button' value='add' onclick='add()'>
    </p>
    <p class='setanswer2'>
    01:&nbsp;<input type='text' id='answer1'>
    </p>`;
myApp.elem.regist.innerHTML = `
    <p class='regist'>
    <input type='button' value='regist' onclick='regist()'>
    </p>
    `;
myApp.elem.script.innerHTML = `
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
    var countAnsId = 1;
    var initSetAnswerHTML = document.getElementById('setanswer').innerHTML;
    function add(){
        countAnsId += 1;
        if(countAnsId < 10){
            document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                            "<p class='setanswer2'>0"+countAnsId+":&nbsp;<input type='text' id=answer"+countAnsId+"></p>";
        }else{
            document.getElementById('setanswer').innerHTML = document.getElementById('setanswer').innerHTML+
                                                            "<p class='setanswer2'>"+countAnsId+":&nbsp;<input type='text' id=answer"+countAnsId+"></p>";
        }
    }
    function regist(){
        countAnsId = 1;
        document.getElementById('setanswer').innerHTML = initSetAnswerHTML;
    }`;
//
document.getElementsByTagName("body")[0].appendChild(myApp.elem.test);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.setState);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.setNumQues);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.setRange);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.setAnswer);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.regist);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.script);
//
myApp.val.status = myApp.state.SetStartTime;
//
document.onkeydown = myKeyDownEvent;
setInterval(myIntervalEvent, interval = 10);
//
function myIntervalEvent(){
    // myApp.elem.test.innerHTML = document.getElementById('answer2').value;
    if(document.activeElement.id == 'player'){
        // .focus();
        // .blur();
    }
    if(document.activeElement.id == 'setnumques'){
        myApp.val.status = myApp.state.SetNumQues;
    }
    if(document.activeElement.id == 'setanswer'){
        myApp.val.status = myApp.state.SetAnswer;
    }
    if(myApp.val.status == myApp.state.SetStartTime){
        updateStartTime();
        myApp.elem.setRange.innerHTML = '<b>Set Range : </b><u>'+myApp.val.startTime+'</u> -> ' + myApp.val.endTime;
    }
    if(myApp.val.status == myApp.state.SetEndTime){
        updateEndTime();
        myApp.elem.setRange.innerHTML = '<b>Set Range : </b>'+myApp.val.startTime+' -> <u>'+myApp.val.endTime+'</u>';
    }
}
//
function myKeyDownEvent(){
    if(document.activeElement.id != 'setnumques' || document.activeElement.id != 'setanswer'){
        if(event.keyCode == myApp.val.key_s){
            myApp.val.status = myApp.state.SetStartTime;
        }
        if(event.keyCode == myApp.val.key_e){
            myApp.val.status = myApp.state.SetEndTime;
        }
    }
}
//
function updateTime(){
    let time;
    let m, s1, s2;
    time = Math.round(player.getCurrentTime()*100)/100;
    m  = Math.floor(Math.floor(time)/60);
    s1 = Math.floor(time)-m*60;
    s2 = Math.floor((time-Math.floor(time))*100);
    if(m  < 10){ m  = '0'+m;  }
    if(s1 < 10){ s1 = '0'+s1; }
    if(s2 < 10){ s2 = '0'+s2; }
    return m+':'+s1+':'+s2;
}
function updateStartTime(){
    myApp.val.startTime = updateTime();
}
function updateEndTime(){
    myApp.val.endTime = updateTime();
}