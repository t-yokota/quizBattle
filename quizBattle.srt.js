0
00:00:00,000 --> 00:00:00,999
/* CAUTION : 字幕区間ごとにスコープは独立している */
/* 各種宣言 */
doOnce[index] = true;
//
var myApp = {
    state: { 
        ButtonCheck   : 0, //ボタンチェックの待機
        Question      : 1, //問い読み中（早押し可能）
        MyAnswer      : 2, //自分が解答権を所持（解答の入力と送信が可能）
        OthersAnswer  : 3, //他者が解答権を所持（早押し不可）
        Talk          : 4, //導入,解説,閑話,締めなど（コントロールバーの操作が可能）
    },
    elem: { //elements
        text    = document.createElement("h1"),       //動画タイトル等
        subText = document.createElement("h2"),       //動画の説明文等
        numOX   = document.createElement("h1"),       //◯正解数と✖不正解数
        ansCol  = document.createElement("textarea"), //解答を入力するテキストエリア
        ansBtn  = document.createElement("button"),   //解答を送信するボタン
        br      = document.createElement("br"),       //改行用
        sndPush = document.createElement("audio"),    //ボタンの押下音
        sndO    = document.createElement("audio"),    //正解音
        sndX    = document.createElement("audio")     //不正解音
    },
    val: { //values
        numQues  = 0,  //設問番号
        cntO     = 0,  //合計正答数
        cntX     = 0,  //合計誤答数
        ansArray = [], //正答リスト
        //
        /* 早押し用のキーボタン */
        btnCode = 32, //スペースキー
        //
        /* 解答回数の管理(１問あたり) */
        cntPush = 0, //解答した回数
        limPush = 5, //1問あたりの解答可能な回数
        //
        /* 解答時間の管理 */
        limTime     = 20000, //[ms], 解答の制限時間
        elapsedTime = 0,     //[ms], 解答権取得時の経過時間
        //
        /* 状態遷移の管理 */
        status      = this.state.Talk, //現在の状態
        correctBool = false,           //答え合わせ結果(結果に応じて状態遷移)
        keyDownBool = false,           //keydown->keyupの整順用(状態遷移時のキーイベント)
        //
        /* コントロールバーの監視 */
        currTime:{ //動画の時間(再生位置)
            playing = 0, //再生中に取得する時間
            stopped = 0, //停止時に取得する時間
        },
        watchedTime = 0, //視聴済みの範囲
        diffTime    = 0, //視聴済みの範囲と再生位置の差分
    },
}
//
//elementを表示
document.getElementsByTagName("body")[0].appendChild(myApp.elems.text);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.subText);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.ansCol);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.br);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.ansBtn);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.numOX);
//
//textNodeを作成してelementに追加
var node_text    = document.createTextNode("");
var node_subText = document.createTextNode("");
var node_numOX   = document.createTextNode("");
myApp.elems.text.appendChild(node_text);
myApp.elems.subText.appendChild(node_subText);
myApp.elems.numOX.appendChild(node_numOX);
//
//elementの初期値の設定
myApp.elems.text.innerHTML    = "quizBattle.srt.js";     //動画タイトル
myApp.elems.subText.innerHTML = "動画の相手とクイズ対決"; //動画の説明
myApp.elems.ansCol.value      = "ここに解答を入力";
myApp.elems.ansBtn.innerHTML  = "解答を送信";
myApp.elems.ansCol.disabled   = true;
myApp.elems.ansBtn.disabled   = true;
//
//audioデータの指定
myApp.elems.sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
myApp.elems.sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
myApp.elems.sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
//正答リストの指定・読み込み
var ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer_UTF-8.csv"; //UTF-8
// var ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/quizknock/geinoujinQuiz/answer_geinoujinQuiz.csv"; //UTF-8
var ansArray;
var file = new XMLHttpRequest();
file.open("get", ansCSV, true);
file.send(null);
file.onload = function(){
    myApp.val.ansArray = CSVtoArray(file.responseText);
}
//
//早押しボタン用のキーコードの設定
//
//早押しのためのキーイベントの設定
document.onkeydown = myKeyDownEvent;
document.onkeyup   = myKeyUpEvent;
function myKeyDownEvent(){
    if(event.keyCode = myApp.val.btnCode){
        /* ボタンチェック待機状態のとき */
        if(myApp.val.status == myApp.state.ButtonCheck){ 
            buttonCheck();
            myApp.val.status = myApp.state.Talk;
            player.playVideo();
        }
        /* 問い読み中状態のとき */
        if(myApp.val.status == myApp.state.Question && myApp.val.keyDownBool == false){
            pushButton(myApp.val.cntPush);
            myApp.val.status = myApp.state.MyAnswer;
            myApp.val.keyDownBool = true;
            player.pauseVideo();
        }
    }
}
function myKeyUpEvent(){
    if(event.keyCode = myApp.val.btnCode){
        /* 自分が解答権を所持した状態のとき */
        if(myApp.val.status == myApp.state.MyAnswer && myApp.val.keyDownBool == true){
            focusToAnsCol();
            keyDownBool = false;
        }
    }
}
//
//動画の再生・停止時のイベントリスナーの設定
player.addEventListener('onStateChange', myEventListener);
function myEventListener(){
    /* 再生されたとき */
    if(player.getPlayerState() == 1){
        /* 時間取得 */
        currTime1 = player.getCurrentTime();
        watchedTime = getWatchedTime(currTime1, watchedTime);
        /* 自分が解答権を所持した状態のとき */
        if(gVals.status == myState.MyAnswer){
            /* 解答を送信していないのに動画が再生されたときの処理 */
            /* 一時停止 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生 */
            player.pauseVideo();
            correctBool = checkAnswer(gVals, gElems);
            if(correctBool == true || limPush - gVals.cntPush == 0){
                gVals.status = myState.Talk;
            }else{
                gVals.status = myState.Question;
            }
            player.playVideo();
        }
        /* 問い読み中状態のとき */
        if(gVals.status == myState.Question){
            /* コントロールバーが操作されたときの処理 */
            /* シークバーによる再生位置のジャンプ -> 無効 */
            diffTime = Math.abs(currTime1 - watchedTime)
            if(diffTime > 1.0){
                player.seekTo(watchedTime);
            }
        /* それ以外の状態のとき */
        }else{
            /* コントロールバーが操作されたときの処理 */
            /* シークバーによる再生位置のジャンプ -> 前に戻る場合のみ有効 */
            diffTime = currTime1 - watchedTime;
            if(diffTime > 1.0){
                player.seekTo(watchedTime);
            }
        }
    }
    /* 停止されたとき */
    if(player.getPlayerState() == 2){
        /* 時間取得 */
        currTime2 = player.getCurrentTime();
        /* 問い読み中状態のとき */
        if(gVals.status == myState.Question){
            /* コントロールバーが操作されたときの処理 */
            /* 動画の一時停止 -> 無効 & シークバーによる再生位置のジャンプ -> 無効 */
            diffTime = Math.abs(currTime2 - watchedTime);
            if(diffTime > 1.0){
                player.seekTo(watchedTime);
            }
            player.playVideo();
        /* それ以外の状態のとき */
        }else{
            /* コントロールバーが操作されたときの処理 */
            /* 動画の一時停止 -> 有効 & シークバーによる再生位置のジャンプ -> 前に戻る場合のみ有効 */
            diffTime = currTime2 - watchedTime;
            if(diffTime > 1.0){
                player.seekTo(watchedTime);
                player.playVideo();
            }
        }      
    }
}
//
//定期実行する関数の設定
setInterval(myIntervalEvent, interval = 100); //[ms]
function myIntervalEvent(){
    /* 再生中のとき */
    if(player.getPlayerState() == 1){
        /* 時間取得 */
        currTime1 = player.getCurrentTime();
        watchedTime = getWatchedTime(currTime1, watchedTime);
    }
    /* 自分が解答権を所持した状態のとき */
    if(gVals.status == myState.MyAnswer){
        /* 解答権を所持したまま一定時間経過したときの処理 */
        /* 一定時間経過 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生 */
        elapsedTime += interval;
        gElems.subText.innerHTML = "あと"+Math.floor((limitTime-elapsedTime)/1000)+"秒で解答を送信してください";
        if(elapsedTime >= limitTime){
            correctBool = checkAnswer(gVals, gElems);
            if(correctBool == true || limPush - gVals.cntPush == 0){
                gVals.status = myState.Talk;
            }else{  
                gVals.status = myState.Question;
            }
            player.playVideo();
        }
    /* それ以外の状態のとき */
    }else{
        elapsedTime = 0;
        focusToJS();
    }
    /* デバッグ用 */
    printAllParam(gVals, gElems);
}
//
//解答送信ボタンのクリックイベントを設定
ansBtn.onclick = myOnClickEvent;
function myOnClickEvent(){
    /* 自分か解答権を所持した状態のとき */
    if(gVals.status == myState.MyAnswer){ 
        /* 解答送信ボタンを押したときの処理 */
        /* 1秒間を空けてから正誤判定をして適切な状態へ移行 -> 動画を再生 */
        var btn = this;
        btn.disabled = true;
        window.setTimeout(function(){ correctBool = checkAnswer(gVals, gElems); }, 1000);
        busySleep(1000);
        if(correctBool == true || limPush - gVals.cntPush == 0){
            gVals.status = myState.Talk;
        }else{
            gVals.status = myState.Question;
        }
        player.playVideo();
    }
}
//
//各種関数の定義
/**
 * csvファイルを読み込んで配列に格納する関数
 * @param {string} str
 * @returns {array} n行m列の配列を返す（n:問題数, m:最大の解答のパターン数）
 */
