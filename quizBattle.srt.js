0
00:00:00,000 --> 00:00:00,100
/* 各種宣言 */
doOnce[index] = true;
//
//namespaceを作成
gElems = {}; //namespave for global elements
gVals  = {}; //namespave for global values
gFuncs = {}; //namespave for global functions
//
//elementを作成
gElems.text    = document.createElement("h1");       //動画タイトル等
gElems.subText = document.createElement("h2");       //説明文等
gElems.numOX   = document.createElement("h1");       //◯正解数と✖不正解数
var ansCol     = document.createElement("textarea"); //解答を入力するテキストエリア
var ansBtn     = document.createElement("button");   //解答を送信するボタン
var br         = document.createElement("br");       //改行用
var sndPush    = document.createElement("audio");    //ボタンの押下音
var sndO       = document.createElement("audio");    //正解音
var sndX       = document.createElement("audio");    //不正解音
//
//elementを表示
document.getElementsByTagName("body")[0].appendChild(gElems.text);
document.getElementsByTagName("body")[0].appendChild(gElems.subText);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(br);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(gElems.numOX);
//
//textNodeを作成してelementに追加
var node_text    = document.createTextNode("");
var node_subText = document.createTextNode("");
var node_numOX   = document.createTextNode("");
gElems.text.appendChild(node_text);
gElems.subText.appendChild(node_subText);
gElems.numOX.appendChild(node_numOX);
//
//audioデータの指定
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
//正答リストの読み込み
var ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/quizknock/geinoujinQuiz/answer_geinoujinQuiz.csv"; //UTF-8
var ansArray;
var CSVtoArray = function(str){
    var array = new Array();
    var tmp = str.split("\n");
    for (var i = 0; i < tmp.length; i++) {
        array[i] = tmp[i].split(",");
    }
    return array;
}
var file = new XMLHttpRequest();
file.open("get", ansCSV, true);
file.send(null);
file.onload = function(){
    ansArray = CSVtoArray(file.responseText);
}
//
//キーイベント発生用のイベントリスナー関数
//...動画の再生・停止後に必ずjsの描画範囲内にフォーカスする
var focusToJS = function(){
    ansCol.disabled = false;
    ansCol.focus();
    ansCol.blur();
    ansCol.disabled = true;
}
//
//ボタンチェック用のキーイベント関数
//...スペースキーが押されたら押下＋正解音を再生＋動画を再生する
gVals.enableBtnCheck = false;
var buttonCheck = function(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
}
//
//早押し用のキーイベント関数
//...問題中にスペースキーが押下されると動画を停止する
var limPush   = 10; //1問あたりの解答可能数
gVals.cntPush = 0; //解答回数
gVals.enablePushBtn = false; //trueのとき早押し可能
var enableToAnsCol  = false; //trueのとき解答欄に遷移可能
var enableCheckAns  = false; //trueのとき答え合わせ可能
var pushButton = function(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 1){
            if(limPush-gVals.cntPush > 0){ //上限(limPush)を超えたら押し不可
                sndPush.play();
                gVals.cntPush++;
                gVals.enablePushBtn  = false;
                enableToAnsCol       = true;
                enableCheckAns       = false;
                player.pauseVideo();
            }
        }
    }
}
//
//解答入力への遷移用のキーイベント関数
//...押し後のkeyup時に解答欄にフォーカス、解答の送信と正誤判定を可能にする(enableCheckAnsをtrueに)
var focusToAnsCol = function(){
    if(enableToAnsCol == true){
        if(event.keyCode == 32){
            //subText.innerHTML = "aaa";
            ansBtn.disabled = false;
            ansCol.disabled = false;
            ansCol.value = "";
            ansCol.focus();
            gVals.enablePushBtn = false;
            enableToAnsCol      = false;
            enableCheckAns      = true;
        }
    }
}
//
//正誤判定用の関数
gVals.cntO = 0;    //正答数
gVals.cntX = 0;    //誤答数
gVals.cntQues = 0; //設問番号
var checkAnswer = function(){
    //alert(ansArray[gVals.cntQues-1][0]);
    if(enableCheckAns == true){
        var correctBool = false;
        var answer = ansCol.value;
        var length = ansArray[gVals.cntQues-1].length;
        for(var i = 0; i < length; i++){
            if(answer.valueOf() === ansArray[gVals.cntQues-1][i].valueOf()){
                correctBool = true;
            }
        }
        if(correctBool == true){
            sndO.play();
            gVals.cntO += 1;
            gElems.cntPush = limPush;
            gElems.subText.innerHTML = "正解です！";
            gVals.enablePushBtn = false;
        }else{
            sndX.play();
            gVals.cntX += 1;
            gElems.subText.innerHTML = "不正解です！ あと"+(limPush-gVals.cntPush)+"回解答できます。";
            gVals.enablePushBtn = true;
        }
        gElems.numOX.innerHTML = "◯: "+gVals.cntO+", ✖: "+gVals.cntX;  
    }
    ansCol.disabled = true;
    ansBtn.disabled = true;
    enableToAnsCol = false;
    enableCheckAns = false;
    player.playVideo();
}
//
//解答送信用の関数
//...① 解答送信ボタンを押すと１秒後に正誤判定を行う。押された後はボタンをdisabledにする
var sendAnswer1 = function(){
    var btn = this;
    btn.disabled = true;
    window.setTimeout( checkAnswer, 1000 );
};
//...② 解答送信ボタンを押さずに動画を再生した場合、その時点の入力内容で正誤判定を行う
var sendAnswer2 = function(){
    if(player.getPlayerState() == 1 && enableCheckAns == true){
        checkAnswer();
    }
}
//
//コントロールバーの使用制限
//...シークバーによる再生位置のジャンプ不可
var currTime1 = 0;
var currTime2 = 0;
var watchedTime = 0;
//時間取得（再生中） 
var getTime_playing = function(){
    if(player.getPlayerState() == 1){
        currTime1 = player.getCurrentTime();
        if(0.0 < currTime1 - watchedTime && currTime1 - watchedTime < 1.0){
           watchedTime = currTime1;
        }
        gElems.subText.innerHTML = currTime1+", "+currTime2+","+watchedTime;
    }
}
//時間取得（停止時）
var getTime_stopped = function(){
    if(player.getPlayerState() == 2){
        currTime2 = player.getCurrentTime();
        gElems.subText.innerHTML = currTime1+", "+currTime2+","+watchedTime;
    }
}
//問題中は動画の停止(“押し”による停止は除く)とシークバーの操作を禁止する
var checkJumpBySeekBar = function(){
    //Time1とTime2が一致しない場合，シークバーによるジャンプと判断する
    //問題中
    if(gVals.enablePushBtn == true){
        if(player.getPlayerState() == 1){
            getTime_playing();
            if(Math.abs(currTime1 - watchedTime) > 1.0){
                player.seekTo(watchedTime);
            }
        }
        if(player.getPlayerState() == 2){
            if(Math.abs(currTime2 - watchedTime) > 1.0){
                player.seekTo(watchedTime);
                currTime2 = watchedTime;
                player.playVideo();
            }
        }
    //閑話中
    }else{
        if(player.getPlayerState() == 1){
            getTime_playing();
            if(currTime1 - watchedTime > 1.0){
                player.seekTo(watchedTime);
            }
        }
        if(player.getPlayerState() == 2){
            if(currTime2 - watchedTime > 1.0){
                player.seekTo(watchedTime);
                currTime2 = watchedTime;
                player.playVideo();
            }
        }
    }
}
//
var myKeyDownEvent = function(){
    if(gVals.enableBtnCheck == true){ buttonCheck(); }
    if(gVals.enablePushBtn  == true){ pushButton(); }
}
var myEventListener = function(){
    focusToJS();
    sendAnswer2();
    getTime_stopped();
    checkJumpBySeekBar();
}
document.onkeydown = myKeyDownEvent;
document.onkeyup   = focusToAnsCol;
//
ansBtn.onclick = sendAnswer1;
// 
setInterval(getTime_playing, 100);
player.addEventListener('onStateChange', myEventListener);
// 
gElems.text.innerHTML = "quizBattle.srt.js";
gElems.subText.innerHTML = "動画の中の相手とクイズ対決";
ansCol.value = "ここに解答を入力";
ansBtn.innerHTML = "解答を送信";
ansCol.disabled = true;
ansBtn.disabled = true;

