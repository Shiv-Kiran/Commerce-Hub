const cors = require('cors');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { Client, Pool } = require('pg');
const fs = require('fs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use(cookieParser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'secret',
    cookie: { maxAge: oneDay, }
}));


const rawdata = fs.readFileSync('./config.txt');
const config = JSON.parse(rawdata);
const user = config.user;
const password = config.password;
const host = config.host;
const port = config.port;
const database = config.database;
// Connect to the PostgreSQL database
const client = new Client({
    connectionString: `postgres://${user}:${password}@${host}:${port}/${database}`
});

client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('connected')
    }
}
);

const checkLoggedIn = async (req, res, next) => {
    console.log(req.session.user);
    // console.log(req.session.role);
    if (!req.session.user) {
        return res.json({ loggedIn: false, status: 'false' });
    }
    next();
};

const checkBuyer = async (req, res, next) => {
    if (req.session.role !== 'buyer') {
        return res.json({ loggedIn: false });
    }
    next();
};

const checkMerchant = async (req, res, next) => {
    if (req.session.role !== 'merchant') {
        return res.json({ loggedIn: false });
    }
    next();
};

app.get('/api/getProducts', checkLoggedIn, async (req, res) => {
    try {
        const response = await client.query('SELECT * FROM products  limit 10');
        res.status(200).json({ 'data': response.rows });
    } catch (err) {
        console.log('error in /api/getProducts')
        console.error(err.message);
    }
});

app.get('/api/merchantHome', checkLoggedIn, checkMerchant, async (req, res) => {
    try {
        const merchantid = parseInt(req.session.userid, 10);
        console.log("merchant id is trying to access merchant home" + merchantid);
        const response = await client.query('SELECT merchantname from merchant_table where merchantid = $1', [merchantid]);
        const merchantname = response.rows[0].merchantname;
        const response2 = await client.query('SELECT * from products where merchantname = $1', [merchantname]);
        const products = response2.rows;
        console.log(merchantname);
        res.json({ merchantname: merchantname,products : products });
    } catch (err) {
        console.log('error in /api/merchantHome')
        console.error(err.message);
    }
});


app.get('/api/getProduct/:id', checkLoggedIn, async (req, res) => {
    try {
        const id = req.params.id;
        const response = await client.query('SELECT * FROM products WHERE productid = $1', [id]);
        const products = response.rows;
        const reviewresponse = await client.query('SELECT * FROM review_table WHERE productid = $1', [id]);
        const reviews = reviewresponse.rows;
        const avgrating = await client.query('SELECT avg(rating) as average FROM review_table WHERE productid = $1', [id]);
        const avg = avgrating.rows[0].average;
        //if not equal to 1 then error
        if (products.length === 1) {
            res.status(200).json({ 'data': products[0], reviews: reviews, avg: avg });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.log("error in /api/getProduct/:id")
        console.error(err.message);
    }
});

app.get('/session', checkLoggedIn, async (req, res) => {
    // TODO HERE ACTUALLY I HAVE TO IMPLEMENT SESSIONS BUT INSTEAD FOR NOW I AM JUST SENDING RANDOM OUTPUT
    try {
        if (req.session.role === 'buyer') {
            console.log("userid is " + req.session.userid);
            const userid = parseInt(req.session.userid, 10);
            const response = await client.query('SELECT user from buyer_table where id = $1', [userid]);
            const users = response.rows;
            const username = users[0].buyeremail;
            res.send({ loggedIn: true, userid: userid, username: username });
        }
        else if (req.session.role === 'merchant') {
            console.log("userid is " + req.session.userid);
            const userid = parseInt(req.session.userid, 10);
            const response = await client.query('SELECT user from merchant_table where merchantid = $1', [userid]);
            const users = response.rows;
            const username = users[0].merchantemail;
            res.send({ loggedIn: true, userid: userid, username: username });
        }
        else {

        }
    }
    catch (err) {
        console.log("error in /session");
        console.error(err.message);
    }
});

// app.get('/api/merchantsession', checkLoggedIn, async (req, res) => {});

app.get('/api/image/:id', checkLoggedIn, async (req, res) => {
    try {
        const id = req.params.id;
        console.log("image id is " + id);
        const response = await client.query('SELECT imagedata FROM images WHERE imageid = $1', [id]);
        const images = response.rows;
        //if not equal to 1 then error
        if (images.length === 1) {
            const image = images[0].imagedata;
            // console.log("sending image of size"+image.length);
            res.send(image);
        } else {
            res.status(404).json({ error: 'Image not found' });
        }
    } catch (err) {
        console.log("error in /api/image/:id")
        console.error(err.message);
    }
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.send({loggedout:true});
})
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const response = await client.query('SELECT * FROM buyer_table WHERE buyeremail = $1', [username]);
        const users = response.rows;
        //if not equal to 1 then error
        // console.log(users);
        if (users.length === 1) {
            const user = users[0];
            const match = (password === user.password);
            if (match) {
                // if(req.session.userid){
                //     req.session.destroy();
                // }
                req.session.user = user.buyeremail;
                req.session.userid = String(user.id);
                // console.log("session id is "+req.session.userid);
                // req.session.role = user.role;
                req.session.role = "buyer";
                res.status(200).json({ loggedIn: true, userid: user.id, username: user.buyeremail });
            } else {
                res.json({ error: 'Incorrect password' });
            }
        } else {
            res.json({ error: 'User not found' });
        }
    } catch (err) {
        console.log("error in /api/login")
        console.error(err.message);
    }
});

