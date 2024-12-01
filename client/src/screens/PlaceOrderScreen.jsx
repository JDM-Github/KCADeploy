import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { Card, Col, Row } from "react-bootstrap";
import { Store } from "../Store";
import { Link, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import CheckoutSteps from "../components/CheckoutSteps";
import { TextField, Typography, Button } from "@mui/material";
import { toast } from "react-toastify";
import Axios from "axios";
import LoadingBox from "../components/LoadingBox";
import getError from "../utils";
import axios from "axios";
import RequestHandler from "../functions/RequestHandler";

function reducer(state, action) {
	switch (action.type) {
		case "CREATE_REQUEST":
			return { ...state, loading: true };
		case "CREATE_SUCCESS":
			return { ...state, loading: false };
		case "CREATE_FAIL":
			return { ...state, loading: false };
		default:
			return;
	}
}

function PlaceOrderScreen() {
	const navigate = useNavigate();

	const [{ loading }, dispatch] = useReducer(reducer, { loading: false });

	const { state, dispatch: ctxDispatch } = useContext(Store);
	const {
		cart,
		userInfo,
		cart: { shippingAddress },
	} = state;

	const updateCartHandler = async (item, quantity) => {
		alert(JSON.stringify(cart));

		// const data = await RequestHandler.handleRequest(
		// 	"get",
		// 	`products/${item.id}`
		// );
		// if (data.countInStock < quantity) {
		// 	window.alert("SORRY. PRODUCT IS OUT OF STOCK");
		// 	return;
		// }

		ctxDispatch({
			type: "CART_ADD_ITEM",
			payload: { ...item, quantity },
		});
	};

	const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; //123.1236 => 123.23 round off the number
	cart.itemsPrice = round2(
		cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0)
	);
	cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(10);
	cart.taxPrice = round2(0.5 * (cart.itemsPrice + cart.shippingPrice));
	cart.totalPrice = cart.itemsPrice + cart.shippingPrice; // + cart.taxPrice;

	const handleImageUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;
		try {
			const filename = await uploadPaymentImage(file);
			ctxDispatch({ type: "SET_PAYMENT_IMAGE", payload: filename });
			toast.success("Payment image uploaded successfully.");
		} catch (error) {
			toast.error("Error uploading image.");
		}
	};

	const uploadPaymentImage = async (file) => {
		const formData = new FormData();
		formData.append("image", file);

		const data = await RequestHandler.handleRequest(
			"post",
			"uploadImage",
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
				},
			}
		);
		return data.filename;
	};

	const placeOrderHandler = async () => {
		try {
			dispatch({ type: "CREATE_REQUEST" });

			if (!cart.paymentImage) {
				throw new Error("No payment image available.");
			}

			const data = await RequestHandler.handleRequest(
				"post",
				"orders",
				{
					orderItems: cart.cartItems,
					shippingAddress: cart.shippingAddress,
					paymentMethodName: cart.paymentMethodName,
					referenceNumber: cart.referenceNumber,
					paymentImage: cart.paymentImage,
					itemsPrice: cart.itemsPrice,
					shippingPrice: cart.shippingPrice,
					taxPrice: cart.taxPrice,
					totalPrice: cart.totalPrice,
					userId: userInfo.id,
				},
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
					},
				}
			);
			ctxDispatch({ type: "CART_CLEAR" });
			dispatch({ type: "CREATE_SUCCESS" });
			localStorage.removeItem("cartItems");
			navigate(`/order/${data.order.id}`);
		} catch (err) {
			dispatch({ type: "CREATE_FAIL" });
			toast.error(getError(err));
		}
	};

	useEffect(() => {
		if (!cart.paymentMethodName) {
			navigate("/payment");
		}
	}, [cart, navigate]);

	return (
		<div className="bg-gray-100 min-h-screen p-6">
			<Helmet>
				<title>Preview Order</title>
			</Helmet>
			<CheckoutSteps step1 step2 step3 step4 />

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Left Column: Shipping, Payment, and Items */}
				<div className="space-y-6">
					{/* Shipping Card */}
					<div className="bg-white shadow-lg rounded-lg p-6 mb-4">
						<h2 className="text-xl font-semibold mb-4">Shipping</h2>
						<p>
							<strong>Name: </strong>
							{cart.shippingAddress.fullName}
							<br />
							<strong>Last Name: </strong>
							{cart.shippingAddress.LastName}
							<br />
							<strong>Address: </strong>
							{cart.shippingAddress.address},{" "}
							{cart.shippingAddress.city}
							<br />
							<strong>Phone Number: </strong>
							{cart.shippingAddress.postalCode}
						</p>
						<Link to="/shipping">
							<button className="mt-4 w-full bg-yellow-500 text-black font-semibold py-2 rounded-lg hover:bg-yellow-600 transition">
								EDIT
							</button>
						</Link>
					</div>

					{/* Payment Card */}
					<div className="bg-white shadow-lg rounded-lg p-6 mb-4">
						<h2 className="text-xl font-semibold mb-4">Payment</h2>
						<p>
							<strong>Method: </strong>
							{cart.paymentMethodName}
							<br />
							<strong>Reference Number: </strong>
							{cart.referenceNumber}
							<br />
							{cart.paymentImage && (
								<>
									<strong>Payment Image: </strong>
									<br />
									<img
										src={cart.paymentImage}
										alt="Payment Image"
										className="w-24 h-auto mt-2"
									/>
								</>
							)}
						</p>
						<Link to="/payment">
							<button className="mt-4 w-full bg-yellow-500 text-black font-semibold py-2 rounded-lg hover:bg-yellow-600 transition">
								EDIT
							</button>
						</Link>
					</div>

					{/* Items Card */}
					<div className="bg-white shadow-lg rounded-lg p-6 mb-4">
						<h2 className="text-xl font-semibold mb-4">Items</h2>
						<div className="space-y-4">
							{cart.cartItems.map((item) => (
								<div
									key={item.id}
									className="flex items-center justify-between"
								>
									<div className="flex items-center space-x-4">
										<img
											src={item.image}
											alt={item.name}
											className="w-16 h-16 object-cover rounded-lg"
										/>
										<span className="text-sm">
											{item.name}
										</span>
									</div>

									{/* Quantity Update */}
									<div className="flex items-center space-x-2">
										<button
											className="bg-gray-300 text-gray-700 p-2 rounded-lg"
											disabled
										>
											<i className="fas fa-minus-circle"></i>
										</button>

										<span className="text-center w-8">
											{item.quantity}
										</span>

										<button
											className="bg-gray-300 text-gray-700 p-2 rounded-lg"
											disabled
										>
											<i className="fas fa-plus-circle"></i>
										</button>
									</div>

									{/* Price */}
									<div className="text-right text-lg font-semibold">
										₱
										{(item.price * item.quantity).toFixed(
											2
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Right Column: Order Summary */}
				<div className="max-h-[250px] flex flex-col justify-start bg-gray-100 py-6 px-4 w-full bg-white shadow-lg rounded-lg">
					<h2 className="text-xl font-semibold mb-4">
						Order Summary
					</h2>
					<ul className="space-y-4">
						<li className="flex justify-between">
							<span>Items</span>
							<span>₱{cart.itemsPrice.toFixed(2)}</span>
						</li>
						<li className="flex justify-between">
							<span>Shipping</span>
							<span>₱{cart.shippingPrice.toFixed(2)}</span>
						</li>
						<li className="flex justify-between">
							<span>Down Payment</span>
							<span>₱{cart.taxPrice.toFixed(2)}</span>
						</li>
						<li className="flex justify-between font-semibold">
							<span>Order Total</span>
							<span>₱{cart?.totalPrice?.toFixed(2)}</span>
						</li>
						{/* Place Order Button */}
						<li className="flex justify-center mt-6">
							<button
								className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-lg hover:bg-yellow-600 transition"
								type="button"
								onClick={placeOrderHandler}
								disabled={cart.cartItems.length === 0}
							>
								<span className="text-xl">PLACE ORDER</span>
							</button>
							{loading && <LoadingBox />}
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}

export default PlaceOrderScreen;
