0
00:00:00,000 --> 00:00:00,999
/* CAUTION : 字幕区間ごとにスコープは独立している */
/* 各種宣言 */
doOnce[index] = true;
//
myApp = {
    state: {
        ButtonCheck  : 0, //ボタンチェックの待機
        Question     : 1, //問い読み中（早押し可能）
        MyAnswer     : 2, //自分が解答権を所持（解答の入力と送信が可能）
        OthersAnswer : 3, //他者が解答権を所持（早押し不可能）
        Talk         : 4, //導入,解説,閑話,締めなど（コントロールバーの操作が可能）
    },
    elems: {
        text    : document.createElement("h1"),       //動画タイトル等
        subText : document.createElement("text"),     //動画の説明文等
        numOX   : document.createElement("h1"),       //◯正答数と✖誤答数
        ansCol  : document.createElement("textarea"), //解答を入力するテキストエリア
        ansBtn  : document.createElement("button"),   //解答を送信するボタン
        br1     : document.createElement("br"),      　//改行用
        br2     : document.createElement("br"),      　//改行用
        br3     : document.createElement("br"),      　//改行用
        sndPush : document.createElement("audio"),    //ボタンの押下音
        sndO    : document.createElement("audio"),    //正解音
        sndX    : document.createElement("audio")     //不正解音
    },
    vals: {
        numQues  : 0,  //設問番号
        cntO     : 0,  //合計正答数
        cntX     : 0,  //合計誤答数
        ansArray : [], //正答リスト
        //
        /* 早押しボタン用のキー設定用 */
        btnCode : 32, //スペースキー
        //
        /* 解答回数の管理用(１問あたり) */
        cntPush : 0, //解答した回数
        limPush : 5, //1問あたりの解答可能な回数
        //
        /* 解答時間の管理用(１問あたり) */
        limTime     : 10000, //[ms], 解答の制限時間
        elapsedTime : 0,     //[ms], 解答権取得後の経過時間
        //
        /* 状態遷移の管理用 */
        status      : this.state.Talk, //現在の状態
        cntIndex    : 1,               //字幕区間をカウント
        correctBool : false,           //答え合わせ結果(結果に応じて状態遷移)
        // keyDownBool : false,           //keydown->keyupの整順用(状態遷移時のキーイベント)
        composingBool : false,
        //
        /* コントロールバー使用の監視用 */
        currTime_playing : 0, //再生中に取得する動画位置
        currTime_stopped : 0, //停止時に取得する動画位置
        watchedTime      : 0, //視聴済みの範囲
        diffTime         : 0, //視聴済みの範囲と再生位置の差分
    },
};
//
// focusが存在するelementにidを設定
myApp.elems.ansCol.id = 'anscol';
myApp.elems.ansBtn.id = 'ansbtn';
document.getElementsByTagName("body")[0].id = 'body';
//
// 各elementのフォントサイズ等を設定
myApp.elems.subText.style.fontSize   = '20px'; 
myApp.elems.subText.style.lineHeight = '32px';
myApp.elems.ansCol.style.fontSize    = '20px'; 
myApp.elems.ansBtn.style.fontSize    = '20px'; 
//
//elementを表示
document.getElementsByTagName("body")[0].appendChild(myApp.elems.text);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.subText);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.br1);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.br2);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.ansCol);
document.getElementsByTagName("body")[0].appendChild(myApp.elems.br3);
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
myApp.elems.text.innerHTML    = "quizBattle.srt.js";  //動画タイトル
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
// var ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/develop_change_namespace/answer_UTF-8.csv"; //UTF-8
var ansCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer_UTF-8.csv"; //UTF-8
var ansArray;
var file = new XMLHttpRequest();
file.open("get", ansCSV, true);
file.send(null);
file.onload = function(){
    myApp.vals.ansArray = CSVtoArray(file.responseText);
}
//
document.addEventListener("compositionstart", function(){ myApp.vals.composingBool = true; })
document.addEventListener('compositionend', function(){ myApp.vals.composingBool = false; })
//
//早押しのためのキーイベントの設定
document.onkeydown = myKeyDownEvent;
// document.onkeyup   = myKeyUpEvent;
function myKeyDownEvent(){
    /* スペースキーが押されたとき */
    if(event.keyCode == myApp.vals.btnCode){
        /* ボタンチェック待機状態のとき */
        if(myApp.vals.status == myApp.state.ButtonCheck){ 
            buttonCheck(myApp.elems);
            myApp.vals.status = myApp.state.Talk;
            player.playVideo();
        }
        /* 問い読み中状態のとき */
        if(myApp.vals.status == myApp.state.Question /*&& myApp.vals.keyDownBool == false*/){
            pushButton(myApp.vals, myApp.elems);
            myApp.vals.status = myApp.state.MyAnswer;
            // myApp.vals.keyDownBool = true;
            player.pauseVideo();
        }
    }
    if(event.keyCode == 13){
        if(myApp.vals.composingBool == false){
            return false
        }
    }
}
// function myKeyUpEvent(){
//     /* スペースキーが押されたとき */
//     if(event.keyCode == myApp.vals.btnCode){
//         /* 自分が解答権を所持＋押し直後の状態のとき */
//         if(myApp.vals.status == myApp.state.MyAnswer && myApp.vals.keyDownBool == true){
//             focusToAnsCol(myApp.elems);
//             myApp.vals.keyDownBool = false;
//         }
//     }
// }
document.addEventListener("touchend", myTouchEvent)
function myTouchEvent(){
    /* ボタンチェック待機状態のとき */
    if(myApp.vals.status == myApp.state.ButtonCheck){ 
        buttonCheck(myApp.elems);
        myApp.vals.status = myApp.state.Talk;
        player.playVideo();
    }
    /* 問い読み中状態のとき */
    if(myApp.vals.status == myApp.state.Question){
        pushButton(myApp.vals, myApp.elems);
        myApp.vals.status = myApp.state.MyAnswer;
        player.pauseVideo();
    }
}
//動画の再生・停止時のイベントリスナーの設定
player.addEventListener('onStateChange', myEventListener);
function myEventListener(){
    /* 動画が再生されたとき */
    if(player.getPlayerState() == 1){
        // 動画の時間を取得
        myApp.vals.currTime_playing = player.getCurrentTime();
        updateWatchedTime(myApp.vals);
        /* 自分が解答権を所持していた状態のとき */
        if(myApp.vals.status == myApp.state.MyAnswer){
            // 一時停止 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生
            player.pauseVideo();
            checkAnswer(myApp.vals, myApp.elems);
            if(myApp.vals.correctBool == true || myApp.vals.limPush - myApp.vals.cntPush == 0){
                myApp.vals.status = myApp.state.Talk;
            }else{
                myApp.vals.status = myApp.state.Question;
            }
            player.playVideo();
        }
        /* 問い読み中状態のとき */
        if(myApp.vals.status == myApp.state.Question){
            /* コントロールバーが操作されたときの処理 */
            // シークバーによる再生位置のジャンプ -> 無効
            myApp.vals.diffTime = Math.abs(myApp.vals.currTime_playing - myApp.vals.watchedTime)
            if(myApp.vals.diffTime > 1.0){
                player.seekTo(myApp.vals.watchedTime);
            }
        /* それ以外の状態のとき */
        }else{
            /* コントロールバーが操作されたときの処理 */
            // シークバーによる再生位置のジャンプ -> 無効
            myApp.vals.diffTime = Math.abs(myApp.vals.currTime_playing - myApp.vals.watchedTime)
            // シークバーによる再生位置のジャンプ -> 前に戻る場合のみ有効 
            // myApp.vals.diffTime = myApp.vals.currTime_playing - myApp.vals.watchedTime;
            if(myApp.vals.diffTime > 1.0){
                player.seekTo(myApp.vals.watchedTime);
            }
        }
    }
    /* 動画が停止されたとき */
    if(player.getPlayerState() == 2){
        // 動画の時間を取得
        myApp.vals.currTime_stopped = player.getCurrentTime();
        if(myApp.vals.status == myApp.state.MyAnswer){
            /*  */
            focusToAnsCol(myApp.elems);
        }
        /* 問い読み中状態のとき */
        if(myApp.vals.status == myApp.state.Question){
            /* コントロールバーが操作されたときの処理 */
            // 動画の一時停止 -> 無効
            // シークバーによる再生位置のジャンプ -> 無効
            myApp.vals.diffTime = Math.abs(myApp.vals.currTime_stopped - myApp.vals.watchedTime);
            if(myApp.vals.diffTime > 1.0){
                player.seekTo(myApp.vals.watchedTime);
            }
            player.playVideo();
        /* それ以外の状態のとき */
        }else{
            /* コントロールバーが操作されたときの処理 */
            // シークバーによる再生位置のジャンプ -> 無効
            myApp.vals.diffTime = Math.abs(myApp.vals.currTime_stopped - myApp.vals.watchedTime);
            // シークバーによる再生位置のジャンプ -> 前に戻る場合のみ有効
            // myApp.vals.diffTime = myApp.vals.currTime_stopped - myApp.vals.watchedTime;
            if(myApp.vals.diffTime > 1.0){
                player.seekTo(myApp.vals.watchedTime);
                // 動画の一時停止 -> 有効
                player.playVideo();
            }
            // 動画の一時停止 -> 無効 
            // player.playVideo();
        }
    }
}
//
//定期実行する関数の設定
setInterval(myIntervalEvent, interval = 10); //[ms]
function myIntervalEvent(){
    /* 動画が再生中のとき */
    if(player.getPlayerState() == 1){
        /* 動画の時間を取得 */
        myApp.vals.currTime_playing = player.getCurrentTime();
        updateWatchedTime(myApp.vals);
        //
        /* 自分が解答権を所持していない状態のとき */
        if(myApp.vals.status != myApp.state.MyAnswer){
            if(index == myApp.vals.cntIndex){
                srtFuncArray.shift()();
                myApp.vals.cntIndex += 1;
            }
        }
    }
    /* 自分が解答権を所持していない状態のとき */
    if(myApp.vals.status != myApp.state.MyAnswer){
        /* JSのbodyからfocusが外れたとき */
        if(document.activeElement.id == "player"){
            focusToJsBody(myApp.elems);
        }
    }
    /* 自分が解答権を所持した状態のとき */
    if(myApp.vals.status == myApp.state.MyAnswer){
        if(document.activeElement.id != "anscol" && myApp.elems.ansCol.value.valueOf() === ""){
            myApp.elems.ansCol.focus();
        }
        /* 解答権を所持したまま一定時間経過したときの処理 */
        /* 一定時間経過 -> その時点の入力内容で正誤判定をして適切な状態へ移行 -> 動画を再生 */
        myApp.vals.elapsedTime += interval;
        myApp.elems.subText.innerHTML = "あと"+Math.floor((myApp.vals.limTime-myApp.vals.elapsedTime)/1000)+"秒で解答を送信してください";
        if(myApp.vals.elapsedTime >= myApp.vals.limTime){
            checkAnswer(myApp.vals, myApp.elems);
            if(myApp.vals.correctBool == true || myApp.vals.limPush - myApp.vals.cntPush == 0){
                myApp.vals.status = myApp.state.Talk;
            }else{  
                myApp.vals.status = myApp.state.Question;
            }
            player.playVideo();
        }
    }else{
        myApp.vals.elapsedTime = 0;
        /* 2019/10/07 forcusToJSで遅延する */
        // focusToJsBody(myApp.elems);
    }
    /* デバッグ用 */
    printParams(myApp.vals, myApp.elems);
}
//
//解答送信ボタンのクリックイベントを設定
myApp.elems.ansBtn.onclick = myOnClickEvent;
function myOnClickEvent(){
    /* 自分か解答権を所持した状態のとき */
    if(myApp.vals.status == myApp.state.MyAnswer){ 
        /* 解答送信ボタンを押したときの処理 */
        /* 1秒間を空けてから正誤判定をして適切な状態へ移行 -> 動画を再生 */
        var btn = this;
        btn.disabled = true;
        myApp.elems.ansCol.disabled = true;
        window.setTimeout(function(){ checkAnswer(myApp.vals, myApp.elems); }, 1000);
        busySleep(1000);
        if(myApp.vals.correctBool == true || myApp.vals.limPush - myApp.vals.cntPush == 0){
            myApp.vals.status = myApp.state.Talk;
        }else{
            myApp.vals.status = myApp.state.Question;
        }
        player.playVideo();
    }
}
//
// document.getElementsByTagName("body")[0].onblur = myBodyOnBlurEvent;
// document.getElementsByTagName("body")[0].onblur = blurText;
// function myBodyOnBlurEvent(){
//     focusToJsBody(myApp.elems);
// }
// function blurText(){
//     alert("blur event detected!");
// }
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
function focusToJsBody(elements){
    elements.ansCol.disabled = false;
    elements.ansCol.focus();
    elements.ansCol.blur();
    elements.ansCol.disabled = true;
    // bodyに直接focusしたい
    // document.getElementsById("body")[0].focus();
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
    // elements.ansCol.disabled = true;
    // elements.ansBtn.disabled = true;
}
/**
 * 視聴範囲取得用の関数
 */
