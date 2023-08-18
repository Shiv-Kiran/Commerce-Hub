import axios from "axios";
import { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProductSummaryView from "./ProductSummaryView";

export default function Home() {
  const [data, setData] = useState([]);
  const navigator = useNavigate();

  

  const productClickHandler = (id) => {
    navigator(`/product/${id}`);
  };


  useEffect(() => {
    axios.get("http://localhost:3001/api/getProducts", { withCredentials: true })
      .then((response) => {
        setData(response.data.data);
      });
  }, []);

  return (
    <Fragment>
      {data.length > 0 ? (
        <div className="small-container">
          <h2 className="title">Featured Products</h2>
          {/* <div className="row"> */}
            <div className="my_col">
              <>
                {data.map((product, i) => (

                  <div className="product_card" key={i}>
                    <div onClick={()=>{productClickHandler(product.productid)}}>
                    <ProductSummaryView product={product}  />
                    </div>
                  </div>
                ))}
              </>
            </div>        
          {/* </div> */}

        </div>


      ) : null}
    </Fragment>
  )


}