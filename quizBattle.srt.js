0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
//crateElement
text = document.createElement("h1");        //動画のタイトルを表示
subText = document.createElement("h2");      //説明文等を表示
numOX = document.createElement("h1");       //◯正解数と✖不正解数を表示
ansCol = document.createElement("textarea");//解答を入力するテキストエリア
ansBtn = document.createElement("button");  //解答を送信するボタン
sndPush = document.createElement("audio");  //ボタンの押下音
sndO = document.createElement("audio");     //正解音
sndX = document.createElement("audio");     //不正解音
br = document.createElement("br");          //改行用
//idを用意
text.id = "text";
subText.id = "subtext";
numOX.id = "numox";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
//textNodeを作成して見出しのElementに追加
_text = document.createTextNode("");
_subText = document.createTextNode("");
_numOX = document.createTextNode("");
text.appendChild(_text);
subText.appendChild(_subText);
numOX.appendChild(_numOX);
//サウンドデータの設定
sndPush.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/push.mp3";
sndO.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/correct.mp3";
sndX.src = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/sounds/discorrect.mp3";
//キーイベントを実行するためのイベントリスナー
player.addEventListener('onStateChange', focusJS);
//動画の再生又は停止後に必ずフォーカスをjsの描画範囲内に移動し、いつでもキーイベントが呼び出せるようにする
function focusJS(event){
    if(event.data == 1){
        document.getElementById("ansbtn").focus();
        document.getElementById("ansbtn").blur();
    }
}
//ボタンチェック（問題開始前に動画を自動停止->スペースキーが押されたら再び再生）
buttonCheck = function(){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 2){
            sndPush.play();
            window.setTimeout( function(){ sndO.play() }, 800 );
            window.setTimeout( function(){ player.playVideo() }, 1000 );
        }
    }
}
//押し➀（動画の再生中にスペースキー押下で動画を停止）
pushButton_keydown = function(cntAns){
    if(event.keyCode == 32){
        if(player.getPlayerState() == 1){
            if(limAns-cntAns > 0){
                sndPush.play();
                player.pauseVideo();
                pushBool = 1;
                cntAns++;
            }
        }
    }
    return cntAns;
}
//押し➁（キーを離した瞬間に解答欄にフォーカス．キーを押したタイミングでfocusすると，離した瞬間にカラムに文字（スペース）を入力してしまう）
pushButton_keyup = function(){
    if(event.keyCode == 32){
        if(pushBool == 1){
            //document.getElementById("ansbtn").disabled = true;
            document.getElementById("subtext").innerHTML = "解答はひらがなと半角数字で入力してください。";
            document.getElementById("anscol").focus();
            ansCol.value = "";
        }
    }
}
//正誤判定
checkAnswer = function(correctAnswer, cntAns, cntO, cntX){
    if(pushBool == 1 && player.getPlayerState() == 2){
        var ans = ansCol.value;
        if(ans.valueOf() === correctAnswer.valueOf()){
            sndO.play();
            cntO += 1;
            cntAns = limAns;
            document.getElementById("ansbtn").disabled = true;
            document.getElementById("subtext").innerHTML = "正解です！";
        }else{
            sndX.play();
            cntX += 1;
            document.getElementById("subtext").innerHTML = "不正解です！ あと"+(limAns-cntAns)+"回解答できます。";
            if(limAns-cntAns == 0){
                document.getElementById("ansbtn").disabled = true;                
            }
        }
        document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;    
    }
    pushBool == 0;
    player.playVideo();
    return [cntAns, cntO, cntX];
}
//CSVファイルを開いて正答を読み込む
var answerCSV = "https://raw.githubusercontent.com/t-yokota/quizBattle/master/answer.csv";
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
/*
    alert(correctAnswer[0]);
    alert(correctAnswer[1]);
    alert(correctAnswer[2]);
*/
}
//解答可能回数の設定
var limAns = 2;

1
00:00:00,100 --> 00:00:00,200
//doOnce[index] = true;
document.getElementsByTagName("body")[0].appendChild(text);
document.getElementsByTagName("body")[0].appendChild(subText);
document.getElementById("text").innerHTML = "quizBattle.srt.js";
document.getElementById("subtext").innerHTML = "動画の中の相手とクイズ対決";
//TextNodeの内容をdoOnce内から隔離し、他のindex内でinnerHTMLを用いて編集する
//->動画をはじめに戻したときに表示をリセットすることができる

2
00:00:04,000 --> 00:00:04,100
//doOnce[index] = true;
//各種UIを表示
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(br);
document.getElementsByTagName("body")[0].appendChild(ansBtn);
document.getElementsByTagName("body")[0].appendChild(numOX);
ansCol.value = "ここに解答を入力";
ansBtn.innerHTML = "解答を送信";
//ボタンチェック
player.pauseVideo();
document.onkeydown = buttonCheck;
document.getElementById("text").innerHTML = "ボタンチェック";
document.getElementById("subtext").innerHTML = "スペースキーが早押しボタンです。キーを押してボタンの動作を確認してください。";
document.getElementById("anscol").focus();//カーソルのフォーカスをjsの描画範囲(のボタンUI)に移動する->キーイベントが呼び出せるようになる
document.getElementById("anscol").blur(); //ボタン自体にフォーカスをしている意味はないため、すぐにbulrでそれを解除
ansCol.disabled = true;
ansBtn.disabled = true;

3
00:00:05,000 --> 00:00:06,000
//doOnce[index] = true;
//第１問
cntQues = 1;
cntAns = 0;
cntO = 0; 
cntX = 0;
ansCol.disabled = false;
ansBtn.disabled = false;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtext").innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;
document.onkeyup = pushButton_keyup;
document.onkeydown = function(){ cntAns = pushButton_keydown(cntAns); };
ansBtn.onclick = function(){ 
    var btn = this;
    window.setTimeout( function(){ [cntAns, cntO, cntX] = checkAnswer(correctAnswer[cntQues-1][0], cntAns, cntO, cntX) }, 1000 );
    this.disabled = true;
    window.setTimeout( function(){ btn.disabled = false; }, 1000 );
};

4
00:00:10,000 --> 00:00:11,000
//doOnce[index] = true;
//第２問
cntQues = 2;
cntAns = 0;
ansBtn.disabled = false;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtext").innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;
document.onkeydown = function(){ cntAns = pushButton_keydown(cntAns); };
ansBtn.onclick = function(){ 
    var btn = this;
    window.setTimeout( function(){ [cntAns, cntO, cntX] = checkAnswer(correctAnswer[cntQues-1][0], cntAns, cntO, cntX) }, 1000 );
    this.disabled = true;
    window.setTimeout( function(){ btn.disabled = false; }, 1000 );
};

5
00:00:15,000 --> 00:00:16,000
//doOnce[index] = true;
//第３問
cntQues = 3;
cntAns = 0;
ansBtn.disabled = false;
document.getElementById("text").innerHTML = "第"+cntQues+"問";
document.getElementById("subtext").innerHTML = "答えが分かったら、スペースキーを押して解答権を得る！";
document.getElementById("numox").innerHTML = "◯: "+cntO+", ✖: "+cntX;
document.onkeydown = function(){ cntAns = pushButton_keydown(cntAns); };
ansBtn.onclick = function(){ 
    var btn = this;
    window.setTimeout( function(){ [cntAns, cntO, cntX] = checkAnswer(correctAnswer[cntQues-1][0], cntAns, cntO, cntX) }, 1000 );
    this.disabled = true;
    window.setTimeout( function(){ btn.disabled = false; }, 1000 );
};