import axios from "axios";
import React, { Fragment, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import * as Icon from "react-bootstrap-icons"
import logo from '../eagle.png'



import OrderBoxView from "../components/OrderBoxView";

export default function Profile() {
    const [orders, setOrders] = useState([]);
    const [username, setUsername] = useState("");
    const [loginStatus, setLoginStatus] = useState(false);



    const navigator = useNavigate();
    axios.defaults.withCredentials = true;
    
    
    const signin = (e) => {
        e.preventDefault();
        navigator("/signin");
    };

    const logout = (e) => {
        e.preventDefault();
        navigator("/logout");
    };

    useEffect(() => {
        axios.get('http://localhost:3001/api/orders', { withCredentials: true })
            .then((response) => {
                if (response.data.loggedIn === false) {
                    navigator("/signin");
                }
                console.log(response.data.orders)
                setOrders(response.data.orders);
            });
    }, [])

    useEffect(() => {
        axios.get("http://localhost:3001/session").then((response) => {
            if (response.data.loggedIn === true) {
                setLoginStatus(true);
                setUsername(response.data.username);
            }
            else {
                setLoginStatus(false);
                setUsername("");
                navigator("/signin")
            }
        })
    }, [])


    return (
        <>
            <header>
                <img src={logo} width="40" height="40"></img>
                <nav className="navigation">
                    <a href="/about">About</a>
                    <a href="/"><Icon.House size={25} className="home" /></a>
                    <a href="/cart"> <Icon.Cart3 size={25} className="cart" /> Cart</a>
                    <a href="/profile"><Icon.PersonCircle size={30} className="profile" /> {username}</a>
                    {loginStatus ? null : <button class="btnLogin-popup" onClick={signin}>Sign In</button>}
                    {loginStatus ? <button class="btnLogout-popup" onClick={logout}>Log Out</button> : null}
                </nav>
            </header>
            <div className="top_margin">


             {orders.length > 0 ? (
                 <>
      <h2 className="product-form-title">Previous Orders</h2>

                        {orders.map((item, i) => (
                            <Fragment key={i}>
                                <div class="order-box">
                                <OrderBoxView order={item} />
                                </div>
                            </Fragment>
                        ))}
                    </>
                ) : 
                <div className="empty_cart">
                <h1><Icon.CartX className="empty_cart_icon"/></h1>
                </div>}

                    </div >
        </>
    )
}