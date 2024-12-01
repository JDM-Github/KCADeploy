import axios from "axios";
import React, {
	useRef,
	useContext,
	useEffect,
	useReducer,
	useState,
} from "react";

import { Form, Button, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import logger from "use-reducer-logger";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import getError from "../utils";
import { Store } from "../Store";
import { toast } from "react-toastify";

import "./ProductScreen.css";
import RequestHandler from "../functions/RequestHandler";
import { isToday, isThisWeek, format } from "date-fns";
import Rating from "../components/Rating";

const reducer = (state, action) => {
	switch (action.type) {
		case "REFRESH_PRODUCT":
			return { ...state, product: action.payload };
		case "CREATE_REQUEST":
			return { ...state, loadingCreateReview: true };
		case "CREATE_SUCCESS":
			return { ...state, loadingCreateReview: false };
		case "CREATE_FAIL":
			return { ...state, loadingCreateReview: false };
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, product: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
};

const Review = ({ userInfo, product, setUpdate }) => {
	const { slug } = useParams();
	const [reviews, setReviews] = useState([]);
	const [comment, setComment] = useState("");
	const [rating, setRating] = useState("");

	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(0);
	const [image, setImage] = useState(null);

	const limit = 10;

	const [selectedRating, setSelectedRating] = useState(1);
	const [hasReviewed, setHasReviewed] = useState(false);
	const [hasOrdered, setHasOrdered] = useState(false);

	useEffect(() => {}, []);

	const handleRatingChange = (e) => {
		setSelectedRating(Number(e.target.value));
	};

	const checkUserReview = async () => {
		const data = await RequestHandler.handleRequest(
			"post",
			`products/review-check`,
			{
				id: userInfo.id,
				productId: product.id,
			}
		);
		setHasReviewed(data.reviewed);
	};

	const checkUserOrder = async () => {
		const data = await RequestHandler.handleRequest(
			"post",
			`products/check`,
			{
				id: userInfo.id,
				productId: product.id,
			}
		);
		setHasOrdered(data.hasOrdered);
	};

	const fetchReviews = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				`products/${product.id}/reviews?page=${currentPage}&limit=${limit}`
			);
			setReviews(data.reviews);
			setTotalPages(data.totalPages);
		} catch (error) {
			toast.error("Error fetching reviews.");
		}
	};

	useEffect(() => {
		fetchReviews();
		if (userInfo) {
			checkUserReview();
			checkUserOrder();
		}
	}, [slug, currentPage]);

	const isSubmitDisabled = hasReviewed || !hasOrdered;

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!userInfo) {
			toast.error("Please log in to submit a review.");
			return;
		}

		try {
			const formData = new FormData();
			formData.append("image", image);
			formData.append("comment", comment);
			formData.append("rating", selectedRating);
			formData.append("id", userInfo.id);
			const params = {};
			for (let [key, value] of formData.entries()) params[key] = value;

			const data = await RequestHandler.handleRequest(
				"post",
				`products/${product.id}/reviews`,
				params,
				{
					headers: {
						Authorization: `Bearer ${userInfo.token}`,
						"Content-Type": "multipart/form-data",
					},
				}
			);

			toast.success("Review submitted successfully!");
			setComment("");
			setImage(null);
			setRating(1);
			fetchReviews();
			setUpdate(true);
		} catch (error) {
			console.error("Failed to submit review:", error);
			toast.error("Error submitting review.");
		}
	};

	useEffect(() => {
		fetchReviews(currentPage);
	}, [currentPage]);

	const formatReviewDate = (dateString) => {
		const reviewDate = new Date(dateString);

		if (isToday(reviewDate)) {
			return `Today, ${format(reviewDate, "HH:mm")}`;
		}

		if (isThisWeek(reviewDate)) {
			return `This week, ${format(reviewDate, "HH:mm")}`;
		}

		return `${format(reviewDate, "yyyy-MM-dd")} - ${format(
			reviewDate,
			"HH:mm"
		)}`;
	};

	return (
		<div className="review-container">
			<div className="review-list">
				<div className="review-section">
					{reviews.length > 0 ? (
						reviews.map((review) => (
							<>
								<div key={review.id} className="review-item">
									<strong className="review-user">
										{review.User.name}
									</strong>
									<div>
										{" "}
										{formatReviewDate(review.createdAt)}
									</div>
									<Rating
										rating={review.rating}
										style={{ justifyContent: "left" }}
									/>

									<p
										style={{
											marginTop: "5px",
											color: "#555",
											textOverflow: "ellipsis",
											overflow: "hidden",
											whiteSpace: "wrap",
										}}
									>
										{review.comment}
									</p>

									<div className="img-container">
										{review.reviewImage !== null ? (
											<img src={review.reviewImage} />
										) : null}
									</div>
								</div>
							</>
						))
					) : (
						<p className="no-reviews">No reviews yet.</p>
					)}
				</div>
				<div className="pagination">
					{Array.from({ length: totalPages }, (_, index) => (
						<button
							key={index + 1}
							onClick={() => setCurrentPage(index + 1)}
							disabled={currentPage === index + 1}
							style={{
								margin: "0 5px",
								padding: "5px 10px",
								backgroundColor:
									currentPage === index + 1 ? "#333" : "#ccc",
								color: "#fff",
								border: "none",
								borderRadius: "4px",
								marginBottom: "20px",
							}}
						>
							{index + 1}
						</button>
					))}
				</div>
			</div>

			{userInfo && (
				<form onSubmit={handleSubmit} className="review-form">
					<div className="rating-container">
						<div style={{ height: "100%", display: "flex" }}>
							<select
								className="rating-selector"
								value={selectedRating}
								onChange={handleRatingChange}
							>
								<option style={{ fontSize: "16px" }} value={1}>
									★
								</option>
								<option
									style={{ color: "gold", fontSize: "16px" }}
									value={2}
								>
									★★
								</option>
								<option
									style={{ color: "gold", fontSize: "16px" }}
									value={3}
								>
									★★★
								</option>
								<option
									style={{ color: "gold", fontSize: "16px" }}
									value={4}
								>
									★★★★
								</option>
								<option
									style={{ color: "gold", fontSize: "16px" }}
									value={5}
								>
									★★★★★
								</option>
							</select>
							<Form.Control
								className="image-form"
								type="file"
								onChange={(e) => setImage(e.target.files[0])}
								accept="image/*"
							/>
						</div>
						<Rating rating={selectedRating} />
					</div>
					<div>
						<textarea
							id="comment"
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							required
							className="review-textarea"
						/>
					</div>

					<button
						type="submit"
						className={`submit-button ${
							isSubmitDisabled ? "disabled" : ""
						}`}
						disabled={isSubmitDisabled}
					>
						Submit Review
					</button>
				</form>
			)}
		</div>
	);
};

