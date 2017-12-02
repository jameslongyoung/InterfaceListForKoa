# InterfaceListForKoa
a middleware that automatically list and admin the interfaces you write<br>
how to use?
npm i interfacelistforkoa
const interfaceList=require("InterfaceListForKoa");<br>
app.use(interfaceList.createWeb(app,"/"));<br>
interfaceList.createWeb(app,[url]),url is the route that used to display the website<br>
then when you visit the web 127.0.0.1:port/url,you can see the website below ,and you can admin you interfaces<br>
![](https://github.com/jameslongyoung/InterfaceListForKoa/blob/master/img/%E5%B1%8F%E5%B9%95%E5%BF%AB%E7%85%A7%202017-12-02%20%E4%B8%8B%E5%8D%889.43.51.png)
