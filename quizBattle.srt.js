0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
numQues = document.createElement("h1");     //問題数を表示（はじめはクイズの企画名を表示）
numOX = document.createElement("h1");       //◯正解数と✖不正解数を表示
ansCol = document.createElement("textarea");//解答を入力するテキストエリア
ansBtn = document.createElement("button");  //解答を送信するボタン
sndPush = document.createElement("audio");  //ボタンの押下音
sndO = document.createElement("audio");     //正解音
sndX = document.createElement("audio");     //不正解音
numQues.id = "numques";
numOX.id = "numox";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
_numQues = document.createTextNode("");//書き換えが多いTextNodeの内容はdoOnce内から隔離し、他のindex内でinnerHTMLを用いて編集する
_numOX = document.createTextNode("");
numQues.appendChild(_numQues);
numOX.appendChild(_numOX);
player.addEventListener('onStateChange', focusJS);
document.onkeydown = pushButton_keydown;
document.onkeyup = pushButton_keyup;
document.ontouchstart = pushButton_touch;
//player.addEventListener('onStateChange', pushButton2);//カーソルのフォーカスがplayer内の場合キーイベントが呼べないため、onStageChange時に起動するイベントリスナー関数も用意する
//function pushButton2(event){if(event.data == 2){sndPush.play();}}//スペースキーを押下->動画が停止(これをonStageChangeが取得)->音が鳴るという流れになるため、押下から音が鳴るまで若干遅延が生まれてしまう
//解答の設定
correctAns = [];
correctAns[0] = "1";
correctAns[1] = "2";
correctAns[2] = "3";
//関数の定義
function focusJS(event){//再生開始後に必ずカーソルのフォーカスをjs描画範囲内に移動すれば、いつでもキーイベントが呼び出せる
    if(event.data == 1){
        document.getElementById("ansbtn").focus();
        document.getElementById("ansbtn").blur();
    }
}
function pushButton_keydown(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 1){
            sndPush.play(); 
            player.pauseVideo();
            document.getElementById("anscol").focus();
            ansCol.value = "";
            pushBool = 1;    
        }
    }
}
function pushButton_keyup(){
    if(event.keyCode == 32){
        if(pushBool == 1){
            document.getElementById("anscol").focus();
            ansCol.value = "";          
            pushBool = 0;  
        }
    }
}
function pushButton_touch(){
    if(player.getPlayerState() == 1){
        sndPush.play();
        player.pauseVideo();
        document.getElementById("anscol").focus();
        ansCol.value = "";                
    }
}
checkAnswer = function(correctAns, cntO, cntX){
    var ans = ansCol.value; 
    if(ans.valueOf() === correctAns.valueOf()){
        sndO.play();
        cntO += 1;
    }else{
        sndX.play();
        cntX += 1;
    }
    document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
    player.playVideo();
    return [cntO, cntX];
}

0
00:00:00,200 --> 00:00:00,300
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
document.getElementById("ansbtn").focus();//再生直後にカーソルのフォーカスをjsの描画範囲(のボタンUI)に移動する->すぐにキーイベントが呼び出せるようになる
document.getElementById("ansbtn").blur(); //ボタン自体にフォーカスをしている意味はないため、すぐにbulrでそれを解除
document.getElementById("numques").innerHTML = "クイズ対決";
document.getElementById("numox").innerHTML = "◯: 0 ✖: 0";
ansCol.value = "ここに解答を入力して下さい";
ansBtn.innerHTML = "解答を送信";

0
00:00:05,000 --> 00:00:06,000
var cntQues = 1;
cntO = 0; cntX = 0;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[0], cntO, cntX) }, 1000 ); };

0
00:00:10,000 --> 00:00:11,000
var cntQues = 2;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[1], cntO, cntX) }, 1000 ); };

0
00:00:15,000 --> 00:00:16,000
var cntQues = 3;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[2], cntO, cntX) }, 1000 ); };