function updateWatchedTime(values){
    if(0.0 < values.currTime_playing - values.watchedTime && values.currTime_playing - values.watchedTime < 1.0){
        values.watchedTime = values.currTime_playing;
    }
}
/**
 * 
 */
function busySleep(waitMsec) {
    var startMsec = new Date();
    // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
    while (new Date() - startMsec < waitMsec);
}
/**
 * パラメータ表示（デバッグ用） 
 */
function printParams(values, elements){
    elements.text.innerHTML = document.activeElement.id;
    elements.subText.innerHTML = 
        "device: "+navigator.userAgent+"<br>"+
        "stateus: "+values.status+"<br>"+
        "time1: "+values.currTime_playing.toFixed(3)+"<br>"+
        "time2: "+values.currTime_stopped.toFixed(3)+"<br>"+
        "WatchedTime: "+values.watchedTime.toFixed(3)+"<br>"+
        "diffTime: "+values.diffTime.toFixed(3)+"<br>"+
        "limTime: "+Math.floor((myApp.vals.limTime-myApp.vals.elapsedTime)/1000)+"<br>"+
        "answer: "+values.ansArray[values.numQues-1][0].valueOf()+", "+
            values.ansArray[values.numQues-1][1].valueOf()+", "+
            values.ansArray[values.numQues-1][2].valueOf()+"<br>"+
        "answerLength: "+values.ansArray[values.numQues-1].length+"<br>"+
        "correctBool: "+values.correctBool+"<br>"+
        "keyDownBool: "+values.keyDownBool+"<br>"+
        "composing: "+values.composingBool+"<br>"+
        "nouValue"+nowValue+"<br>"+
        "rowCount"+rowCount+"<br>"+
        "index: "+index;
}
/**
 * 各字幕区間で実行する関数
 */
