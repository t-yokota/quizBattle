0
00:00:00,000 --> 00:00:01,000
doOnce[index] = true;
var numQues = document.createElement("h1");
var ansArea = document.createElement("textarea");
cuntQues = 1;
var ques = document.createTextNode("第"+cuntQues+"問");
numQues.appendChild(ques);
ansArea.value = "Write answer here.";
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansArea);

0
00:00:05,000 --> 00:00:06,000
cuntQues += 1;