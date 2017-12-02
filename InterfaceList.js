const fs = require("fs");
const cheerio = require("cheerio");
const crypto=require("crypto");

class Interface {
    constructor(props) {
        this.url = props.url;
        this.methods = props.methods;
        this.name = props.name;
        this.note = props.note;
    }
}

function md5(str) {
    return crypto.createHash("md5").update(str).digest("hex");
}


function readFileToPromise(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, "utf-8", function (err, res) {
            if (err)
                reject(err);
            else
                resolve(res);
        })
    })
}

function writeFileToPromise(filename,content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename,content, {encoding: "utf-8"}, function (err) {
            if (err)
                reject(err);
            else
                resolve({status: "ok"});
        });
    })

}

function listInterface(app) {
    let middleware = app.middleware;
    let routes = [];
    for (let i = 0; i < middleware.length; i++) {
        if (middleware[i].router != undefined) {
            let stack = middleware[i].router.stack;
            for (let j = 0; j < stack.length; j++) {
                let methods=stack[j].methods.join(",");
                let url=stack[j].path;
                routes.push(new Interface({methods:methods,url:url,note:"",name:""}));
            }
        }
    }
    return routes;
};

function listInterfaceToFile (app) {
    const listInterface = this.listInterface;
    return writeFileToPromise(__dirname+"/Interface.json",JSON.stringify(listInterface(app)));
};


exports.createWeb = function (app,url) {
    return async function (ctx, next) {
        if(ctx.url!=url)
        {
            next();
            return;
        }
        let fileExist=true;
        if(!fs.existsSync(__dirname+"/Interface.json"))
        {
            await listInterfaceToFile(app);
            fileExist=false;
        }
        let jsonFile = await readFileToPromise(__dirname + "/interface.json");
        console.log(jsonFile);
        let interfaceList=JSON.parse(jsonFile);
        let isModify=false;
        try {
            if(ctx.method.toLowerCase()==="get")
            {
                if(fileExist)
                {
                    let existInterface={};
                    for(let i=0;i<interfaceList.length;i++)
                    {
                        existInterface[md5(interfaceList[i].methods+interfaceList[i].url)]=interfaceList[i];
                    }
                    let interfaces=listInterface(app);
                    for(let i=0;i<interfaces.length;i++)
                    {
                        if(existInterface[md5(interfaces[i].methods+interfaces[i].url)]==undefined)
                        {
                            isModify=true;
                            interfaceList.push(interfaces[i]);
                        }
                    }
                    if(isModify){
                        await writeFileToPromise(__dirname+"/Interface.json",JSON.stringify(interfaceList));
                    }
                }
                let htmlFile = await readFileToPromise(__dirname + "/interfaceTest.html");
                let $ = cheerio.load(htmlFile);
                for (let i = 0; i < interfaceList.length; i++) {
                    $('tbody').append(" <tr class=\"active\">\n" +
                        "                <div class=\"panel-group\" id=\"panel-735126\">\n" +
                        "                <td>\n" +
                        interfaceList[i].name +
                        "                </td>\n" +
                        "                <td>\n" +
                        interfaceList[i].url +
                        "            </td>\n" +
                        "            <td>\n" +
                        interfaceList[i].methods +
                        "            </td>\n" +
                        "            <td>\n" +
                        interfaceList[i].note +
                        "            </td>\n" +
                        "            <td>\n" +
                        "            <button href=\"#modal-container-36318\" data-toggle=\"modal\" class=\"btn btn-primary\">Config</button>\n" +
                        "                <button class=\"btn btn-primary btnTest\">Test</button>\n" +
                        "                <button class=\"btn btn-primary btnModify\">Modify</button>\n" +
                        "                </td>\n" +
                        "                </div>\n" +
                        "                </tr>")
                }
                ctx.body = $.html();
            }
            else if(ctx.method.toLowerCase()==="post")
            {
                console.log(ctx.request.body);
                let data=ctx.request.body;
                interfaceList[data.id].name=data.name;
                interfaceList[data.id].note=data.note;
                await writeFileToPromise(__dirname+"/Interface.json",JSON.stringify(interfaceList));
                ctx.body=JSON.stringify({status:"ok"});
            }
            else
            {
                next();
            }
        } catch (ex) {
            console.log(ex);
            next();
        }
    }
};

