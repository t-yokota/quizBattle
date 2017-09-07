0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
/*
var srtBool = 0;
srtBtn = document.createElement("button");   //動画の再生ボタン
srtBtn.id = "srtbtn";
srtBtn.innerHTML = "動画を再生";
srtBtn.onClick = "startVideoInit();";
player.addEventListener('onStageChange', stopVideoInit)
function startVideoInit(){ srtBool = 1; }
function stopVideoInit(){ if(srtBool = 0){player.pauseVideo();} }
*/
numQues = document.createElement("h1");      //問題数を表示（はじめはクイズの企画名を表示）
ansCol = document.createElement("textarea"); //解答を入力するテキストエリア
ansBtn = document.createElement("button");   //解答を送信するボタン
numOX = document.createElement("h1");        //◯正解数と✖不正解数を表示
sndPush = document.createElement("audio");   //ボタンの押下音
sndO = document.createElement("audio");      //正解音
sndX = document.createElement("audio");      //不正解音
numQues.id = "numques";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
numOX.id = "numox";
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
QuizName = document.createTextNode("");
cntOX = document.createTextNode("");
numQues.appendChild(QuizName);
numOX.appendChild(cntOX);
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
document.getElementsById("numques").focus();
document.onkeydown = pushButton1;
player.addEventListener('onStateChange', pushButton2);
function pushButton1(){if(event.keyCode == 32){sndPush.play(); player.pauseVideo();}}
function pushButton2(event){if(event.data == 2){sndPush.play();}}

0
00:00:00,200 --> 00:00:00,300
cntO = 0; cntX = 0;
document.getElementById("numques").innerHTML = "動画内の相手とクイズ対決";
ansCol.value = "ここに解答を入力して下さい";
ansBtn.innerHTML = "解答を送信";
document.getElementById("numox").innerHTML = "◯: "+cntO+"  ✖: "+cntX;

0
00:00:05,000 --> 00:00:06,000
var cntQues = 1;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";

0
00:00:10,000 --> 00:00:11,000
var cntQues = 2;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";
