import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";
import * as Icon from "react-bootstrap-icons"

const convertByteaToUrl = async(bytea) => {
    const blob = new Blob([bytea], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    return url;
};



export default function ProductView(props) {
    // i am planning on making this a box that will contain product photo and other info

    const product = props.product;
    // in the product i also will get a bytea of the image and now i should display it in the frontend
    const [image, setImage] = useState(null);
    // how to display the image in the frontend

    const difference = product.originalprice - product.discountprice;


    const fetchImage = async () => {
        const response = await axios.get(`http://localhost:3001/api/image/${product.imageid}`, { responseType:"blob", withCredentials:true });
        const imageData = response.data;
        const url = await convertByteaToUrl(imageData);
        setImage(url);
    };
    useEffect(() => {
        fetchImage();
    }, []);
    



    return (
        <div className="product">
            <div className="fixing_longlenght">
                {product.productname.length > 50 ? product.productname.substring(0,50) + " ..." : product.productname }
                
            </div>
            <div className="product_image">
                <img width="300" height="100" src={image} alt="product image" />
            </div>
            <div className="product_info">
                <p>₹{product.discountprice}</p>   
                {difference ? <s>₹{product.originalprice}</s> : null}
            </div>



            

        </div>
    )
}