function ProductScreen() {
	const navigate = useNavigate();
	const params = useParams();
	const { slug } = params;

	const [selectedImage, setSelectedImage] = useState("");
	const [update, setUpdate] = useState(false);

	const [{ loading, error, product, loadingCreateReview }, dispatch] =
		useReducer(logger(reducer), {
			product: [],
			loading: true,
			error: "",
		});

	useEffect(() => {
		const fetchData = async () => {
			dispatch({ type: "FETCH_REQUEST" });
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/slug/${slug}`
				);
				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
			setUpdate(false);
			//setProducts(result.data);
		};
		fetchData();
	}, [slug, update]);

	const { state, dispatch: ctxDispatch } = useContext(Store);
	console.log("Store State:", state);
	const { cart, userInfo } = state;

	const addToCartHandler = async () => {
		if (!userInfo) {
			toast.error("Please log in to add items to your cart.");
			navigate("/signin?redirect=/shipping");
			return;
		}

		const existItem = cart.cartItems.find((x) => x.id === product.id);
		const quantity = existItem ? existItem.quantity + 1 : 1;
		const data = await RequestHandler.handleRequest(
			"get",
			`products/${product.id}`
		);

		ctxDispatch({
			type: "CART_ADD_ITEM",
			payload: { ...product, quantity },
		});
		navigate("/cart");
	};

	return loading ? (
		<LoadingBox />
	) : error ? (
		<MessageBox variant="danger">{error}</MessageBox>
	) : (
		<>
			<div className="product-slug">
				<img
					className="product-image"
					src={selectedImage || product.image}
					alt={product.name}
				/>

				<div className="left-layout">
					<div className="top-layout">
						<div className="description-layout">
							<h4>DESCRIPTION</h4>
							<div
								dangerouslySetInnerHTML={{
									__html: product.description.replace(
										/\n/g,
										"<br />"
									),
								}}
							/>
						</div>
						<div className="product-info-layout">
							<h2>
								<center>{product.name}</center>
							</h2>
							<div
								style={{
									fontSize: "1.5rem",
									marginBottom: "10px",
									fontWeight: "bold",
									color: "#888",
								}}
							>
								<center
									style={{
										marginBottom: "10px",
									}}
								>
									P {product.price}
								</center>
								<Rating rating={product.rating} />
							</div>
							<span
								className="add-to-cart"
								onClick={addToCartHandler}
							>
								<i
									className="fas fa-cart-plus"
									style={{ marginRight: "10px" }}
								/>{" "}
								ADD TO CART
							</span>
						</div>
					</div>
					<div className="bot-layout">
						<div className="products-layout">
							{product.images &&
								[product.image, ...product.images].map((x) => (
									<img
										src={x}
										alt={"product"}
										onClick={() => setSelectedImage(x)}
									/>
								))}
						</div>
					</div>
				</div>
			</div>

			<Review
				userInfo={userInfo}
				product={product}
				setUpdate={setUpdate}
			/>
		</>
	);
}

export default ProductScreen;
