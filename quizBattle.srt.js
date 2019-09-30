0
00:00:00,000 --> 00:00:00,999
/* CAUTION : 字幕区間ごとにスコープは独立している */
/* 各種宣言 */
doOnce[index] = true;
//
var myApp = {
    state: {
        ButtonCheck  : 0, //ボタンチェックの待機
        Question     : 1, //問い読み中（早押し可能）
        MyAnswer     : 2, //自分が解答権を所持（解答の入力と送信が可能）
        OthersAnswer : 3, //他者が解答権を所持（早押し不可）
        Talk         : 4, //導入,解説,閑話,締めなど（コントロールバーの操作が可能）
    },
    elem: { //elements
        text    : document.createElement("h1"),       //動画タイトル等
        subText : document.createElement("h2"),       //動画の説明文等
        numOX   : document.createElement("h1"),       //◯正解数と✖不正解数
        ansCol  : document.createElement("textarea"), //解答を入力するテキストエリア
        ansBtn  : document.createElement("button"),   //解答を送信するボタン
        br      : document.createElement("br"),       //改行用
        sndPush : document.createElement("audio"),    //ボタンの押下音
        sndO    : document.createElement("audio"),    //正解音
        sndX    : document.createElement("audio")     //不正解音
    },
    val: { //values
        numQues     : 0,  //設問番号
        cntO        : 0,  //合計正答数
        cntX        : 0,  //合計誤答数
        ansArray    : [], //正答リスト
        /* 早押しボタン用のキー設定用 */
        btnCode     : 32, //スペースキー
        /* 解答回数の管理用(１問あたり) */
        cntPush     : 0, //解答した回数
        limPush     : 5, //1問あたりの解答可能な回数
        /* 解答時間の管理用(１問あたり) */
        limTime     : 20000, //[ms], 解答の制限時間
        elapsedTime : 0,     //[ms], 解答権取得時の経過時間
        /* 状態遷移の管理用 */
        status      : this.state.Talk, //現在の状態
        cntIndex    : 1,               //字幕区間のカウント
        correctBool : false,           //答え合わせ結果(結果に応じて状態遷移)
        keyDownBool : false,           //keydown->keyupの整順用(状態遷移時のキーイベント)
        /* コントロールバーの監視用 */
        currTime:{ //動画の時間(再生位置)
            playing : 0, //再生中に取得
            stopped : 0, //停止時に取得
        },
        watchedTime : 0, //視聴済みの範囲
        diffTime    : 0, //視聴済みの範囲と再生位置の差分
    },
};
//
//elementを表示
document.getElementsByTagName("body")[0].appendChild(myApp.elem.text);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.subText);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansCol);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.br);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.ansBtn);
document.getElementsByTagName("body")[0].appendChild(myApp.elem.numOX);
//
//textNodeを作成してelementに追加
var node_text    = document.createTextNode("");
var node_subText = document.createTextNode("");
var node_numOX   = document.createTextNode("");
myApp.elem.text.appendChild(node_text);
myApp.elem.subText.appendChild(node_subText);
myApp.elem.numOX.appendChild(node_numOX);
//
//elementの初期値の設定
myApp.elem.text.innerHTML    = "quizBattle.srt.js";     //動画タイトル
myApp.elem.subText.innerHTML = "動画の相手とクイズ対決"; //動画の説明
myApp.elem.ansCol.value      = "ここに解答を入力";
myApp.elem.ansBtn.innerHTML  = "解答を送信";
myApp.elem.ansCol.disabled   = true;
myApp.elem.ansBtn.disabled   = true;
//
//audioデータの指定
myApp.elem.sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
myApp.elem.sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
myApp.elem.sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//
//正答リストの指定・読み込み
var ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer_UTF-8.csv"; //UTF-8
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
    /* スペースキーが押されたとき */
    if(event.keyCode == myApp.val.btnCode){
        /* ボタンチェック待機状態のとき */
        if(myApp.val.status == myApp.state.ButtonCheck){ 
            buttonCheck(myApp.elem);
            myApp.val.status = myApp.state.Talk;
            player.playVideo();
        }
        /* 問い読み中状態のとき */
        if(myApp.val.status == myApp.state.Question && myApp.val.keyDownBool == false){
            pushButton(myApp.val, myApp.elem);
            myApp.val.status = myApp.state.MyAnswer;
            myApp.val.keyDownBool = true;
            player.pauseVideo();
        }
    }
}
function myKeyUpEvent(){
    /* スペースキーが押されたとき */
    if(event.keyCode == myApp.val.btnCode){
        /* 自分が解答権を所持＋押し直後の状態のとき */
        if(myApp.val.status == myApp.state.MyAnswer && myApp.val.keyDownBool == true){
            focusToAnsCol(myApp.elem);
            myApp.val.keyDownBool = false;
        }
    }
}
//
//動画の再生・停止時のイベントリスナーの設定
player.addEventListener('onStateChange', myEventListener);
function myEventListener(){
    /* 再生時 */
    if(player.getPlayerState() == 1){
        /* 時間取得 */
        myApp.val.currTime.playing = player.getCurrentTime();
        getWatchedTime(myApp.val);
        /* 自分が解答権を所持した状態のとき */
        if(myApp.val.status == myApp.state.MyAnswer){
            /* 解答を送信していないのに動画が再生されたときの処理 */
            /* 一時停止 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生 */
            player.pauseVideo();
            checkAnswer(myApp.val, myApp.elem);
            if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                myApp.val.status = myApp.state.Talk;
            }else{
                myApp.val.status = myApp.state.Question;
            }
            player.playVideo();
        }
        /* 問い読み中状態のとき */
        if(myApp.val.status = myApp.state.Question){
            /* コントロールバーが操作されたときの処理 */
            /* シークバーによる再生位置のジャンプ -> 無効 */
            myApp.val.diffTime = Math.abs(myApp.val.currTime.playing - myApp.val.watchedTime)
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
        /* それ以外の状態のとき */
        }else{
            /* コントロールバーが操作されたときの処理 */
            /* シークバーによる再生位置のジャンプ -> 前に戻る場合のみ有効 */
            myApp.val.diffTime = myApp.val.currTime.playing - myApp.val.watchedTime;
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
        }
    }
    /* 停止時 */
    if(player.getPlayerState() == 2){
        /* 時間取得 */
        myApp.val.currTime.stopped = player.getCurrentTime();
        /* 問い読み中状態のとき */
        if(myApp.val.status == myApp.state.Question){
            /* コントロールバーが操作されたときの処理 */
            /* 動画の一時停止 -> 無効 & シークバーによる再生位置のジャンプ -> 無効 */
            myApp.val.diffTime = Math.abs(myApp.val.currTime.stopped - myApp.val.watchedTime);
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
            }
            player.playVideo();
        /* それ以外の状態のとき */
        }else{
            /* コントロールバーが操作されたときの処理 */
            /* 動画の一時停止 -> 有効 & シークバーによる再生位置のジャンプ -> 前に戻る場合のみ有効 */
            myApp.val.diffTime = myApp.val.currTime.stopped - myApp.val.watchedTime;
            if(myApp.val.diffTime > 1.0){
                player.seekTo(myApp.val.watchedTime);
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
        myApp.val.currTime.playing = player.getCurrentTime();
        getWatchedTime(myApp.val);
    }
    /* 自分が解答権を所持した状態のとき */
    if(myApp.val.status == myApp.state.MyAnswer){
        /* 解答権を所持したまま一定時間経過したときの処理 */
        /* 一定時間経過 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生 */
        myApp.val.elapsedTime += interval;
        myApp.elem.subText.innerHTML = "あと"+Math.floor((myApp.val.limTime-myApp.val.elapsedTime)/1000)+"秒で解答を送信してください";
        if(myApp.val.elapsedTime >= myApp.val.limTime){
            checkAnswer(myApp.val, myApp.elem);
            if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
                myApp.val.status = myApp.state.Talk;
            }else{  
                myApp.val.status = myApp.state.Question;
            }
            player.playVideo();
        }
    }else{
        myApp.val.elapsedTime = 0;
        focusToJS(myApp.elem);
    }
    /* 自分が解答権を所持していない状態のとき */
    if(myApp.val.status != myApp.state.MyAnswer){
        if(index == myApp.val.cntIndex && player.getPlayerState() == 1){
            srtFuncArray.shift()();
            myApp.val.cntIndex += 1;
        }
    }
    /* デバッグ用 */
    //printAllParam(myApp.val, myApp.elem);
}
//
//解答送信ボタンのクリックイベントを設定
myApp.elem.ansBtn.onclick = myOnClickEvent;
function myOnClickEvent(){
    /* 自分か解答権を所持した状態のとき */
    if(myApp.val.status == myApp.state.MyAnswer){ 
        /* 解答送信ボタンを押したときの処理 */
        /* 1秒間を空けてから正誤判定をして適切な状態へ移行 -> 動画を再生 */
        var btn = this;
        btn.disabled = true;
        window.setTimeout(function(){ checkAnswer(myApp.val, myApp.elem); }, 1000);
        busySleep(1000);
        if(myApp.val.correctBool == true || myApp.val.limPush - myApp.val.cntPush == 0){
            myApp.val.status = myApp.state.Talk;
        }else{  
            myApp.val.status = myApp.state.Question;
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
function focusToJS(elements){
    elements.ansCol.disabled = false;
    elements.ansCol.focus();
    elements.ansCol.blur();
    elements.ansCol.disabled = true;
}
/**
 * ボタンチェックのキーイベント用の関数 
 * 特定のキーが押されたら押下音+正解音を流して動画を再開する
 */
function buttonCheck(elements){
    elements.sndPush.play();
    window.setTimeout( function(){ elements.sndO.play() }, 800 );
}
/**
 * 早押しのキーイベント用の関数
 * 問題中に特定のキーが押下されたら押下音を再生して解答回数を記録
 */
function pushButton(values, elements){
    elements.sndPush.play();
    values.cntPush++;
}
/**
 * 解答入力欄への遷移するキーイベント用の関数
 * 早押し後のkeyup時に解答欄にフォーカスし、解答の送信と正誤判定を可能にする
 */
function focusToAnsCol(elements){
    elements.ansBtn.disabled = false;
    elements.ansCol.disabled = false;
    elements.ansCol.value = "";
    elements.ansCol.focus();
}
/**
 * 正誤判定用の関数
 */
function checkAnswer(values, elements){
    var answer = elements.ansCol.value;
    var length = values.ansArray[values.numQues-1].length;
    for(var i = 0; i < length; i++){
        if(answer.valueOf() === values.ansArray[values.numQues-1][i].valueOf()){
            values.correctBool = true;
        }
    }
    if(values.correctBool == true){
        elements.sndO.play();
        values.cntO += 1;
        elements.subText.innerHTML = "正解です！";
    }else{
        elements.sndX.play();
        values.cntX += 1;
        elements.subText.innerHTML = "不正解です！ あと"+(values.limPush-values.cntPush)+"回解答できます。";
    }
    elements.numOX.innerHTML = "◯: "+values.cntO+", ✖: "+values.cntX;  
    elements.ansCol.disabled = true;
    elements.ansBtn.disabled = true;
}
/**
 * 視聴範囲取得用の関数
 */
function getWatchedTime(values){
    if(0.0 < values.currTime.playing - values.watchedTime && values.currTime.playing - values.watchedTime < 1.0){
        values.watchedTime = values.currTime.playing;
    }
}
function busySleep(waitMsec) {
    var startMsec = new Date();
    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}
/**
 * パラメータ表示（デバッグ用） 
 */
hist_status = 4;
function printAllParam(values, elements){
    if(values.status != hist_status - Math.floor(hist_status/10)*10 && hist_status != -1){
        hist_status = hist_status * 10 + values.status;
    }
    elements.text.innerHTML = hist_status;
    elements.subText.innerHTML = values.keyDownBool;
    elements.text.innerHTML = index;
    elements.text.innerHTML = "answer: "+values.ansArray[values.numQues-1][2].valueOf();
    elements.subText.innerHTML = 
        "Stateus: "+values.status+"<br>"+
        "Time1: "+values.currTime.playing.toFixed(3)+"<br>"+
        "Time2: "+values.currTime.stopped.toFixed(3)+"<br>"+
        "WatchedTime: "+values.watchedTime.toFixed(3)+"<br>"+
        "diffTime: "+values.diffTime.toFixed(3)+"<br>"+
        "limTime: "+(values.limTime-Math.floor(values.elapsedTime/1000))+"<br>"+
        "correctBool: "+values.correctBool+"<br>"+
        "index: "+values.cntIndex;
}
var srtFuncArray = [
    function(){
        /* ボタンチェック開始 */
        myApp.val.status = myApp.state.ButtonCheck;
        player.pauseVideo();
        //
        myApp.elem.text.innerHTML = "ボタンチェック";
        myApp.elem.subText.innerHTML = "スペースキーが早押しボタンです。<br>キーを押して音と動作を確認してください。";
    },
    function(){
        /* 第１問 */
        myApp.val.status = myApp.state.Question;
        //
        myApp.val.numQues = 1;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
        myApp.elem.numOX.innerHTML = "◯: "+myApp.val.cntO+", ✖: "+myApp.val.cntX;
    },
    function(){
        /* 閑話1 */
        myApp.val.status = myApp.state.Talk;
        myApp.elem.subText.innerHTML = "解説";
    },
    function(){
        /* 第２問 */
        myApp.val.status = myApp.state.Question;
        //
        myApp.val.numQues = 2;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
    },
    function(){
        /* 閑話2 */
        myApp.val.status = myApp.state.Talk;
        myApp.elem.subText.innerHTML = "解説";
    },
    function(){
        /* 第３問 */
        myApp.val.status = myApp.state.Question;
        //
        myApp.val.numQues = 3;
        myApp.val.cntPush = 0;
        myApp.elem.text.innerHTML = "第"+myApp.val.numQues+"問";
        myApp.elem.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
    },
    function(){
        /* 閑話3 */
        myApp.val.status = myApp.state.Talk;
        myApp.elem.subText.innerHTML = "解説";
    }
];

1
00:00:01,000 --> 00:00:02,999
// /* ボタンチェック開始 */
// doOnce[index] = true;
// myVals.status = myState.ButtonCheck;
// player.pauseVideo();
// //
// myElems.text.innerHTML = "ボタンチェック";
// myElems.subText.innerHTML = "スペースキーが早押しボタンです。<br>キーを押して音と動作を確認してください。";

2
00:00:03,000 --> 00:00:06,999
// /* 第１問 */
// doOnce[index] = true;
// myVals.status = myState.Question;
// //
// myVals.numQues = 1;
// myVals.cntPush = 0;
// myElems.text.innerHTML = "第"+myVals.numQues+"問";
// myElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
// myElems.numOX.innerHTML = "◯: "+myVals.cntO+", ✖: "+myVals.cntX;

3
00:00:07,000 --> 00:00:10,999
// /* 閑話1 */
// myVals.status = myState.Talk
// myElems.subText.innerHTML = "解説";

4
00:00:11,000 --> 00:00:14,999
// /* 第２問 */
// doOnce[index] = true;
// myVals.status = myState.Question;
// //
// myVals.numQues = 2;
// myVals.cntPush = 0;
// myElems.text.innerHTML = "第"+myVals.numQues+"問";
// myElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

5
00:00:15,000 --> 00:00:18,999
// /* 閑話2 */
// myVals.status = myState.Talk
// myElems.subText.innerHTML = "解説";

6
00:00:19,000 --> 00:00:22,999
// /* 第３問 */
// doOnce[index] = true;
// myVals.status = myState.Question;
// //
// myVals.numQues = 3;
// myVals.cntPush = 0;
// myElems.text.innerHTML = "第"+myVals.numQues+"問";
// myElems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

7
00:00:23,000 --> 00:00:26,999
// /* 閑話3 */
// myVals.status = myState.Talk
// myElems.subText.innerHTML = "解説";