1
00:00:01,000 --> 00:00:01,100
/* ボタンチェック開始 */
doOnce[index] = true;
gVals.enableBtnCheck = true;
//
gElems.text.innerHTML = "ボタンチェック";
gElems.subText.innerHTML = "スペースキーが早押しボタンです。キーを押して音と動作を確認してください。";
//
//動画の停止
player.pauseVideo();

2
00:00:01,100 --> 00:00:01,200
/* ボタンチェック終了 */
doOnce[index] = true;
gVals.enableBtnCheck = false;

3
00:00:03,000 --> 00:00:06,900
/* 第１問 */
doOnce[index] = true;
gVals.enablePushBtn = true;
//
gVals.cntQues = 1;
gVals.cntPush = 0;
gElems.text.innerHTML = "第"+gVals.cntQues+"問";
gElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
gElems.numOX.innerHTML = "◯: "+gVals.cntO+", ✖: "+gVals.cntX;

4
00:00:07,000 --> 00:00:10,900
/* 閑話1 */
gVals.enablePushBtn = false;

5
00:00:11,000 --> 00:00:14,900
/* 第２問 */
doOnce[index] = true;
gVals.enablePushBtn = true;
//
gVals.cntQues = 2;
gVals.cntPush = 0;
gElems.text.innerHTML = "第"+gVals.cntQues+"問";
gElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

6
00:00:15,000 --> 00:00:18,900
/* 閑話2 */
gVals.enablePushBtn = false;

7
00:00:19,000 --> 00:00:22,900
/* 第３問 */
doOnce[index] = true;
gVals.enablePushBtn = true;
//
gVals.cntQues = 3;
gVals.cntPush = 0;
gElems.text.innerHTML = "第"+gVals.cntQues+"問";
gElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

8
00:00:23,000 --> 00:00:26,900
/* 閑話3 */
gVals.enablePushBtn = false;