function CSVtoArray(str){
    var array = new Array();
    var tmp = str.split("\n");
    for (var i = 0; i < tmp.length; i++) {
        array[i] = tmp[i].split(",");
    }
    return array;
}
/**
 * キーイベントを発生させるためのイベントリスナー用の関数 
 * jsの描画範囲内にフォーカスすることで、キーイベントが発生可能な状態にする
 */
function focusToJS(){
    ansCol.disabled = false;
    ansCol.focus();
    ansCol.blur();
    ansCol.disabled = true;
}
/**
 * ボタンチェックのキーイベント用の関数 
 * 特定のキーが押されたら押下音+正解音を流して動画を再開する
 */
function buttonCheck(_myButtonCode){
    if(event.keyCode == _myButtonCode){
        sndPush.play();
        window.setTimeout( function(){ sndO.play() }, 800 );
    }
}
/**
 * 早押しのキーイベント用の関数
 * 問題中に特定のキーが押下されたら押下音を再生して解答回数を記録
 */
function pushButton(_gVals, _myButtonCode){
    if(event.keyCode == _myButtonCode){
        sndPush.play();
        _gVals.cntPush++;
    }
}
/**
 * 解答入力欄への遷移するキーイベント用の関数
 * 早押し後のkeyup時に解答欄にフォーカスし、解答の送信と正誤判定を可能にする
 */
