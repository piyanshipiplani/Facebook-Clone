const express= require("express");
const {MongoClient}= require("mongodb");
const jwt = require("jsonwebtoken");
const cors= require("cors");

const app= express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

let client= new MongoClient("mongodb://127.0.0.1:27017");
    client.connect().then(()=>
    console.log("MongoDB connected"));

app.post("/signup", async(req,res)=>{
    try{
    let user = req.body
    console.log(user)
    let email= req.body.email;
    
    const db= client.db("fb");
    const userCollection= db.collection("users");
    let data= await userCollection.findOne({email:email})
    
    if(data==null || data==undefined)
    {
        await userCollection.insertOne(user);
        return res.json({message: 'Data Saved'});
    }
    else
    return res.json({message: 'User already exist'});
    }
    catch (error){
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

app.post("/login", async(req,res)=>{
    console.log(req.body)
    try{
    let email= req.body.email;
    let password= req.body.password;
    console.log("BEmail :: ",email)
    console.log("BPasword :: ",password)  
    let secretKey= "!@#$%^&*()";
    let payLoad= {email:email};
    let options= {"expiresIn":"48h"};
    let token= jwt.sign(payLoad,secretKey,options);
    const db= client.db("fb");
    const userCollection= db.collection("users");
    let data= await userCollection.findOne({$and:[{email:email},{password:password}]})
    console.log("Sending Data to frontend : ", data )
   
    if(data==null)
        return res.json({message: 'Invalid email or password'});
    else 
    return res.json({message:'Success',token:token, userEmail : email});


}
catch (error) {
   return res.status(500).json({ message: "Internal server error", error: error.message });
}
});

app.post("/saverequest", async(req,res)=>{
    let receiver= req.body.receiver;
    let secretKey= "!@#$%^&*()";
    let token= req.body.token;
    let payLoad= jwt.verify(token,secretKey);
    let sender= payLoad.email;
    let status=0;
    let row= {sender:sender,receiver:receiver,status:status};
    
    const db= client.db("fb");
    const friendCollection= db.collection("friends");
    let existingrequest= await friendCollection.findOne({
        $or:[
            {sender:sender, receiver:receiver},
            {sender:receiver, receiver:sender}
        ]
    });
    if(existingrequest){
        res.json({message:'Request already sent'})
    }
    else{
        await friendCollection.insertOne(row);
        res.json({message:'Data Saved'})
    }

});

// app.post("/pendingrequest", async(req,res)=>{
//     let secretKey= "!@#$%^&*()";
//     let token= req.body.token;
//     let payLoad= jwt.verify(token,secretKey);
//     let email= payLoad.email;
//     const db= client.db("fb");
//     const friendCollection= db.collection("friends");
//     let data= await friendCollection.find({$and:[{status:0},{receiver:email}]}).toArray()
//     console.log("Backend:: ",data)
//     res.json({pendingrequests:data});  
// });

app.post("/pendingrequest", async (req, res) => {
    try {
        let secretKey = "!@#$%^&*()";
        let token = req.body.token;

        if (!token) {
            return res.status(401).json({ error: "Token missing" });
        }

        let payLoad = jwt.verify(token, secretKey); // this can throw!
        let email = payLoad.email;
        console.log("Backend Email Receiver :: " ,email)
        const db = client.db("fb");
        const friendCollection = db.collection("friends");

        let data = await friendCollection.find({$and:[{status:0},{receiver:email}]}).toArray()

        console.log("Backend Pending req:: ", data);
        res.json({ pendingrequests: data });

    } catch (err) {
        console.error("Error in /pendingrequest:", err.message);
        res.status(500).json({ error: "Invalid token or server error" });
    }
});



app.post("/acceptrequest", async(req,res)=>{
    let secretKey= "!@#$%^&*()";
    let token= req.body.token;
    let payLoad= jwt.verify(token,secretKey);
    let receiver= payLoad.email;
    let sender= req.body.sender;
    const db= client.db("fb");
    const friendCollection= db.collection("friends");
    let data= await friendCollection.updateOne({
        $and:[{sender:sender}, {receiver:receiver}]},
            {$set:{status:1}});
    res.json({message: 'Success'});
});

app.post("/rejectrequest", async(req,res)=>{
    let secretKey= "!@#$%^&*()";
    let token= req.body.token;
    let payLoad= jwt.verify(token,secretKey);
    let receiver= payLoad.email;
    let sender= req.body.sender;
    const db= client.db("fb");
    const friendCollection= db.collection("friends");
    let data= await friendCollection.updateOne({
        $and:[{sender:sender}, {receiver:receiver}]},
            {$set:{status:2}});
    res.json({message: 'Success'});
});

app.post("/getfriends", async(req,res)=>{
    console.log("💡 /getfriends hit");
    let secretKey= "!@#$%^&*()";
    let token= req.body.token;
    let payLoad= jwt.verify(token,secretKey);
    console.log("Received Token: ",token);
    let email= payLoad.email;
    let sender= req.body.sender;
    const db= client.db("fb");
    const friendCollection= db.collection("friends");
    let data= await friendCollection.find({
        $and:[{$or:[{sender:email}, {receiver:email}]},{status:1}]}).toArray();
    let friends=[];
    for(row of data)
    {
        if(row.sender==email)
            friends.push(row.receiver);
        else
        friends.push(row.sender);
    }
    res.json({friends:friends});
});

app.post("/savepost", async(req,res)=>{
    let secretKey= "!@#$%^&*()";
    let token= req.body.token;
    let messages= req.body.messages;
    let payLoad= jwt.verify(token,secretKey);
    let email= payLoad.email;
    var currentDate= new Date();
    var dateTime= currentDate.getDate()+"/"
    +(currentDate.getMonth()+1)+"/"
    +currentDate.getFullYear()+"@"
    +currentDate.getHours()+":"
    +currentDate.getMinutes()+":"
    +currentDate.getSeconds();
    const db= client.db("fb");
    const wpostCollection= db.collection("wposts");
    let data= await wpostCollection.insertOne({sender:email,messages:messages,dateTime:dateTime})
    res.json({message:'Post Saved'})

});

app.post("/getwposts", async(req,res)=>{
    let secretKey= "!@#$%^&*()";
    let token= req.body.token;
    let payLoad= jwt.verify(token,secretKey);
    let email= payLoad.email;
    console.log(email);
    const db= client.db("fb");
    const friendCollection= db.collection("friends");
    let data= await friendCollection.find({$and:[{$or:[{sender:email},{receiver:email}]},{status:1}]}).toArray();
    console.log("Data:",data);
    let friends=[];
    for(row of data)
    {
        if(row.sender==email)
            friends.push(row.receiver);
        else
        friends.push(row.sender);
    }
    friends.push(email);
    console.log("Friends:",friends);
    const wpostCollection= db.collection("wposts");
    let wposts= await wpostCollection.find().toArray();
    console.log("All posts:",wposts);
    let myposts=[];
    for(wpost of wposts)
    {
        if(friends.includes(wpost.sender))
        {
            myposts.push(wpost)
        }
    }
    console.log("myposts:",myposts);
    res.json({myposts:myposts});

})
app.listen(8003);