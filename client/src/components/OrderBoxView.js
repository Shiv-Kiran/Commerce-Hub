import { Fragment } from "react";
import ProductRowView from "./ProductRowView";
export default function OrderBoxView(props) {

    const products = props.order.products;
    const orderid = props.order.orderid;
    const totalcost = props.order.totalcost;
    const orderdate = props.order.orderdate;
    return (
        <div >
            <div className="order-box-header">
  <div className="order-id">Order ID : {orderid}</div>
  <div className="order-details">
    <div>Total Cost : {totalcost}</div>
    <div>Order Date : {orderdate}</div>
  </div>
</div>
            <div className="order-box-body">
                {products.map((item, i) => (
                    <Fragment key={i}>
                        <ProductRowView product={item} />
                    </Fragment>
                ))}
            </div>
        </div>
    )
}