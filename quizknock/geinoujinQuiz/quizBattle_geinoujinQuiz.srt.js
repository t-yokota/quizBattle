0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
//crateElement
text    = document.createElement("h1");       //動画のタイトル等
subText = document.createElement("h2");       //説明文等
numOX   = document.createElement("h1");       //◯正解数と✖不正解数
ansCol  = document.createElement("textarea"); //解答を入力するテキストエリア
ansBtn  = document.createElement("button");   //解答を送信するボタン
sndPush = document.createElement("audio");    //ボタンの押下音
sndO    = document.createElement("audio");    //正解音
sndX    = document.createElement("audio");    //不正解音
br      = document.createElement("br");       //改行用
//textNodeを作成してelementに追加
_text    = document.createTextNode("");
_subText = document.createTextNode("");
_numOX   = document.createTextNode("");
text.appendChild(_text);
subText.appendChild(_subText);
numOX.appendChild(_numOX);
//audioデータの設定
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src    = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//正答リストの設定
var answerCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answers/answer_geinou.csv";
file = new XMLHttpRequest();
file.open("get", answerCSV, true);
file.send(null);
file.onload = function(){ setAnswerArray(file.responseText); }
function setAnswerArray(str){
    correctAnswer = new Array();
    var tmp = str.split("\n");
    for (var i = 0; i < tmp.length; i++) {
        correctAnswer[i] = tmp[i].split(",");
    }
    //check answer
    //alert(correctAnswer[0]);
}
//キーイベント発生のためのイベントリスナーの設定
//動画の再生・停止後に必ずjsの描画範囲内にフォーカスし、常にキーイベントが発生するようにする
player.addEventListener('onStateChange', focusJS);
function focusJS(){
    ansCol.focus();
    ansCol.blur();
}
//ボタンチェックのキーイベント関数
//(一度動画を自動停止した後、)スペースキーを押して音のチェック＋動画の再生
buttonCheck = function(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
}
//早押しのキーイベント関数１
//問題中にスペースキー押下で動画を停止
//問題ごとに押しの回数(cntPush)をカウントし、上限(limPush)を超えたら停止は不可に
var cntPush;
var limPush     = 1;
var enablePush  = 1; //1のとき早押し可能
var enableKeyup = 0; //1のときkeyupイベントが発生
var enableCheck = 0; //1のとき答え合わせ可能
pushButton_keydown = function(cntPush){
    if(event.keyCode == 32){
        if(enablePush == 1){
            if(limPush-cntPush > 0){
                cntPush++;
                sndPush.play();
                enableKeyup = 1;
                player.pauseVideo();
            }
        }
    }
    return cntPush;
}
//早押しのキーイベント関数２
//keyupの瞬間に解答欄にフォーカスし、解答の送信と答え合わせを可能にする(enableCheckを1に)
//keydownのタイミングで解答欄にフォーカスすると、キーを離したときに解答欄に文字(スペース)を入力してしまう
pushButton_keyup = function(){
    if(event.keyCode == 32){
        if(enableKeyup == 1){
            subText.innerHTML = "解答は全角のひらがなと数字で入力してください。";
            ansCol.focus();
            ansCol.value = "";
            enablePush  = 0;
            enableKeyup = 0;
            enableCheck = 1;
        }
    }
}
//正誤判定の関数
checkAnswer = function(correctAnswer, cntPush, cntO, cntX){
    if(enableCheck == 1){
        var ans = ansCol.value;
        if(ans.valueOf() === correctAnswer.valueOf()){
            cntO += 1;
            sndO.play();
            cntPush = limPush;
            subText.innerHTML = "正解です！";
        }else{
            cntX += 1;
            sndX.play();
            subText.innerHTML = "不正解です！ あと"+(limPush-cntPush)+"回解答できます。";
        }
        numOX.innerHTML = "◯: "+cntO+", ✖: "+cntX;    
    }
    enablePush  = 1;
    enableCheck = 0;
    player.playVideo();
    return [cntPush, cntO, cntX];
}

