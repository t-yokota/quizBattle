0
00:00:00,000 --> 00:00:00,100
doOnce[index] = true;
numQues = document.createElement("h1");
ansCol = document.createElement("textarea");
ansBtn = document.createElement("button");
numQues.id = "numques";
ansCol.id = "anscol";
ansBtn.id = "ansbtn";
numQuesText = document.createTextNode("");
numQues.appendChild(numQuesText);
ansCol.value = "ここに解答を記入して下さい";
ansBtn.innerHTML = "解答を送信";

0
00:00:0,200 --> 00:00:00,300
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansCol);
document.getElementsByTagName("body")[0].appendChild(ansBtn);

0
00:00:05,000 --> 00:00:06,000
var cntQues = 1;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";

0
00:00:10,000 --> 00:00:11,000
var cntQues = 2;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";
