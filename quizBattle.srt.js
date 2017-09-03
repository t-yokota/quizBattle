0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
numQues = document.createElement("h1");
ansCol = document.createElement("textarea");
ansBtn = document.createElement("button");
numQues.id = "numques";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";

1
00:00:10,000 --> 00:00:11,000
// 問題数
cntQues = 1;
numQuesText = document.createTextNode("");
numQues.appendChild(numQuesText);
document.getElementById("numques").innerHTML = "第"+cntQues+"問";
// 解答欄
ansCol.value = "ここに解答を記入して下さい";
// 解答ボタン
ansBtn.value = "解答を送信";
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(andBtn);

2
00:00:15,000 --> 00:00:16,000
cntQues += 1;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";