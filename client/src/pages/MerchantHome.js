import axios from "axios"
import { useEffect } from "react"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MerchantProductSummaryView from "../components/MerchantProductSummaryView";
import * as Icon from "react-bootstrap-icons"

export default function MerchantHome(){


    axios.defaults.withCredentials = true;
    const navigator = useNavigate();
    const [name, setName] = useState("");
    const [products,setProducts] = useState([]);
    const navigate = useNavigate();


  const productClickHandler = (id) => {
    navigator(`/merchantproduct/${id}`);
  };
    
    useEffect (() => {
        axios.get('http://localhost:3001/api/merchantHome').then((response) => {
            console.log(response.data);
            if(response.data.loggedIn === false){
                navigator("/merchantsignin");
            }
            else{
                setName(response.data.merchantname);
                setProducts(response.data.products);
            }
        })
    }, [])

    const logout = (e) => {
      e.preventDefault();
      navigate("/logout");
    };

    return(
        <div>
          <header>
                <h2 className="logo"> Ekart </h2>
                <nav className="navigation">
                    <a href="/merchanthome"><Icon.House size={25} className="home"/></a>
                    <button class = "btnLogout-popup" onClick={logout}>Log Out</button>
                </nav>
            </header>
            <div className="top-margin">

            <button onClick={() => { navigator("/addproducts") }} 
            class="add-product-button">Add Product</button>
            <h2 className="product-form-title">Products of {name}</h2>

            {products.length > 0 ? (
                    <>
                        {products.map((item, i) => (
                            <div className="small-container">
                            {/* <div className="row"> */}
                              <div className="my_col">
                                <>
                                  {products.map((product, i) => (
                  
                                    <div className="product_card" key={i}>
                                      <div onClick={()=>{productClickHandler(product.productid)}}>
                                      <MerchantProductSummaryView product={product}  />
                                      </div>
                                    </div>
                                  ))}
                                </>
                              </div>        
                            {/* </div> */}
                  
                          </div>
                        ))}
                    </>
                ) : <div className="empty_cart">
                <h1><Icon.CartX className="empty_cart_icon"/></h1>
            </div>}
            </div>

        </div>
    )
}