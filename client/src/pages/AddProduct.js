import axios from "axios";
import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";


export default function AddProduct() {

    axios.defaults.withCredentials = true;
    const navigate = useNavigate();
    // Use state to store the product details
    const [productname, setProductname] = useState("");
    const [discountprice, setDiscountprice] = useState("");
    const [originalprice, setOriginalprice] = useState("");
    const [description, setDescription] = useState("");
    // number of stock 
    const [stock, setStock] = useState("");
    const [image, setImage] = useState("");

    // Post request to add product
    const addProduct = (e) => {
        e.preventDefault();
        console.log(image);
        axios.post('http://localhost:3001/api/addProduct', { productname: productname, discountprice: discountprice, originalprice: originalprice, description: description, image: image, stock: stock }, { withCredentials: true }).then((response) => {
            if (response.data.loggedIn === false) {
                navigate("/merchantsignin");
            }
            else {
                // send a toast message
                toast.success("Product Added");
            }
        })
    }

    return (
        <div className="form-padding">
            <ToastContainer />
            {/* A form taking product name, discount price original price description and option to upload image  */}

            <form className="product-form-container">
                <h2 className="product-form-title">Add a Product</h2>
                <div className="product-form-group">
                    <label htmlFor="product-name" className="product-form-label">Product Name:</label>
                    <input type="text" id="product-name" className="product-form-input" onChange={(e) => setProductname(e.target.value)} />

                </div>
                <div className="product-form-group">
                    <label htmlFor="description" className="product-form-label">Description:</label>
                    <textarea id="description" className="product-form-textarea" onChange={(e) => setDescription(e.target.value)}></textarea>
                </div>
                <div className="product-form-group">
                    <label htmlFor="price" className="product-form-label">Original Price:</label>
                    <input type="number" id="price" className="product-form-input" onChange={(e) => setOriginalprice(e.target.value)} />
                </div>
                <div className="product-form-group">
                    <label htmlFor="price" className="product-form-label">Discount Price:</label>
                    <input type="number" id="price" className="product-form-input" onChange={(e) => setDiscountprice(e.target.value)} />
                </div>
                <div className="product-form-group">
                    <label htmlFor="price" className="product-form-label">Stock :</label>
                    <input type="number" id="price" className="product-form-input" onChange={(e) => setStock(e.target.value)} />
                </div>
                <div className="product-form-group">
                    <label htmlFor="image" className="product-form-label">Image:</label>
                    <input type="file" id="image" className="product-form-input" onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))} />
                </div>
                <button type="submit" className="product-form-btn" onClick={addProduct}>Submit</button>
            </form>


        </div>

    );
}