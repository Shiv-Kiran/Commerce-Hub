import Axios from "axios";
import React, { Fragment, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons"
import HomePageContent from "../components/HomePageContent";

const convertByteaToUrl = async (bytea) => {
    const blob = new Blob([bytea], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    return url;
};


const Home = () =>{

    const [loginStatus , setLoginStatus] = useState(false);
    const [username, setUsername]  = useState("");
    const navigate = useNavigate();

    const signin = (e) => {
        e.preventDefault();
        navigate("/signin");
    };

    const logout = (e) => {
        e.preventDefault();
        navigate("/logout");
    };

    useEffect(()=>{
        Axios.get("http://localhost:3001/session").then((response) => {
            if(response.data.loggedIn === true){
                setLoginStatus(true);
                setUsername(response.data.username);
            }
            else{
                setLoginStatus(false);
                setUsername("");
                navigate("/signin")
            }
        })
    }, [])

    return(
        <div className="divhome">
            <header>
                <h2 className="logo"> Ekart </h2>
                <nav className="navigation">
                    <a href="/about">About</a>
                    <a href="/"><Icon.House size={25} className="home"/></a>
                    <a href="/cart"> <Icon.Cart3 size={25} className="cart"/> Cart</a>
                    <a href="/profile"><Icon.PersonCircle size={30} className="profile"/> {username}</a>
                    {loginStatus ? null :<button class = "btnLogin-popup" onClick={signin}>Sign In</button>}
                    {loginStatus ? <button class = "btnLogout-popup" onClick={logout}>Log Out</button> : null }
                </nav>
            </header>

            
                <Fragment>
                    <div className="middle">
                    {loginStatus ? <HomePageContent/> : null}
                    </div>
                </Fragment>
        
            
        </div>
    )
}

export default Home;