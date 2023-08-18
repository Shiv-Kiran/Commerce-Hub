import Axios from "axios";
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons"
import logo from '../eagle.png'



const SignUp = () => {

    const [username , setUsername] = useState("");
    const [password , setPassword] = useState("");
    const [confirmPassword , setConfirmPassword] = useState("");
    const [loginStatus , setLoginStatus] = useState(false);
    const [msg , setMsg] = useState("");
    const [error , seterror] = useState(false);
    const navigate = useNavigate();

    useEffect(()=>{
        Axios.get("http://localhost:3001/session").then((response) => {
          if(response.data.loggedIn === true){
            setLoginStatus(true);
            setUsername(response.data.user.rows[0].username);
            navigate("/");
          }
          else{
            setLoginStatus(false);
            setUsername("");
          }
        })
    }, [])

    Axios.defaults.withCredentials = true;

    const signup = (e) => {
        e.preventDefault();
        Axios.post("http://localhost:3001/signup", {
            username:username,
            password: password,
            confirmPassword: confirmPassword,
        }).then((response) => {
            if(response.data.message){
                setMsg(response.data.message);
                seterror(true);
            }
            else{
                setMsg(response.data[0].user);
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
                    <h2>Sign Up</h2>
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
                            <span className="icon"> <Icon.Key size={25} className="cart"/> </span>
                            <input 
                                type = "password" required
                                onChange={(e)=>{
                                    setPassword(e.target.value);
                                }}
                            />
                            <label>Password</label>
                        </div>

                        <div className="input-box">
                            <span className="icon"> <Icon.KeyFill size={25} className="cart"/> </span>
                            <input 
                                type = "password" required
                                onChange={(e)=>{
                                    setConfirmPassword(e.target.value);
                                }}
                            />
                            <label>Confirm Password</label>
                        </div>
                        
                        <button type="submit" className="button-in-signin" onClick={signup}>Sign Up</button>
                        
                        <div className="signin-signup">
                            <p>Already have an account?  <a href="/signin" className="sinup-link">  Sign In</a>
                            </p>
                        </div>

                    </form>
                </div>    
            </div>
        </div>

    );
}

export default SignUp;