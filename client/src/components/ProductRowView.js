
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const convertByteaToUrl = async (bytea) => {
    const blob = new Blob([bytea], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    return url;
};

export default function ProductRowView(props) {
    const imageid = props.product.imageid;
    const productid = props.product.productid;
    const productname = props.product.productname;
    const quantity = props.product.quantity;
    const price = props.product.totprice;

    const [image, setImage] = useState(null);
    axios.defaults.withCredentials = true;
    const fetchImage = async () => {
        const response = await axios.get(`http://localhost:3001/api/image/${imageid}`, { responseType: "blob", withCredentials: true });
        const imageData = response.data;
        const url = await convertByteaToUrl(imageData);
        setImage(url);
    };
    useEffect(() => {
        fetchImage();
    }, []);

    return (
        <>
<div className="product-row">
  <div className="product-row-info">
    <div className="product-name fixing_longlenght">
      {productname.length > 30 ? productname.substring(0, 60) + " ..." : productname}
    </div>
    <div className="product-details">
      <p>Quantity: {quantity}</p>
      <p>Price: {price}</p>
    </div>
  </div>
  <div className="product-row-image">
    <img width="200" height="100" src={image} alt="product image" />
  </div>
</div>
        </>
    );

}