app.post('/api/merchantlogin', async (req, res) => {
    try {
        // const { email, password } = req.body;
        const email = req.body.username;
        const password = req.body.password;
        const response = await client.query('SELECT * FROM merchant_table WHERE merchantemail = $1', [email]);
        const users = response.rows;
        if (users.length === 1) {
            const user = users[0];
            const match = (password === user.merchantpassword);
            if (match) {
                // if(req.session.userid){
                //     req.session.destroy();
                // }
                req.session.user = user.merchantemail;
                req.session.userid = String(user.merchantid);
                // console.log("session id is "+req.session.userid);
                // req.session.role = user.role;
                req.session.role = "merchant";
                res.status(200).json({ loggedIn: true, userid: user.merchantid, username: user.merchantemail });
            } else {
                res.json({ error: 'Incorrect password' });
            }
        } else {
            res.json({ error: 'User not found' });
        }

    } catch (err) {
        console.log('error in /api/merchantlogin');
        console.error(err.message);
    }
});

app.post('/api/addReview', checkLoggedIn, async (req, res) => {
    try {
        const productid = req.body.productid;
        const userid = req.session.userid;
        const review = req.body.review;
        const rating = req.body.rating;
        const date = new Date();
        // put the date as today's date 
        // should be in dd-mm-yyyy format
        const response = await client.query('INSERT INTO review_table (productid,userid,review,rating,dateofreview) VALUES ($1,$2,$3,$4,$5)', [productid, userid, review, rating, date]);
        if (response.rowCount === 1) {
            res.json({ message: "Review added successfully" });
        }
        else {
            res.json({ error: "Error in adding review" });
        }
    } catch (err) {
        console.log("error in /api/addReview")
        console.error(err.message);
    }

});

app.get('/api/cartItems', checkLoggedIn, async (req, res) => {
    if (!req.session.cart) {
        req.session.cart = {};
    }
    const cart = req.session.cart;
    const cartData = [];
    // const productids = Object.keys(cart);
    // const quantities = Object.values(cart);
    // res.json({productids:productids,quantities:quantities});
    var totalcost = 0;
    for (const productid in cart) {
        const response = await client.query('SELECT * FROM products where productid = $1', [productid]);
        const product = response.rows[0];
        const response2 = await client.query('SELECT stock FROM stock_table where productid = $1', [productid]);
        const stock = response2.rows[0].stock;
        const cost = parseInt(product.discountprice, 10) * cart[productid];
        totalcost += cost;
        cartData.push({ product: product, quantity: cart[productid], stock: stock, cost: cost });
    }
    res.json({ cartData: cartData, cost: totalcost });
});