function focusToAnsCol(_myButtonCode){
    if(event.keyCode == _myButtonCode){
        ansBtn.disabled = false;
        ansCol.disabled = false;
        ansCol.value = "";
        ansCol.focus();
    }
}
/**
 * 正誤判定用の関数
 */
function checkAnswer(_gVals, _gElems){
    var answer = ansCol.value;
    var length = ansArray[_gVals.numQues-1].length;
    var correctBool = false;
    for(var i = 0; i < length; i++){
        if(answer.valueOf() === ansArray[_gVals.numQues-1][i].valueOf()){
            correctBool = true;
        }
    }
    if(correctBool == true){
        sndO.play();
        _gVals.cntO += 1;
        _gElems.subText.innerHTML = "正解です！";
    }else{
        sndX.play();
        _gVals.cntX += 1;
        _gElems.subText.innerHTML = "不正解です！ あと"+(limPush-_gVals.cntPush)+"回解答できます。";
    }
    _gElems.numOX.innerHTML = "◯: "+_gVals.cntO+", ✖: "+_gVals.cntX;  
    ansCol.disabled = true;
    ansBtn.disabled = true;
    return correctBool;
}
/**
 * 視聴範囲取得用の関数
 */
function getWatchedTime(_currTime1, _watchedTime){
    if(0.0 < _currTime1 - _watchedTime && _currTime1 - _watchedTime < 1.0){
        _watchedTime = currTime1;
    }
    return _watchedTime;
}
function busySleep(waitMsec) {
    var startMsec = new Date();
    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}
/**
 * パラメータ表示（デバッグ用） 
 */
function printAllParam(_gVals, _gElems){
    gElems.text.innerHTML = index;
    // _gElems.text.innerHTML = "answer: "+ansArray[_gVals.numQues-1][2].valueOf();
    // _gElems.subText.innerHTML = 
    //     "Stateus: "+_gVals.status+"<br>"+
    //     "Time1: "+currTime1.toFixed(3)+"<br>"+
    //     "Time2: "+currTime2.toFixed(3)+"<br>"+
    //     "WatchedTime: "+watchedTime.toFixed(3)+"<br>"+
    //     "diffTime: "+diffTime.toFixed(3)+"<br>"+
    //     "limitTime: "+(limitTime-Math.floor(elapsedTime/1000))+"<br>"+
    //     "correctBool: "+correctBool;
}

1
00:00:01,000 --> 00:00:02,999
/* ボタンチェック開始 */
doOnce[index] = true;
gVals.status = myState.ButtonCheck;
//
gElems.text.innerHTML = "ボタンチェック";
gElems.subText.innerHTML = "スペースキーが早押しボタンです。<br>キーを押して音と動作を確認してください。";
//
//動画の停止
player.pauseVideo();

2
00:00:03,000 --> 00:00:06,999
/* 第１問 */
doOnce[index] = true;
gVals.status = myState.Question;
//
gVals.numQues = 1;
gVals.cntPush = 0;
gElems.text.innerHTML = "第"+gVals.numQues+"問";
gElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
gElems.numOX.innerHTML = "◯: "+gVals.cntO+", ✖: "+gVals.cntX;

3
00:00:07,000 --> 00:00:10,999
/* 閑話1 */
gVals.status = myState.Talk
gElems.subText.innerHTML = "解説";

4
00:00:11,000 --> 00:00:14,999
/* 第２問 */
doOnce[index] = true;
gVals.status = myState.Question;
//
gVals.numQues = 2;
gVals.cntPush = 0;
gElems.text.innerHTML = "第"+gVals.numQues+"問";
gElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

5
00:00:15,000 --> 00:00:18,999
/* 閑話2 */
gVals.status = myState.Talk
gElems.subText.innerHTML = "解説";

6
00:00:19,000 --> 00:00:22,999
/* 第３問 */
doOnce[index] = true;
gVals.status = myState.Question;
//
gVals.numQues = 3;
gVals.cntPush = 0;
gElems.text.innerHTML = "第"+gVals.numQues+"問";
gElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

7
00:00:23,000 --> 00:00:26,999
/* 閑話3 */
gVals.status = myState.Talk
gElems.subText.innerHTML = "解説";