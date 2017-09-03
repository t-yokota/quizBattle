0
00:00:00,000 --> 00:00:01,000
//doOnce[index] = true;
// 問題数を表示
cntQues = 1;
var numQues = document.createElement("h1");
numQues.id = "numques";
numQuesText = document.createTextNode("第"+cntQues+"問");
numQues.appendChild(numQuesText);
// 回答欄を表示
var ansArea = document.createElement("textarea");
ansArea.id = "ansarea";
ansArea.value = "ここに回答を記入して下さい";
//
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansArea);

1
00:00:05,000 --> 00:00:06,000
cntQues += 1;
document.getElementById("numques").innerHTML = "第"+cntQues+"問";