import React, { useContext } from "react";
//import { Link } from 'react-router-dom';
import { useNavigate, useParams, Link } from "react-router-dom";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Rating from "./Rating";
import { Store } from "../Store";
import { toast } from "react-toastify";
import logo from "../LOGO.png";

import "./Product.css";
import RequestHandler from "../functions/RequestHandler";

function Products(props) {
	const navigate = useNavigate();

	const { product } = props;

	const { state, dispatch: ctxDispatch } = useContext(Store);
	const { cart, userInfo } = state;

	const {
		cart: { cartItems },
	} = state;

	const addToCartHandler = async (item) => {
		if (!userInfo) {
			toast.error("Please log in to add items to your cart.");
			navigate("/signin");
			return;
		}
		const existItem = cartItems.find((x) => x._id === product._id);
		const quantity = existItem ? existItem.quantity + 1 : 1;
		const data = await RequestHandler.handleRequest(
			"get",
			`products/${item.id}`
		);
		ctxDispatch({
			type: "CART_ADD_ITEM",
			payload: { ...item, quantity },
		});
	};

	return (
		<div className="product">
			<Link to={`/product/${product.slug}`}>
				<div className="image-holder">
					<img
						className="product-image"
						src={product.image}
						alt={product.name}
					/>
					<img className="logo" src={logo} />
				</div>
			</Link>

			<div className="bottom-product">
				<Rating
					rating={product.rating}
					numReviews={product.numReviews}
				/>
				<div className="product-name-price">
					<Link
						to={`/product/${product?.slug}`}
						style={{ textDecoration: "none", color: "Black" }}
					>
						<div>{product.name}</div>
					</Link>

					<div>₱{product.price.toFixed(2)}</div>
				</div>

				<div
					className="add-to-cart"
					onClick={() => addToCartHandler(product)}
				>
					ADD TO CART
				</div>
			</div>
		</div>
	);
}

export default Products;
