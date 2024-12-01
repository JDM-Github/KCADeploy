import React, { useContext } from "react";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ListGroup, Button, Card } from "react-bootstrap";
import RequestHandler from "../functions/RequestHandler";

function CartScreen() {
	const navigate = useNavigate();
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const {
		cart: { cartItems },
	} = state;

	const updateCartHandler = async (item, quantity) => {
		const data = await RequestHandler.handleRequest(
			"get",
			`products/${item.id}`
		);
		ctxDispatch({
			type: "CART_ADD_ITEM",
			payload: { ...item, quantity },
		});
	};

	const removeItemHandler = (item) => {
		ctxDispatch({ type: "CART_REMOVE_ITEM", payload: item });
	};

	const checkoutHandler = () => {
		navigate("/signin?redirect=/shipping");
	};

	return (
		<div className="bg-gray-100 pb-3">
			<Helmet>
				<title>Shopping Cart</title>
			</Helmet>
			<h1 className="text-2xl font-semibold text-center text-gray-800 py-4">
				Shopping Bag
			</h1>

			{/* Cart Items Section */}
			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				{cartItems.length === 0 ? (
					<div className="text-center py-8">
						<p className="text-lg text-gray-700 mb-4">
							Your cart is empty
						</p>
						<Link
							to="/search"
							className="text-blue-600 hover:text-blue-800 transition-colors font-semibold"
						>
							Go To Shop
						</Link>
					</div>
				) : (
					<div className="lg:grid lg:grid-cols-2 lg:gap-6 gap-4">
						{/* Left Column: Cart Items */}
						<div className="space-y-3">
							{cartItems.map((item) => (
								<div
									key={item.id}
									className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
								>
									<div className="flex items-center space-x-3">
										<img
											src={item.image}
											alt={item.name}
											className="w-16 h-16 object-cover rounded-md"
										/>
										<Link
											to={`/product/${item.slug}`}
											className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors"
										>
											{item.name}
										</Link>
									</div>
									<div className="flex items-center justify-between mt-3">
										<div className="flex items-center space-x-3">
											<Button
												variant="outline-secondary"
												disabled={item.quantity === 1}
												onClick={() =>
													updateCartHandler(
														item,
														item.quantity - 1
													)
												}
												className="px-3 py-2 rounded-full transition-colors hover:bg-gray-100"
											>
												<i className="fas fa-minus-circle text-gray-700"></i>
											</Button>
											<span className="text-sm font-semibold">
												{item.quantity}
											</span>
											<Button
												variant="outline-secondary"
												disabled={
													item.quantity ===
													item.countInStock
												}
												onClick={() =>
													updateCartHandler(
														item,
														item.quantity + 1
													)
												}
												className="px-3 py-2 rounded-full transition-colors hover:bg-gray-100"
											>
												<i className="fas fa-plus-circle text-gray-700"></i>
											</Button>
										</div>
										<div className="text-sm font-semibold text-green-600">
											₱
											{(
												item.price * item.quantity
											).toFixed(2)}
										</div>
										<Button
											onClick={() =>
												removeItemHandler(item)
											}
											variant="outline-danger"
											className="text-red-600 hover:bg-red-100 transition-all"
										>
											<i className="fas fa-trash-alt"></i>
										</Button>
									</div>
								</div>
							))}
						</div>

						{/* Right Column: Cart Summary */}
						<div className="lg:mt-0">
							<Card className="shadow-md rounded-lg">
								<Card.Body className="px-4 py-3">
									<ListGroup variant="flush">
										<ListGroup.Item className="bg-gray-200 border-b-2 border-gray-300">
											<h3 className="text-lg font-semibold text-gray-700">
												Subtotal (
												{cartItems.reduce(
													(a, c) => a + c.quantity,
													0
												)}{" "}
												item/s): ₱
												{cartItems
													.reduce(
														(a, c) =>
															a +
															c.price *
																c.quantity,
														0
													)
													.toFixed(2)}
											</h3>
										</ListGroup.Item>
										<ListGroup.Item className="flex justify-center mt-6">
											<button
												className="w-full py-2 px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
												type="button"
												onClick={checkoutHandler}
												disabled={
													cartItems.length === 0
												}
											>
												PROCEED TO CHECKOUT
											</button>
										</ListGroup.Item>
									</ListGroup>
								</Card.Body>
							</Card>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default CartScreen;
