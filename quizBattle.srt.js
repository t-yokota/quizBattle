0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
numQues = document.createElement("h1");     //問題数を表示（はじめはクイズの企画名を表示）
ansCol = document.createElement("textarea");//解答を入力するテキストエリア
ansBtn = document.createElement("button");  //解答を送信するボタン
numOX = document.createElement("h1");       //◯正解数と✖不正解数を表示
sndPush = document.createElement("audio");  //ボタンの押下音
sndO = document.createElement("audio");     //正解音
sndX = document.createElement("audio");     //不正解音
numQues.id = "numques";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
numOX.id = "numox";
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
QuizName = document.createTextNode("");//書き換えが多いTextNodeの内容はdoOnce内のcreateElement(～appendChildまで)から隔離し、他のindex内でinnerHTMLを用いて編集する
cntOX = document.createTextNode("");
numQues.appendChild(QuizName);
numOX.appendChild(cntOX);
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
document.getElementById("ansbtn").focus();//再生直後にカーソルのフォーカスをjsの描画範囲(のボタンUI)に移動する->すぐにキーイベントが呼び出せるようになる
document.getElementById("ansbtn").blur(); //ボタン自体にフォーカスをしている意味はないため、すぐにbulrでそれを解除
document.onkeydown = pushButton1;
player.addEventListener('onStateChange', pushButton2);//カーソルのフォーカスがplayer内の場合キーイベントが呼べないため、onStageChange時に起動するイベントリスナー関数も用意する
function pushButton1(){if(event.keyCode == 32){if(player.getPlayerState = 1){sndPush.play(); player.pauseVideo();}}}
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
