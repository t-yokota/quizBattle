0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
//crateElement
text = document.createElement("h1");        //動画のタイトルを表示
subTex = document.createElement("h2");      //説明文等を表示
numOX = document.createElement("h1");       //◯正解数と✖不正解数を表示
ansCol = document.createElement("textarea");//解答を入力するテキストエリア
ansBtn = document.createElement("button");  //解答を送信するボタン
sndPush = document.createElement("audio");  //ボタンの押下音
sndO = document.createElement("audio");     //正解音
sndX = document.createElement("audio");     //不正解音
//idを用意
text.id = "text";
subTex.id = "subtex";
numOX.id = "numox";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
//音のデータを指定
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//textNodeを作成し，はじめに作成したElementに追加
_text = document.createTextNode("");
_subTex = document.createTextNode("");
_numOX = document.createTextNode("");
text.appendChild(_text);
subTex.appendChild(_subTex);
numOX.appendChild(_numOX);
//
document.getElementsByTagName("body")[0].appendChild(text);
document.getElementsByTagName("body")[0].appendChild(subTex);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
//
document.onkeydown = pushButton_keydown;
document.onkeyup = pushButton_keyup;
document.ontouchstart = pushButton_touch;
//
player.addEventListener('onStateChange', focusJS);
//解答の設定
correctAns = [];
correctAns[0] = "1";
correctAns[1] = "2";
correctAns[2] = "3";
//関数の定義
function focusJS(event){//再生開始後に必ずカーソルのフォーカスをjs描画範囲内に移動し、キーイベントが呼び出せるようにする
    if(event.data == 1){
        document.getElementById("ansbtn").focus();
        document.getElementById("ansbtn").blur();
    }
}
function pushButton_keydown(){
    if(event.keyCode == 32){
        //ボタンチェック（問題開始前に動画を自動停止->ボタンチェック後に再び再生）
        if(player.getPlayerState() == 2){
            if(index == 2){
                sndPush.play();
                window.setTimeout( function(){ sndO.play() }, 700 );
                window.setTimeout( function(){ player.playVideo() }, 1000 );
            }
        }
        //押し（問題中に動画を停止）
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
        //押し（キーを離した瞬間に解答欄にフォーカス）
        if(pushBool == 1){
            document.getElementById("anscol").focus();
            ansCol.value = "";          
            pushBool = 0;  
        }
    }
}
function pushButton_touch(){
    //ボタンチェック
    if(player.getPlayerState() == 2){
        if(index == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 700 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
    //押し
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
document.getElementById("text").innerHTML = "quizBattle.srt.js";
document.getElementById("subtex").innerHTML = "動画中の相手とクイズ対決";
ansCol.value = "ここに解答を入力して下さい";
ansBtn.innerHTML = "解答を送信";
//TextNodeの内容をdoOnce内から隔離し、他のindex内でinnerHTMLを用いて編集する
//これにより、動画をはじめに戻したときに表示をリセットすることができる

2
00:00:04,000 --> 00:00:04,100
//ボタンチェック
player.pauseVideo();
document.getElementById("text").innerHTML = "ボタンチェック";
document.getElementById("subtex").innerHTML = "スペースキーを押してボタンの動作を確認してください";
document.getElementById("ansbtn").focus();//カーソルのフォーカスをjsの描画範囲(のボタンUI)に移動する->キーイベントが呼び出せるようになる
document.getElementById("ansbtn").blur(); //ボタン自体にフォーカスをしている意味はないため、すぐにbulrでそれを解除

3
00:00:05,000 --> 00:00:06,000
//第１問
var cntQues = 1;
cntO = 0; cntX = 0;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtex").innerHTML = "解答はすべてひらがなと半角数字で入力ください";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[0], cntO, cntX) }, 1000 ); };

4
00:00:10,000 --> 00:00:11,000
//第２問
var cntQues = 2;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtex").innerHTML = "解答はすべてひらがなと半角数字で入力ください";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[1], cntO, cntX) }, 1000 ); };

5
00:00:15,000 --> 00:00:16,000
//第３問
var cntQues = 3;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtex").innerHTML = "解答はすべてひらがなと半角数字で入力ください";
document.getElementById("numox").innerHTML = "◯: "+cntO+" ✖: "+cntX;    
ansBtn.onclick = function(){ window.setTimeout( function(){ [cntO, cntX] = checkAnswer(correctAns[2], cntO, cntX) }, 1000 ); };