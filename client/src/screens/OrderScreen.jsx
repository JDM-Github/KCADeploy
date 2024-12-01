import React, { useContext, useEffect, useReducer, useState } from "react";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { Link, useNavigate, useParams } from "react-router-dom";
import getError from "../utils";
import { Helmet } from "react-helmet-async";
import { Modal } from "react-bootstrap";
import { Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import RequestHandler from "../functions/RequestHandler";

function reducer(state, action) {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true, error: "" };
		case "FETCH_SUCCESS":
			return {
				...state,
				loading: false,
				order: action.payload,
				error: "",
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		case "PAY_REQUEST":
			return { ...state, loadingPay: true };
		case "PAY_SUCCESS":
			return { ...state, loadingPay: false, successPay: true };
		case "PAY_FAIL":
			return { ...state, loadingPay: false };
		case "PAY_RESET":
			return { ...state, loadingPay: false, successPay: false };

		case "DELIVER_REQUEST":
			return { ...state, loadingDeliver: true };
		case "DELIVER_SUCCESS":
			return { ...state, loadingDeliver: false, successDeliver: true };
		case "DELIVER_FAIL":
			return { ...state, loadingDeliver: false };
		case "DELIVER_RESET":
			return { ...state, loadingDeliver: false, successDeliver: false };
		default:
			return state;
	}
}