app.post('/api/addToCart', checkLoggedIn, checkBuyer, async (req, res) => {
    try {
        const productid = req.body.productid;
        const action = req.body.action;
        // now i want to store the all the productids and their quantities in the session of the user
        // so that i can access it later
        // i want req.session.cart as a json object with key as productid and value as quantity
        // if the productid is already present in the cart then i want to increment the quantity by 1
        // else i want to add the productid to the cart with quantity as 1
        // console.log("productid is "+productid);
        // if(!req.session.cart){
        //     req.session.cart = {};
        // }
        // if(req.session.cart[productid]){
        //     req.session.cart[productid] = req.session.cart[productid]+1;
        // }
        // else{
        //     req.session.cart[productid] = 1;
        // }
        if (!req.session.cart) {
            req.session.cart = {};
        }
        if (action === 1) {
            if (req.session.cart[productid]) {
                req.session.cart[productid] = req.session.cart[productid] + 1;
            }
            else {
                req.session.cart[productid] = 1;
            }
        }
        else if (action === -1) {
            if (req.session.cart[productid]) {
                var r = req.session.cart[productid];
                if (r === 1) {
                    delete req.session.cart[productid];
                    // does this delete the key of productid in the json
                    // ans : no
                }
                else {
                    req.session.cart[productid] = r - 1;
                }
            }
        }
        else {

        }
        res.json({ message: "Added to cart successfully" });
    }
    catch (err) {
        console.log("error in /api/addToCart");
        console.error(err.message);
    }
});

app.get('/api/orders', checkLoggedIn, checkBuyer, async (req, res) => {
    try {
        const userid = req.session.userid;
        // const response = await client.query('SELECT * FROM order_table where userid = $1', [userid]);
        const response = await client.query('SELECT orderid FROM order_table where userid=$1 GROUP BY orderid ORDER BY orderid DESC', [userid]);
        const orderids = response.rows;
        console.log(orderids);
        const orders = [];
        for (i = 0; i < orderids.length; i++) {
            const orderid = orderids[i].orderid;
            const response2 = await client.query('SELECT imageid,orderid,productid,quantity,totprice,productname FROM order_table JOIN products USING(productid) where orderid = $1', [orderid]);
            const products = response2.rows;
            const response3 = await client.query('SELECT orderdate FROM order_table where orderid = $1', [orderid]);
            const orderdate = response3.rows[0].orderdate;
            // now loop through the order array and find the total cost of the order
            var totalcost = 0;
            for (j = 0; j < products.length; j++) {
                totalcost += products[j].totprice;
            }
            orders.push({ orderid: orderid, products: products, totalcost: totalcost,orderdate : orderdate });
        }
        
        res.json({orders:orders});
    }
    catch (err) {
        console.log("error in /api/orders");
        console.error(err.message);
    }
});

app.post('/api/checkout', checkLoggedIn, checkBuyer, async (req, res) => {
    try {
        const cartItems = req.body.cartItems;
        const userid = req.session.userid;
        const date = new Date();
        //cartItems is an array of objects
        var newestoid = 0;
        await client.query('BEGIN');
        for (i = 0; i < cartItems.length; i++) {
            const productid = cartItems[i].product.productid;
            const quantity = cartItems[i].quantity;
            const cost = cartItems[i].cost;
            // start a new transaction
            if (i === 0) {
                const response = await client.query('INSERT INTO order_table (productid,quantity,totprice,orderdate,userid) VALUES ($1,$2,$3,$4,$5) RETURNING orderid', [productid, quantity, cost, date, userid]);
                newestoid = response.rows[0].orderid;
            }
            else {
                const response = await client.query('INSERT INTO order_table (orderid,productid,quantity,totprice,orderdate,userid) VALUES ($1,$2,$3,$4,$5,$6) ', [newestoid, productid, quantity, cost, date, userid]);
            }

        }
        // await client.query('COMMIT');
        req.session.cart = {};
        res.json({ message: "order placed successfully" });
        // now we should decrease the stock of the products
        // await client.query('BEGIN');
        for (i = 0; i < cartItems.length; i++) {
            const productid = cartItems[i].product.productid;
            const quantity = cartItems[i].quantity;
            const response = await client.query('UPDATE stock_table SET stock = stock-$1 WHERE productid = $2', [quantity, productid]);
            if (response.rowCount === 1) {
                // do nothing
            }
            else {
                console.log("error in updating stock");
            }
        }
        await client.query('COMMIT');

    }
    catch (err) {
        // we should rollback the transaction
        await client.query('ROLLBACK');
        console.log("error in /api/checkout");
        console.error(err.message);
    }
});


