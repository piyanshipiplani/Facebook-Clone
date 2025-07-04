function signup(event)
{
    event.preventDefault();
    let semail= document.querySelector("#semail").value;
    let spassword= document.querySelector("#spassword").value;
    let url= `http://127.0.0.1:8003/signup`;
    fetch(url,{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify({email:semail,password:spassword})
         })
        .then(response=>{
            return response.json();
        })
        .then(data=>{
            alert(data.message);
        })
        .catch(error=>{
            alert(error);
        })
        

}
function login(event)
{
    event.preventDefault()
    let email= document.querySelector("#email").value;
    let password= document.querySelector("#password").value;
    let url= `http://127.0.0.1:8003/login`;
    let body = {
        email:email,
        password:password
    }
    console.log(body)
    fetch(url,{
        method: "POST",
        headers: {"Content-type":"application/json"},
        body: JSON.stringify(body)
        })
        .then(response=>{
            return response.json();
        })
        .then(data=>{
           console.log("Response from backend:", data);
           console.log("userEmail from backend:", data.userEmail);
            if(data.message==="Success"){
                console.log(data.token);
                console.log(data.userEmail)
                localStorage.setItem("token",data.token);
                localStorage.setItem("userEmail", data.userEmail)
                location= "welcome.html";
            }
            else{
                alert("Invalid ID or password");
            }
            

        })
        .catch(error=>{
            alert(error);
        })
      
}