function OrderScreen() {
	const { state } = useContext(Store);
	const { userInfo } = state;
	const params = useParams();
	const { id: orderId } = params;
	const navigate = useNavigate();
	const [showPaymentInfo, setShowPaymentInfo] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [selectedImage, setSelectedImage] = useState("");
	const [
		{
			loading,
			error,
			order,
			successPay,
			loadingPay,
			loadingDeliver,
			successDeliver,
		},
		dispatch,
	] = useReducer(reducer, {
		loading: true,
		order: {},
		error: "",
		successPay: false,
		loadingPay: false,
	});

	const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();
	const [proofOfDeliveryImage, setProofOfDeliveryImage] = useState(null);
	const [loadingUpload, setLoadingUpload] = useState(false);
	const [showTransactionModal, setShowTransactionModal] = useState(false);
	const [transactionDetails, setTransactionDetails] = useState({});
	const handleViewTransactionHistory = () => {
		setTransactionDetails({
			name: order.shippingAddress.fullName,
			lastName: order.shippingAddress.LastName,
			address: `${order.shippingAddress.address}, ${order.shippingAddress.city}`,
			phone: order.shippingAddress.postalCode,
			deliveredAt: order.deliveredAt,
			paymentMethod: order.paymentMethodName,
			paidAt: order.paidAt,
			paymentImage: order.paymentImage,
			deliveryImage: order.deliveryImage,
			proofOfDeliveryImage: order.proofOfDeliveryImage, // Assuming this exists in your order
		});
		setShowTransactionModal(true);
	};

	const handleImageChange = (e) => {
		setProofOfDeliveryImage(e.target.files[0]); // Store the selected file
	};
	// async function deliverOrderHandler() {
	//   if (!proofOfDeliveryImage) {
	//     toast.error('Please upload proof of delivery.');
	//     return;
	//   }

	//   const formData = new FormData();
	//   formData.append('image', proofOfDeliveryImage); // Add the image to form data

	//   try {
	//     setLoadingUpload(true);
	//     const data = await RequestHandler.handleRequest("put",
	//       `orders/${order.id}/deliver`, // Modify this backend route to handle image upload
	//       formData,
	//       { headers: { authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } }
	//     );

	//     dispatch({ type: 'DELIVER_SUCCESS' });
	//     toast.success('Order delivered successfully!');
	//   } catch (err) {
	//     toast.error(getError(err));
	//     dispatch({ type: 'DELIVER_FAIL' });
	//   } finally {
	//     setLoadingUpload(false);
	//   }
	// }
	async function deliverOrderHandler() {
		if (!proofOfDeliveryImage) {
			toast.error("Please upload proof of delivery.");
			return;
		}

		const formData = new FormData();
		formData.append("image", proofOfDeliveryImage);

		try {
			setLoadingUpload(true);

			const data = await RequestHandler.handleRequest(
				"put",
				`orders/${order.id}/deliver`,
				formData,
				{
					headers: {
						authorization: `Bearer ${userInfo.token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);
			dispatch({ type: "DELIVER_SUCCESS", payload: data });
			toast.success("Order delivered successfully!");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "DELIVER_FAIL" });
		} finally {
			setLoadingUpload(false);
		}
	}

	function createOrder(data, actions) {
		return actions.order
			.create({
				purchase_units: [{ amount: { value: order.totalPrice * 0.5 } }],
			})

			.then((orderID) => {
				return orderID;
			});
	}
	async function confirmPaymentHandler() {
		try {
			dispatch({ type: "PAY_REQUEST" });
			const data = await RequestHandler.handleRequest(
				"put",
				`orders/${order.id}/confirmPayment`,
				{},
				{ headers: { authorization: `Bearer ${userInfo.token}` } }
			);
			dispatch({ type: "PAY_SUCCESS", payload: data });
			toast.success("Payment confirmed successfully!");
		} catch (err) {
			toast.error(getError(err));
			dispatch({ type: "PAY_FAIL" });
		}
	}

	function onApprove(data, actions) {
		return actions.order.capture().then(async function (details) {
			try {
				dispatch({ type: "PAY_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"put",
					`orders/${order.id}/pay`,
					details,
					{ headers: { authorization: `Bearer ${userInfo.token}` } }
				);
				dispatch({ type: "PAY_SUCCESS", payload: data });
				toast.success("ORDER IS PAID");
			} catch (err) {
				dispatch({ type: "PAY_FAIL", payload: getError(err) });
				toast.error(getError(err));
			}
		});
	}

	function onError(err) {
		toast.error(getError(err));
	}

	useEffect(() => {
		const fetchOrder = async () => {
			try {
				dispatch({ type: "FETCH_REQUEST" });
				const data = await RequestHandler.handleRequest(
					"get",
					`orders/${orderId}`,
					{
						headers: { authorization: `Bearer ${userInfo.token}` },
					}
				);

				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
		};

		if (!userInfo) {
			return navigate("/login");
		}
		if (
			!order.id ||
			successPay ||
			successDeliver ||
			(order.id && order.id !== orderId)
		) {
			fetchOrder();
			if (successPay) {
				dispatch({ type: "PAY_RESET" });
			}
			if (successDeliver) {
				dispatch({ type: "DELIVER_RESET" });
			}
		} else {
			const loadPayPalScript = async () => {
				const { data: clientId } = await RequestHandler.handleRequest(
					"get",
					"keys/paypal",
					{
						header: { authorization: `Bearer ${userInfo.token}` },
					}
				);
				paypalDispatch({
					type: "resetOptions",
					value: {
						"client-id": clientId,
						currency: "PHP",
					},
				});
				paypalDispatch({ type: "setLoadingStatus", value: "pending" });
			};
			loadPayPalScript();
		}
	}, [
		order,
		userInfo,
		orderId,
		navigate,
		paypalDispatch,
		successPay,
		successDeliver,
	]);

	// Function to handle image click and show modal
	const handleImageClick = (imageSrc) => {
		setSelectedImage(imageSrc);
		setShowModal(true);
	};

	function formatDate(date) {
		const d = new Date(date);

		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		const hours = String(d.getHours()).padStart(2, "0");
		const minutes = String(d.getMinutes()).padStart(2, "0");
		const seconds = String(d.getSeconds()).padStart(2, "0");

		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	return loading ? (
		<LoadingBox></LoadingBox>
	) : error ? (
		<MessageBox variant="danger">{error}</MessageBox>
	) : (
		<div
			className={`bg-gray-100 ${
				userInfo.isAdmin || userInfo.isRider
					? "absolute top-0 left-[20vw] w-[80vw] p-6 box-border"
					: "max-w-7xl mx-auto p-6"
			}`}
		>
			<Helmet>
				<title>Order: {orderId}</title>
			</Helmet>
			<h1 className="text-2xl font-semibold my-4">Order ID: {orderId}</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-6">
					{/* Shipping and Customer Info Card */}
					<div className="bg-white shadow-md rounded-lg p-4">
						<h2 className="text-xl font-semibold mb-3">
							Shipping and Customer Information
						</h2>
						<p>
							<strong>Name:</strong>{" "}
							{order.shippingAddress.fullName}
						</p>
						<p>
							<strong>Last Name:</strong>{" "}
							{order.shippingAddress.LastName}
						</p>
						<p>
							<strong>Address:</strong>{" "}
							{order.shippingAddress.address},{" "}
							{order.shippingAddress.city}
						</p>
						<p>
							<strong>Phone Number:</strong>{" "}
							{order.shippingAddress.postalCode}
						</p>
						{order.isDelivered ? (
							<div className="text-green-600 mt-4">
								<strong>Delivered At:</strong>{" "}
								{formatDate(order.deliveredAt)}
							</div>
						) : (
							<div className="text-red-600 mt-4">
								Parcel Not Delivered
							</div>
						)}
					</div>

					{/* Payment Info Card */}
					<div className="bg-white shadow-md rounded-lg p-4">
						<h2 className="text-xl font-semibold mb-3">Payment</h2>
						<p>
							<strong>Method:</strong> {order.paymentMethodName}
						</p>
						{order.isPaid ? (
							<div className="text-green-600 mt-4">
								Paid At: {formatDate(order.paidAt)}
							</div>
						) : (
							<div className="text-red-600 mt-4">
								Not Yet Paid
							</div>
						)}
					</div>

					{/* Items List Card */}
					<div className="bg-white shadow-md rounded-lg p-4">
						<h2 className="text-xl font-semibold mb-3">Items</h2>
						<ul className="space-y-4">
							{order.orderItems.map((item) => (
								<li
									key={item.id}
									className="flex items-center justify-between space-x-4"
								>
									<div className="flex items-center space-x-4">
										<img
											src={item.image}
											alt={item.name}
											className="w-16 h-16 object-cover rounded-lg"
										/>
										{!userInfo.isAdmin &&
										!userInfo.isRider ? (
											<Link
												to={`/product/${item.slug}`}
												className="text-blue-600 hover:underline"
											>
												{item.name}
											</Link>
										) : (
											<span className="text-gray-600">
												{item.name}
											</span>
										)}
									</div>
									<div className="flex items-center space-x-8">
										<span>x{item.quantity}</span>
										<span>₱{item.price.toFixed(2)}</span>
									</div>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="space-y-6">
					{/* Order Summary Card */}
					<div className="bg-white shadow-md rounded-lg p-4">
						<h2 className="text-xl font-semibold mb-3">
							Order Summary
						</h2>
						<ul className="space-y-4">
							<li className="flex justify-between">
								<span>Items</span>
								<span>₱{order.itemsPrice.toFixed(2)}</span>
							</li>
							<li className="flex justify-between">
								<span>Shipping</span>
								<span>₱{order.shippingPrice.toFixed(2)}</span>
							</li>
							<li className="flex justify-between">
								<span>Down Payment</span>
								<span>₱{order.taxPrice.toFixed(2)}</span>
							</li>
							<li className="flex justify-between font-semibold">
								<span>Order Total</span>
								<span>₱{order.totalPrice.toFixed(2)}</span>
							</li>
						</ul>

						{/* Conditional buttons */}
						{order.isPaid && order.isDelivered && (
							<div className="mt-4">
								<button
									className="w-full bg-green-500 text-white py-2 rounded-md"
									onClick={handleViewTransactionHistory}
								>
									View Transaction History
								</button>
							</div>
						)}

						{!order.isPaid && (
							<div className="mt-4">
								{userInfo.isRider ? (
									<button
										className="w-full bg-blue-500 text-white py-2 rounded-md"
										onClick={() =>
											navigate("/admin/orders")
										}
									>
										Go to Order List
									</button>
								) : userInfo.isAdmin ? (
									<button
										className="w-full bg-yellow-500 text-white py-2 rounded-md"
										onClick={() => setShowPaymentInfo(true)}
									>
										Check Payment Info
									</button>
								) : (
									<button
										className="w-full bg-gray-500 text-white py-2 rounded-md"
										onClick={() =>
											navigate("/orderhistory")
										}
									>
										Check Payment History
									</button>
								)}
							</div>
						)}
					</div>

					{/* Payment Information Modal */}
					{userInfo.isAdmin && showPaymentInfo && (
						<div className="bg-white shadow-md rounded-lg p-5">
							<h2 className="text-xl font-semibold mb-3">
								Payment Information
							</h2>
							<p>
								<strong>Reference Number:</strong>{" "}
								{order.referenceNumber}
							</p>
							<p>
								<strong>Proof of Payment:</strong>
							</p>
							<img
								src={order.paymentImage}
								alt="Payment Image"
								className="w-24 h-24 object-cover mb-4"
								onClick={() =>
									handleImageClick(order.paymentImage)
								}
							/>
							{!order.isPaid && (
								<button
									className="w-full bg-green-500 text-white py-2 rounded-md"
									onClick={confirmPaymentHandler}
								>
									Confirm Payment
								</button>
							)}
						</div>
					)}

					{/* Delivery Form for Riders */}
					{userInfo.isRider && order.isPaid && !order.isDelivered && (
						<div className="bg-white shadow-md rounded-lg p-5">
							{loadingDeliver && <LoadingBox />}
							<input
								type="file"
								className="block w-full text-sm mt-4"
								onChange={handleImageChange}
								accept="image/*"
							/>
							{loadingUpload && <LoadingBox />}
							<div className="mt-4">
								{proofOfDeliveryImage && (
									<img
										src={URL.createObjectURL(
											proofOfDeliveryImage
										)}
										alt="Proof of Delivery"
										className="w-24 h-24 object-cover mb-4"
										onClick={() =>
											handleImageClick(
												URL.createObjectURL(
													proofOfDeliveryImage
												)
											)
										}
									/>
								)}
							</div>
							<button
								className="w-full bg-blue-500 text-white py-2 rounded-md"
								onClick={deliverOrderHandler}
								disabled={!proofOfDeliveryImage}
							>
								Deliver Order
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Modals */}
			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Receipt</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<img
						src={selectedImage}
						alt="Zoomed"
						className="w-full object-contain"
					/>
				</Modal.Body>
			</Modal>

			<Modal
				show={showTransactionModal}
				onHide={() => setShowTransactionModal(false)}
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>Transaction Summary</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h5>Shipping and Customer Information</h5>
					<p>
						<strong>Name:</strong> {transactionDetails.name}
					</p>
					<p>
						<strong>Last Name:</strong>{" "}
						{transactionDetails.lastName}
					</p>
					<p>
						<strong>Address:</strong> {transactionDetails.address}
					</p>
					<p>
						<strong>Phone Number:</strong>{" "}
						{transactionDetails.phone}
					</p>
					<p>
						<strong>Delivered At:</strong>{" "}
						{formatDate(transactionDetails.deliveredAt)}
					</p>

					<h5>Payment</h5>
					<p>
						<strong>Method:</strong>{" "}
						{transactionDetails.paymentMethod}
					</p>
					<p>
						<strong>Paid At:</strong>{" "}
						{new Date(transactionDetails.paidAt).toLocaleString(
							"en-US",
							{
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
								hour: "2-digit",
								minute: "2-digit",
								second: "2-digit",
								hour12: false,
							}
						)}
					</p>

					<h5>Proof of Payment</h5>
					<img
						src={transactionDetails.paymentImage}
						alt="Proof of Payment"
						className="w-24 h-24 object-cover"
					/>
					<h5>Proof of Delivery</h5>
					<img
						src={transactionDetails.proofOfDeliveryImage}
						alt="Proof of Delivery"
						className="w-24 h-24 object-cover"
					/>
				</Modal.Body>
			</Modal>
		</div>
	);
}

export default OrderScreen;