1
00:00:00,100 --> 00:00:00,200
doOnce[index] = true;
//各種elementを表示
document.getElementsByTagName("body")[0].appendChild(text);
document.getElementsByTagName("body")[0].appendChild(subText);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(br);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
text.innerHTML = "quizBattle.srt.js";
subText.innerHTML = "動画の中の相手とクイズ対決";
ansCol.value = "ここに解答を入力";
ansBtn.innerHTML = "解答を送信";
ansCol.disabled = true;
ansBtn.disabled = true;

2
00:00:04,000 --> 00:00:04,100
doOnce[index] = true;
text.innerHTML = "ボタンチェック";
subText.innerHTML = "スペースキーが早押しボタンです。キーを押して音と動作を確認してください。";
//ボタンチェックのキーイベントを設定
document.onkeydown = buttonCheck;
//jsの描画範囲(のelement)にfocusすることで、キーイベントが呼び出せるようになる
ansCol.disabled = false;
ansCol.focus();
ansCol.blur();
ansCol.disabled = true;
//動画の停止
player.pauseVideo();

3
00:00:04,500 --> 00:00:04,600
doOnce[index] = true;
//早押しのキーイベントを設定
document.onkeydown = function(){ cntPush = pushButton_keydown(cntPush); };
document.onkeyup   = pushButton_keyup;
//正誤判定をするonclickイベントを設定 (解答送信ボタンを押すと１秒後に正誤を判定する。押された後はボタンをdisabledにする)
ansBtn.onclick = function(){
    var btn = this;
    btn.disabled = true;
    window.setTimeout( function(){ [cntPush, cntO, cntX] = checkAnswer(correctAnswer[cntQues-1][0], cntPush, cntO, cntX) }, 1000 );
};
//解答を送信する前に動画を再生した場合は、その時点の入力内容で正誤判定をする
player.addEventListener('onStateChange', whenNoSendAnswer);
function whenNoSendAnswer(){
    if(player.getPlayerState() == 1){
            [cntPush, cntO, cntX] = checkAnswer(correctAnswer[cntQues-1][0], cntPush, cntO, cntX);
    }
}
//解答送信ボタンは動画の停止中のみ有効にする
player.addEventListener('onStateChange', ansBtnDisbled);
function ansBtnDisbled(){
    if(player.getPlayerState() == 1){
        ansBtn.disabled = true;
    }else if(player.getPlayerState() == 2){
        ansBtn.disabled = false;
    }
}

4
00:01:51,000 --> 00:01:56,000
doOnce[index] = true;
//問題開始
ansCol.disabled = false;
cntO = 0;
cntX = 0;
//第１問
cntQues = 1;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
numOX.innerHTML = "◯: "+cntO+", ✖: "+cntX;

5
00:02:39,000 --> 00:02:43,000
doOnce[index] = true;
//第２問
cntQues = 2;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

6
00:03:32,000 --> 00:03:35,000
doOnce[index] = true;
//第３問
cntQues = 3;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

7
00:04:11,000 --> 00:04:17,000
doOnce[index] = true;
//第４問
cntQues = 4;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

8
00:04:45,000 --> 00:04:51,000
doOnce[index] = true;
//第５問
cntQues = 5;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

9
00:05:30,000 --> 00:05:39,000
doOnce[index] = true;
//第６問
cntQues = 6;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

10
00:06:28,000 --> 00:06:35,000
doOnce[index] = true;
//第７問
cntQues = 7;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

11
00:07:28,000 --> 00:07:33,000
doOnce[index] = true;
//第８問
cntQues = 8;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

12
00:08:36,000 --> 00:08:40,000
doOnce[index] = true;
//第９問
cntQues = 9;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";

13
00:09:18,000 --> 00:09:21,000
doOnce[index] = true;
//第１０問
cntQues = 10;
cntPush = 0;
text.innerHTML = "第"+cntQues+"問";
subText.innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";