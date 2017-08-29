00:00:00,000 --> 00:00;01,000
//text to speech example
//loadScript('http://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');
var g=document.createElement("textarea");
g.id = "answer";
g.value = "test";
document.getElementsByTagName( 'body' )[ 0 ].appendChild(g);

2
00:00:17,500 --> 00:00:19,460
var str = document.getElementById('name').value;// || "太郎君";
var synthes = new SpeechSynthesisUtterance(str);
var voices =speechSynthesis.getVoices();
voices.forEach(function(v, i){if(v.name == 'Google 日本語') synthes.voice = v;});
speechSynthesis.speak(synthes);