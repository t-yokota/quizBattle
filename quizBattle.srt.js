0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
title = document.createElement("h1");       //動画のタイトルを表示
subTex = document.createElement("h2");      //その他文章を表示
numOX = document.createElement("h1");       //◯正解数と✖不正解数を表示
ansCol = document.createElement("textarea");//解答を入力するテキストエリア
ansBtn = document.createElement("button");  //解答を送信するボタン
sndPush = document.createElement("audio");  //ボタンの押下音
sndO = document.createElement("audio");     //正解音
sndX = document.createElement("audio");     //不正解音
title.id = "title";
subTex.id = "subtex";
numOX.id = "numox";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
_title = document.createTextNode("");
_subTex = document.createTextNode("");
_numOX = document.createTextNode("");
title.appendChild(_title);
subTex.appendChild(_subTex);
numOX.appendChild(_numOX);
document.getElementsByTagName("body")[0].appendChild(title);
document.getElementsByTagName("body")[0].appendChild(subTex);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
document.onkeydown = pushButton_keydown;
document.onkeyup = pushButton_keyup;
document.ontouchstart = pushButton_touch;
player.addEventListener('onStateChange', focusJS);
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
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play(); player.playVideo(); }, 2000 );
        }
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

1
00:00:00,100 --> 00:00:00,200
//TextNodeの内容をdoOnce内から隔離し、他のindex内でinnerHTMLを用いて編集する
//これにより、動画をはじめに戻したときに表示をリセットすることができる
document.getElementById("title").innerHTML = "クイズ対決";
document.getElementById("subtex").innerHTML = "サブタイトル";
ansCol.value = "ここに解答を入力して下さい";
ansBtn.innerHTML = "解答を送信";

2
00:00:04,000 --> 00:00:04,100
player.pauseVideo();
document.getElementById("subtex").innerHTML = "スペースキーを押してボタンの動作を確認してください";
document.getElementById("ansbtn").focus();//カーソルのフォーカスをjsの描画範囲(のボタンUI)に移動する->キーイベントが呼び出せるようになる
document.getElementById("ansbtn").blur(); //ボタン自体にフォーカスをしている意味はないため、すぐにbulrでそれを解除

0
00:00:05,000 --> 00:00:06,000
var cntQues = 1;
cntO = 0; cntX = 0;
document.getElementById("subtex").innerHTML = "第"+cntQues+"問";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[0], cntO, cntX) }, 1000 ); };

0
00:00:10,000 --> 00:00:11,000
var cntQues = 2;
document.getElementById("subtex").innerHTML = "第"+cntQues+"問";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[1], cntO, cntX) }, 1000 ); };

0
00:00:15,000 --> 00:00:16,000
var cntQues = 3;
document.getElementById("subtex").innerHTML = "第"+cntQues+"問";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[2], cntO, cntX) }, 1000 ); };