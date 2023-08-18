import { useParams } from 'react-router-dom';
import axios from "axios"
import { Fragment, useEffect, useState } from "react";
// import the toastify css
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Dice1 } from 'react-bootstrap-icons';
import * as Icon from "react-bootstrap-icons"
import logo from '../eagle.png'

const convertByteaToUrl = async (bytea) => {
    const blob = new Blob([bytea], { type: 'image/jpeg' });
    const url = URL.createObjectURL(blob);
    return url;
};

export default function MerchantProductView(props) {
    const query = useParams();
    const productid = query.productid;
    const [data, setData] = useState({});
    const [image, setImage] = useState(null);
    // import the navigator thing
    const navigate = useNavigate();
    axios.defaults.withCredentials = true;
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [reviewList, setReviewList] = useState([]);
    const [avgRating, setAvgRating] = useState(0);

    const logout = (e) => {
        e.preventDefault();
        navigate("/logout");
    };


    const fetchImage = async (id) => {
        const response = await axios.get(`http://localhost:3001/api/image/${id}`, { responseType: "blob", withCredentials: true });
        const imageData = response.data;
        const url = await convertByteaToUrl(imageData);
        setImage(url);
    };

    const reviewSubmitHandler = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }
        else if (review === "") {
            toast.error("Please write a review");
            return;
        }
        else {
            axios.post('http://localhost:3001/api/addReview', { productid: productid, rating: rating, review: review }, { withCredentials: true })
                .then((response) => {
                    if (response.data.error) {
                        toast.error(response.data.error);
                    }
                    else {
                        toast.success(response.data.message);
                    }
                });
        }

    };


    useEffect(() => {
        axios.get(`http://localhost:3001/api/getProduct/${productid}`, { withCredentials: true })
            .then((response) => {
                if(response.data.loggedIn===false){
                    navigate("/signin");
                }
                setData(response.data.data);
                fetchImage(response.data.data.imageid);
                setReviewList(response.data.reviews);
                setAvgRating(response.data.avg);
            })
            .catch((err) => {
                //if status is 404 then redirect to 404 page
                if(err.response.status===404){
                    navigate("/404");
                }
                console.log(err);
            });

    }, []);

    return (
        <div className='viewProductpage'>
        <header>
                <h2 className="logo"> Ekart </h2>
                <nav className="navigation">
                    <a href="/merchanthome"><Icon.House size={25} className="home"/></a>
                    <button class = "btnLogout-popup" onClick={logout}>Log Out</button>
                </nav>
        </header>

        <Fragment>
            <ToastContainer />
            {data.productid ? (
                <Fragment>
                <section className='container sproduct my-5 pt-5'>
                    <div className='row mt-5'>
                        <div className='col-lg-5 col-md-12 col-12'>
                            <img className='img-fluid w-75' src={image} alt="" />
                        </div>
                        <div className='col-lg-5 col-md-12 col-12'>
                            <h3 className='py-4'>{data.productname}</h3>
                            <h2>₹{data.discountprice}</h2>
                            <p className='spaninright'>Manufacture: {data.merchantname}</p>
                            <h5>Average Rating: {Number(avgRating).toFixed(2)}</h5>
                            {/* <button className='buy-btn' onClick={cartHandler}>Add to Cart</button> */}
                            <h4 className='mt-5 mb-5'>Description</h4>
                            <p className='spaninright'>{data.description}</p>
                        </div>
                    </div>
                </section>
                {/* <div className="product-down">
                    

                    
                    <h4 className="review">Review</h4>
                    <textarea className="reviewbox" rows="4" cols="50" name="review" form="usrform" onChange={reviewChangeHandler} >
                    </textarea>
                    <div className='stars'>
                        <button className="starButton" type="button" onClick={() => setRating(1)}>{rating > 0 ? <Icon.StarFill size={25} className="home"/> : <Icon.Star size={25} className="home"/>}</button>
                        <button className="starButton" type="button" onClick={() => setRating(2)}>{rating > 1 ? <Icon.StarFill size={25} className="home"/> : <Icon.Star size={25} className="home"/>}</button>
                        <button className="starButton" type="button" onClick={() => setRating(3)}>{rating > 2 ? <Icon.StarFill size={25} className="home"/> : <Icon.Star size={25} className="home"/>}</button>
                        <button className="starButton" type="button" onClick={() => setRating(4)}>{rating > 3 ? <Icon.StarFill size={25} className="home"/> : <Icon.Star size={25} className="home"/>}</button>
                        <button className="starButton" type="button" onClick={() => setRating(5)}>{rating > 4 ? <Icon.StarFill size={25} className="home"/> : <Icon.Star size={25} className="home"/>}</button>
                    </div>
                    {rating ===0 ? <p className='spaninright'>please choose a rating</p> : null}
                    <button className="buy-btn" type="submit" onClick={reviewSubmitHandler}>Submit</button>

                </div> */}
                <h2 className="title">Reviews</h2>
                <div className='review_section'>
                    
                    {reviewList.map((review) => {
                        return (
                            <div className="reviewbox2">
                                <p className='reviews_p'>Rating: {review.rating}</p>
                                <p className='reviews_p'>Review: {review.review}</p>
                                <p className='reviews_p'>Date : {review.dateofreview}</p>
                                <p className='reviews_p'>user id : {review.userid}</p>
                            </div>
                        )
                    }
                    )}
                </div>
                </Fragment>
            
            ) : null}
        </Fragment>
        </div>

    )
}