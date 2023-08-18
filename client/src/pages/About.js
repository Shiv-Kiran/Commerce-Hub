import Axios from "axios";
import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons"
import logo from '../eagle.png'
import tejaImg from '../teja.png'
import harshaImg from '../harsha.jpeg'
import venkyImg from '../venky.png'
import shivImg from '../shiv.jpg'





const About = () => {


    const navigate = useNavigate();

    
    Axios.defaults.withCredentials = true;


    

    return(
        <div className="aboutDiv">
            <header>
                <img src={logo} width="40" height="40"></img>
                <nav className="navigation">
                    <a href="/about">About</a>
                    <a href="/"><Icon.House size={25} className="home"/></a>
                    <a href="/cart"> <Icon.Cart3 size={25} className="cart"/> Cart</a>
                    <a href="/profile"><Icon.PersonCircle size={30} className="profile"/></a>
                </nav>
            </header>

            <div className="about_col">
                <div className="image_card">
                    <h2>Shiv kiran</h2> 
                    <img src={shivImg} width = "100" height="300"/>
                    <p>200050019</p> 
                </div>
                <div className="image_card">
                    <h2>Teja Bale</h2> 
                    <img src={tejaImg} width = "100" height="300"/>
                    <p>200050020</p> 
                </div>
                <div className="image_card">
                    <h2>Venky</h2>  
                    <img src={venkyImg} width = "100" height="300"/>
                    <p>200050030</p> 
                </div>
                <div className="image_card">
                    <h2>Harsha</h2>
                    <img src={harshaImg}/>
                    <p>200050075</p> 
                </div>
            </div>
        </div>

    );
}

export default About;