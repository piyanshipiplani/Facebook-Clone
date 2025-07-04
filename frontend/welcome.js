
function sendrequest(event)
{
    event.preventDefault();
    let r_email= document.querySelector("#r_email");
    let receiver= r_email.value;
    let token= localStorage.getItem("token");
    let data= {receiver:receiver,token:token};
    let url= `http://127.0.0.1:8003/saverequest`;
    fetch(url,{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify(data)
         })
        .then(response=>{
            return response.json();
        })
        .then(data=>{
            alert(data.message);
        })
        .catch(error=>{
            alert("Error:-"+error);
        })
        
}

function updatePendingWindow()
{
    let token= localStorage.getItem("token");
    console.log("Token :: ", token)
    let data={token:token};
    fetch("http://127.0.0.1:8003/pendingrequest",{
        method: "POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(async response => {
    const text = await response.text();  // log raw text
    console.log("Raw backend response:", text);
    return JSON.parse(text);
})
    .then(data=>{
        console.log(data);
        let pending = document.querySelector("#pending");
        pending.innerHTML = "";

for (let row of data.pendingrequests) {
    // Sender label
    const senderDiv = document.createElement("div");
    senderDiv.className = "row bg-primary m-1 p-2 text-white";
    senderDiv.textContent = row.sender;

    // Accept button
    const acceptBtn = document.createElement("input");
    acceptBtn.type = "button";
    acceptBtn.className = "btn btn-warning m-1";
    acceptBtn.value = "Accept";
    acceptBtn.addEventListener("click", () => {
        acceptreq(row.sender, row.receiver);
    });

    // Reject button
    const rejectBtn = document.createElement("input");
    rejectBtn.type = "button";
    rejectBtn.className = "btn btn-warning m-1";
    rejectBtn.value = "Reject";
    rejectBtn.addEventListener("click", () => {
        rejectreq(row.sender, row.receiver);
    });

    // Append all to pending div
    pending.appendChild(senderDiv);
    pending.appendChild(acceptBtn);
    pending.appendChild(rejectBtn);
}

    })
    .catch(error=>{
        alert("Error:-"+error)
    })
}



function updateFriendsWindow()
{

    let friends= document.querySelector("#friends");
    let token= localStorage.getItem("token");
    let data={token:token};
    fetch("http://127.0.0.1:8003/getfriends",{
        method: "POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(response=>{
        return response.json();
    })
    .then(data=>{
        
        friends.innerHTML="";
        let html= "";
        if(data.friends!=null && data.friends.length!=0)
        {
            for(row of data.friends)
            {
                html= html+`<div class='row bg-primary m-1 p-2 text-white'>${row}</div>`;
                
            }
           friends.innerHTML=html;
        }
    })
    .catch(error=>{
        alert("Error:-"+error)
    })
}


function acceptreq(sender,receiver)
{
    
    let r_email= receiver;
    let token= localStorage.getItem("token");
    let data= {sender:sender,token:token};
    let url= `http://127.0.0.1:8003/acceptrequest`;
    fetch(url,{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify(data)
         })
        .then(response=>{
            return response.json();
        })
        .then(data=>{
            alert(data.message);
        })
        .catch(error=>{
            alert("Error:-"+error);
        })
        updatePendingWindow();
        updateFriendsWindow();
}


function rejectreq(sender,receiver)
{
    alert(`sender: ${sender}, receiver: ${receiver}`)
    let r_email= document.querySelector("#r_email");
    let token= localStorage.getItem("token");
    let data= {sender:sender,token:token};
    let url= `http://127.0.0.1:8003/rejectrequest`;
    fetch(url,{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify(data)
         })
        .then(response=>{
            return response.json();
        })
        .then(data=>{
            alert(data.message);
        })
        .catch(error=>{
            alert("Error:-"+error);
        })
        updatePendingWindow();
        updateFriendsWindow();
}

function savepost()
{
    let token= localStorage.getItem("token");
    let messages= wpost.value;
    let data={messages:messages,token:token};
    fetch("http://127.0.0.1:8003/savepost",{
        method: "POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(response=>{
        return response.json();
    })
    .then(data=>{
        alert(data.message)
    })
    .catch(error=>{
        alert("Error:-"+error)
    })
    getposts();
}

function getposts()
{
    let token= localStorage.getItem("token");
    let data={token:token};
    fetch("http://127.0.0.1:8003/getwposts",{
        method: "POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data)
    })
    .then(response=>{
        return response.json();
    })
    .then(data=>{
        console.log(data);
        wposts.innerHTML="";
        if(data){
            for(row of data.myposts)
            {
                wposts.innerHTML=wposts.innerHTML+"<hr><h4>"+row.sender+"</h4><p>"+row.messages+"</p>";
            }
        }
        
    })
    .catch(error=>{
        alert("Error:-"+error)
    })
}


updatePendingWindow();
updateFriendsWindow();
getposts();

setInterval(updatePendingWindow,60000);
setInterval(updateFriendsWindow,60000);
setInterval(getposts,60000);    