import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

export default function CartProductView(props){
    const item = props.item;
    const product = props.item.product;
    const quantity = props.item.quantity;
    const stock = props.item.stock;
    axios.defaults.withCredentials = true;
    const cartHandler = (action) => {
        axios.post('http://localhost:3001/api/addToCart', { productid: product.productid , action : action }, { withCredentials: true })
            .then((response) => {
                if (response.data.error) {
                    // toast.error(response.data.error);
                }
                else {
                    // reload the page
                    window.location.reload();
                }
            });
    }
    const convertByteaToUrl = async(bytea) => {
        const blob = new Blob([bytea], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        return url;
    };
    const [image, setImage] = useState(null);
    const fetchImage = async () => {
        const response = await axios.get(`http://localhost:3001/api/image/${product.imageid}`, { responseType:"blob", withCredentials:true });
        const imageData = response.data;
        const url = await convertByteaToUrl(imageData);
        setImage(url);
    };

    useEffect(() => {
        fetchImage();
        if(quantity > stock){
            props.checkHandler(false);
        }
    }, []);
    return (
        <div className='row mt-5'>
            <div className='col-lg-5 col-md-12 col-12'>
                <img className='img-fluid w-25' src={image} alt="" />
                <p>Quantity: {quantity}</p>
                <button className="plusminusbtn" onClick={()=>cartHandler(1)}>+</button>
                <button className="plusminusbtn" onClick={()=>cartHandler(-1)}>-</button>
            </div>
            <div className='col-lg-5 col-md-12 col-12'>
                <h6 className='py-4'>{product.productname}</h6>
                <h4>₹{product.discountprice}</h4>
                <p className='spaninright'>Manufacture: {product.merchantname}</p>
            </div>
            {quantity > stock ? <p>Only {stock} in stock </p> : null}
        </div>
    )
}
