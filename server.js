// import 
import express  from "express";
import mongoose from "mongoose";
import Messages from "./dbMessages.js";
import Group from "./dbGroup.js"
import Pusher from "pusher";
import cors from "cors";

// app config

const app = express();
const port = process.env.PORT || 9000;

const pusher = new Pusher({
    appId: "1370582",
    key: "69f980a392be4715aa2b",
    secret: "ab59aefb80b508e1bd0b",
    cluster: "us2",
    useTLS: true
  });

// midleware

app.use(express.json());

app.use(cors());

// DB config

const connection_url = 
  "mongodb+srv://test:ajGP8uHZgCOE4apM@cluster0.f8jb9.mongodb.net/whatsappdb?retryWrites=true&w=majority";

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

 db.once("open", ()=>{
    console.log("DB connected");
    const grpCollection = db.collection('groups');
    const changeGroup = grpCollection.watch();
    const msgCollection = db.collection('messagecontents');
    const changeStream = msgCollection.watch();


    changeGroup.on('change',(change) =>{
        console.log("A Change occured",change);
        if (change.operationType == 'insert'){
            const groupDetails = change.fullDocument;
            pusher.trigger('group','inserted',{
                tema : groupDetails.tema,
                idioma : groupDetails.idioma,
                nivel : groupDetails.nivel,
            });
        } else{
            console.log('error triggering Pusher')
        }
    });

    changeStream.on('change',(change) =>{
        console.log("A Change occured",change);

        if (change.operationType == 'insert'){
            
            const messageDetails = change.fullDocument;
            console.log(messageDetails);
            pusher.trigger('messages','inserted',{
                name : messageDetails.name,
                message : messageDetails.message,
                timeStamp: messageDetails.timeStamp,
                Sala : messageDetails.Sala,
            });
        } else{
            console.log('error triggering Pusher')
        }
    });
 });

//???

// api routes

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
     })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage = req.body

    Messages.create(dbMessage,(err,data)=>{
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
     })
})

app.post('/group/new',(req,res)=>{
    const dbGroup = req.body

    Group.create(dbGroup,(err,data)=>{
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
     })
})

app.get('/group/sync',(req,res)=>{
    Group.find((err,data)=>{
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
     })
})




// listen

app.listen(port,()=>console.log(`Listening on localhost:${port}`));