var srtFuncArray = [
    function(){
        // index = 1
        /* ボタンチェック開始 */
        myApp.vals.status = myApp.state.ButtonCheck;
        player.pauseVideo();
        myApp.elems.text.innerHTML = "ボタンチェック";
        myApp.elems.subText.innerHTML = "スペースキーが早押しボタンです。"+
            "スペースキーを押して音と動作を確認してください。<br>"+
            "動画の進行に合わせてクイズが始まります。";
    },
    function(){
        // index = 2
        /* 第１問 */
        // focusToAnsCol(myApp.elems);
        myApp.vals.status = myApp.state.Question;
        myApp.vals.numQues = 1;
        myApp.vals.cntPush = 0;
        myApp.elems.text.innerHTML = "第"+myApp.vals.numQues+"問";
        myApp.elems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
        myApp.elems.numOX.innerHTML = "◯: "+myApp.vals.cntO+", ✖: "+myApp.vals.cntX;
    },
    function(){
        // index = 3
        /* 閑話1 */
        myApp.vals.status = myApp.state.Talk;
        myApp.elems.subText.innerHTML = "解説";
    },
    function(){
        // index = 4
        /* 第２問 */
        myApp.vals.status = myApp.state.Question;
        myApp.vals.numQues = 2;
        myApp.vals.cntPush = 0;
        myApp.elems.text.innerHTML = "第"+myApp.vals.numQues+"問";
        myApp.elems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
    },
    function(){
        // index = 5
        /* 閑話2 */
        myApp.vals.status = myApp.state.Talk;
        myApp.elems.subText.innerHTML = "解説";
    },
    function(){
        // index = 6
        /* 第３問 */
        myApp.vals.status = myApp.state.Question;
        myApp.vals.numQues = 3;
        myApp.vals.cntPush = 0;
        myApp.elems.text.innerHTML = "第"+myApp.vals.numQues+"問";
        myApp.elems.subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
    },
    function(){
        // index = 7
        /* 閑話3 */
        myApp.vals.status = myApp.state.Talk;
        myApp.elems.subText.innerHTML = "解説";
    }
];

1
00:00:01,000 --> 00:00:02,999


2
00:00:03,000 --> 00:00:06,999


3
00:00:07,000 --> 00:00:10,999


4
00:00:11,000 --> 00:00:14,999


5
00:00:15,000 --> 00:00:18,999


6
00:00:19,000 --> 00:00:22,999


7
00:00:23,000 --> 00:00:26,999
