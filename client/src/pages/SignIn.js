import Axios from "axios";
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons"
import logo from '../eagle.png'


const SignIn = () => {

    const [username , setUsername] = useState("");
    const [password , setPassword] = useState("");
    const [loginStatus , setLoginStatus] = useState(false);
    const [msg , setMsg] = useState("");
    const [error , seterror] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        Axios.get("http://localhost:3001/session").then((response) => {
            if(response.data.loggedIn === true){
                setLoginStatus(true);
                setUsername(response.data.username);
                navigate("/");
            }
            else{
                setLoginStatus(false);
                setUsername("");
            }
        })
    }, [])
    
    Axios.defaults.withCredentials = true;

    const signin = (e) => {
        e.preventDefault();
        Axios.post("http://localhost:3001/api/login", {
        username: username,
        password: password,
      }).then((response) => {
        if(response.data.error){
          setMsg(response.data.error);
          seterror(true);
        }
        else{
          setMsg(response.data.username);
          seterror(false);
          navigate("/");
        }
      });
    };

    

    return(
        <div className="divsignin">
            <header>
                <img src={logo} width="40" height="40"></img>
                <nav className="navigation">
                    <a href="/about">About</a>
                    <a href="/"><Icon.House size={25} className="home"/></a>
                    <a href="/cart"> <Icon.Cart3 size={25} className="cart"/> Cart</a>
                    <a href="/profile"><Icon.PersonCircle size={30} className="profile"/></a>
                </nav>
            </header>

            <div className="wrapper">
                <div className="form-box signin">
                    {error ? <h3>{msg}</h3> : null }
                    <h2>Sign In</h2>
                    <form action="#">

                        <div className="input-box">
                            <span className="icon"> <Icon.PersonFill size={25} className="cart"/> </span>
                            <input 
                                type = "text" required
                                onChange={(e)=>{
                                    setUsername(e.target.value);
                                }}
                            />
                            <label>Username</label>
                        </div>

                        <div className="input-box">
                            <span className="icon"> <Icon.LockFill size={25} className="cart"/> </span>
                            <input 
                                type = "password" required
                                onChange={(e)=>{
                                    setPassword(e.target.value);
                                }}
                            />
                            <label>Password</label>
                        </div>
                        
                        <button type="submit" className="button-in-signin" onClick={signin}>Sign In</button>
                        
                        <div className="signin-signup">
                            <p>Don't have an account?  <a href="/signup" className="sinup-link">  Sign Up</a>
                            </p>
                            <a href="/merchantsignin">I'm a Merchant</a>
                        </div>

                    </form>
                </div>    
            </div>
        </div>

    );
}

export default SignIn;