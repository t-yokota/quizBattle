1
00:00:00,000 --> 00:00:03,460
var g=document.createElement("textarea");
g.id = "name";
g.value = "次郎君";
document.getElementsByTagName( 'body' )[ 0 ].appendChild(g);

2
00:00:17,500 --> 00:00:19,460
var str = document.getElementById('name').value;// || "太郎君";
var synthes = new SpeechSynthesisUtterance(str);
var voices =speechSynthesis.getVoices();
voices.forEach(function(v, i){if(v.name == 'Google 日本語') synthes.voice = v;});
speechSynthesis.speak(synthes);