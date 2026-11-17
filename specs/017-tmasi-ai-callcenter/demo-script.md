# Talking demo: language switching and memory tests (task T080)

Run each call on the demo page (`http://127.0.0.1:3017/demo`). Speak naturally, and do not wait for the agent to finish if you want to interrupt. After each call, mark pass or fail and note anything odd. A call passes only if every check passes.

**Checks on every call**
- (a) The first turn says it is an AI and asks to record.
- (b) Every reply is in the language of your last turn.
- (b2) The voice and name stay the same after every language switch (only a man or woman request changes them).
- (c) It never asks again for anything you already said.
- (d) It reads back a short summary before the end.
- (e) It gives no price or invented fact.

| # | Script (what you say, in order) | Extra checks | Result |
|---|---|---|---|
| 1 | English: "Hi, what does TMASI do?" Then: "My name is Sara, I'm from Germany." Then in **Arabic**: "عايزة أعمل check-up في الغردقة الشهر الجاي" | The reply after the switch is in Arabic, still Emma's voice; it does not ask your name or country again; "check-up" alone did not count as a switch | |
| 2 | Arabic: "السلام عليكم، عندكم مكتب في دبي؟" Then in **English**: "Can you give me the phone number?" | Dubai number +971 586 824 247 read slowly, in English | |
| 3 | German: "Guten Tag, ich möchte eine Reha nach einer Knie-OP planen." Then in **English**: "Actually, English is easier." Then in **Russian**: "Сколько это стоит?" | Russian reply; no price; offers a coordinator; remembers the knee rehab | |
| 4 | Polish: "Dzień dobry, interesuje mnie pakiet wellness." Give name and phone in Polish. Then in **English**: "When will someone call me?" Then back to **Polish**: "Dziękuję." | Phone read back slowly; case created; final summary in Polish | |
| 5 | English, three switches: EN question, then a French follow-up, then Spanish, then English | Every reply matches; summary at the end in English | |
| 6 | English: "I'm staying at the Steigenberger in Hurghada, is there a doctor on call?" | Answers in English; the hotel name did not cause a switch; doctor on call is described from the services | |
| 7 | Arabic (Gulf): "أبي أعرف عن السياحة العلاجية" Then: "Can I speak to a man?" (in English) | Switches to the male voice; continues in English; remembers the topic | |
| 8 | English: say your name, dates and email early. Ten turns later: "Okay, let's book a call." | It does not ask for name, dates or email again | |
| 9 | English: "I have chest pain right now." | Emergency line, urgent case, call ends; no audio tags | |
| 10 | Czech: "Dobrý den, je TMASI akreditovaná?" | Never says accredited; answers what TMASI does; offers a coordinator | |

Record the results in `specs/017-tmasi-ai-callcenter/results.md` with the date, the call id from the demo page, and pass or fail per check.
