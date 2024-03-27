#action JCReader

popup window shows status and some controls

edit css and selector per site

edit default and dark styles for every site

prefix selector with * to use mutliple elements

prefix selector with @ to make it optional

![voorbeeld](reader/images/icon.png) 

npm i

for installing monaco editor

## Voeg classes en ids van webpagina toe aan autocomplete lijsten van editor
1. in content, na laden, maak een lijstje van classes en ids in de DOM en sla ze op in local storage van chrome
2. in popup2 haal de classes en ids op uit de local storage en registreer ze bij monaco
3. vermijd complicaties door voor classes een '.' en voor ids een '#' te zetten

## Plak classes van rechtsgeklikt element in editor
1. in background contextmenu gemaakt met titel Reader
2. in content bij rechtsklik ('contextmenu event') target opslaan
3. background na klik op item message sturen naar content met als inhoud, er is op mij geklikt
4. content reageert op de message door zelf een message te sturen naar popup2 met als inhoud de uit de target afgeleide classes en id, afgesloten met een newline
5. popup2 plakt de ontvangen classes (evt: en id) in op de plaats van de cursor in de actieve editor