app.post("/api/addProduct", checkLoggedIn, async (req, res) => {
    try {
        const productname = req.body.productname;
        const productdescription = req.body.description;
        const productprice = req.body.originalprice;
        const productdiscountprice = req.body.discountprice;
        const image = req.body.image;
        const stock = req.body.stock;
        // get merchantname from merchant_table using merchantid
        const res_mer = await client.query('SELECT merchantname FROM merchant_table WHERE merchantid = $1', [req.session.userid]);
        // add image to images table and then get imageid
        const merchantname = res_mer.rows[0].merchantname;

        // const resp = await client.query('INSERT INTO images (imagedata) VALUES ($1) RETURNING imageid', [image]);
        // const imageid = resp.rows[0].imageid;
        const imageid = 55;
        // get the largest productid from products table and then increment it by 1
        const resp_id = await client.query('SELECT MAX(productid) FROM products');
        const productid = resp_id.rows[0].max + 1;
        console.log("productid is " + productid + "merchant name is " + merchantname);
        // Now add product details along with merchant name to products table and then get the productid and store stock in stock_table 

        const response = await client.query('INSERT INTO products (productname,description,originalprice,discountprice,merchantname, imageid, productid) VALUES ($1,$2,$3,$4,$5, $6, $7) ', [productname, productdescription, productprice, productdiscountprice, merchantname, imageid, productid]);
        // add merchant id productid along with stock to stock table 
        const response2 = await client.query('INSERT INTO stock_table (productid,merchantid,stock) VALUES ($1,$2,$3)', [productid, req.session.userid, stock]);
        if (response2.rowCount === 1) {
            console.log("product added successfully");
            res.json({ message: "Product added successfully" });
        }
    }
    catch (err) {
        console.log("error in /api/addProduct");
        console.error(err.message);
    }
});


app.post("/api/updateProduct", checkLoggedIn, async (req, res) => {
    try {
        const productname = req.body.productname;
        const productdescription = req.body.description;
        const productprice = req.body.originalprice;
        const productdiscountprice = req.body.discountprice;
        const image = req.body.image;
        const stock = req.body.stock;
        const productid = req.body.productId;
        // get merchantname from merchant_table using merchantid
        const res_mer = await client.query('SELECT merchantname FROM merchant_table WHERE merchantid = $1', [req.session.userid]);
        // add image to images table and then get imageid
        const merchantname = res_mer.rows[0].merchantname;

        // Get the details from products table, check if the values we got from req.body are not null then update in products table
        const resp_product = await client.query('SELECT * FROM products WHERE productid = $1', [productid]);
        const  imageid = resp_product.rows[0].imageid;
        if (productname !== "") {
            productname = resp_product.rows[0].productname;
        }
        if (productdescription !== "") {
            productdescription = resp_product.rows[0].description;
        }
        if (productprice !== "") {
            productprice = resp_product.rows[0].originalprice;
        }
        if (productdiscountprice !== "") {
            productdiscountprice = resp_product.rows[0].discountprice;
        }
        if (image !== null) {
            // const resp = await client.query('INSERT INTO images (imagedata) VALUES ($1) RETURNING imageid', [image]);
            // const imageid = resp.rows[0].imageid;
            const imageid = 55;
        }


        console.log("productid is " + productid + "merchant name is " + merchantname);
        // Update the value in product table given productid 
        const response = await client.query('UPDATE products SET productname = $1, description = $2, originalprice = $3, discountprice = $4, merchantname = $5, imageid = $6 WHERE productid = $7', [productname, productdescription, productprice, productdiscountprice, merchantname, imageid, productid]);

        // increment stock in stock table given productid and merchantid
        const response2 = await client.query('UPDATE stock_table SET stock = stock + $1 WHERE productid = $2 AND merchantid = $3', [stock, productid, req.session.userid]);
        if (response2.rowCount === 1) {
            console.log("product added successfully");
            res.json({ message: "Product added successfully" });
        }
    }
    catch (err) {
        console.log("error in /api/addProduct");
        console.error(err.message);
    }
});

// res.status(200).json({'image':response.rows});
app.listen(3001, () => {
    // call the create password function here
    console.log('Server is listening on port 3001');
});

