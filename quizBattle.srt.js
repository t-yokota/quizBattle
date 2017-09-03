0
00:00:00,000 --> 00:00:01,000
doOnce[index] = true;
var cuntQues = 1;
numQues = document.createElement("h1");
ansArea = document.createElement("textarea");
numQues.id = "numques";
ques = document.createTextNode("第"+cuntQues+"問");
numQues.appendChild(ques);
ansArea.value = "Write answer here.";
document.getElementsByTagName("body")[0].appendChild(numQues);
document.getElementsByTagName("body")[0].appendChild(ansArea);

1
00:00:05,000 --> 00:00:06,000
var cuntQues = 2;
document.getElementById("numques").innerHTML = "第"+cuntQues+"問";