import React, { useEffect, useReducer, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import getError from "../utils";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { Col, Row } from "react-bootstrap";
import Button from "@mui/material/Button";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Products from "../components/Products";
import LinkContainer from "react-router-bootstrap/LinkContainer";
import RequestHandler from "../functions/RequestHandler.js";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return {
				...state,
				products: action.payload.products,
				page: action.payload.page,
				pages: action.payload.pages,
				countProducts: action.payload.countProducts,
				loading: false,
			};
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
};

const prices = [
	{
		name: "₱1 - ₱50",
		value: "1-50",
	},
	{
		name: "₱51 - ₱200",
		value: "51-200",
	},
	{
		name: "₱201 - ₱1000",
		value: "201-1000",
	},
];

export const ratings = [
	{
		name: "4 Stars & up",
		rating: 4,
	},
	{
		name: "3 stars & up ",
		rating: 3,
	},
	{
		name: "2 stars & up",
		rating: 2,
	},
	{
		name: "1 stars & up",
		rating: 1,
	},
];

function SearchScreen() {
	const navigate = useNavigate();
	const { search } = useLocation();
	const sp = new URLSearchParams(search);
	const category = sp.get("category") || "all";
	const query = sp.get("query") || "all";
	const price = sp.get("price") || "all";
	const rating = sp.get("rating") || "all";
	const order = sp.get("order") || "newest";
	const page = sp.get("page") || 1;

	const [{ loading, error, products, pages, countProducts }, dispatch] =
		useReducer(reducer, {
			loading: true,
			error: "",
		});

	const [searchQuery, setSearchQuery] = useState(query);
	const handleSearch = () => {
		navigate(getFilterUrl({ query: searchQuery }));
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/search?page=${page}&query=${searchQuery}&category=${category}&price=${price}&rating=${rating}&order=${order}&highest`
				);
				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (error) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(error),
				});
			}
		};
		fetchData();
	}, [category, error, order, page, price, searchQuery, rating]);

	const [categories, setCategories] = useState([]);
	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/categories`
				);
				setCategories(data);
			} catch (err) {
				toast.error(getError(err));
			}
		};
		fetchCategories();
	}, [dispatch]);
	const checkoutHandler = () => {
		navigate("/signin?redirect=/shipping");
	};

	const getFilterUrl = (filter, skipPathname) => {
		const filterPage = filter.page || page;
		const filterCategory = filter.category || category;
		const filterQuery = filter.query || query;
		const filterRating = filter.rating || rating;
		const filterPrice = filter.price || price;
		const sortOrder = filter.order || order;

		return `${
			skipPathname ? "" : "/search?"
		}category=${filterCategory}&query=${filterQuery}&price=${filterPrice}&rating=${filterRating}&order=${sortOrder}&page=${filterPage}`;
	};

	return (
		<div className="mx-auto px-1 py-6 w-[80vw]">
			<Helmet>
				<title>Search Products</title>
			</Helmet>

			<Row className="lg:space-x-2">
				{/* Filters Section */}
				<Col
					md={3}
					className="p-4 bg-white shadow-lg rounded-lg lg:ms-8 mb-4 min-height-auto"
				>
					<div className="mb-6">
						<div className="flex items-center gap-2 mb-4">
							<input
								type="text"
								placeholder="Search..."
								className="flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
							<button
								className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
								onClick={handleSearch}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth="2"
									stroke="currentColor"
									className="w-5 h-5"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z"
									/>
								</svg>
							</button>
						</div>

						<h3 className="text-lg font-semibold">Category</h3>
						<div className="flex flex-col gap-2">
							<Link
								to={getFilterUrl({ category: "all" })}
								className={`${
									category === "all" ? "font-bold" : ""
								} text-white bg-gray-800 rounded px-4 py-2 text-center no-underline`}
							>
								Any
							</Link>
							{categories
								.filter((c) =>
									c.category
										.toLowerCase()
										.includes(searchQuery.toLowerCase())
								)
								.map((c) => (
									<Link
										key={c.category}
										to={getFilterUrl({
											category: c.category,
										})}
										className={`${
											c.category === category
												? "font-bold"
												: ""
										} text-white bg-gray-800 rounded px-4 py-2 text-center no-underline`}
									>
										{c.category}
									</Link>
								))}
						</div>
					</div>

					<div>
						<h3 className="text-lg font-semibold mb-4">Price</h3>
						<div className="flex flex-col gap-2">
							<Link
								to={getFilterUrl({ price: "all" })}
								className={`${
									price === "all" ? "font-bold" : ""
								} text-white bg-gray-800 rounded px-4 py-2 text-center no-underline`}
							>
								Any
							</Link>
							{prices.map((p) => (
								<Link
									key={p.value}
									to={getFilterUrl({ price: p.value })}
									className={`${
										p.value === price ? "font-bold" : ""
									} text-white bg-gray-800 rounded px-4 py-2 text-center no-underline`}
								>
									{p.name}
								</Link>
							))}
						</div>
					</div>
				</Col>

				{/* Products Section */}
				<Col
					md={8}
					className="bg-white p-6 rounded-lg shadow-lg px-5 w-max-[600px]"
				>
					{loading ? (
						<LoadingBox />
					) : error ? (
						<MessageBox variant="danger">{error}</MessageBox>
					) : (
						<>
							<div className="flex justify-between items-center mb-4">
								{/* Results Info */}
								<div>
									<span className="text-mobile font-semibold">
										{countProducts === 0
											? "No Results"
											: `${countProducts} Results`}
									</span>
									<strong>
										{query !== "all" && `: ${query}`}
										{category !== "all" && ` : ${category}`}
										{price !== "all" && ` : Price ${price}`}
										{rating !== "all" &&
											` : Rating ${rating} & up`}
									</strong>
								</div>

								{/* Sort By */}
								<div>
									<select
										className="border px-4 py-2 rounded-lg text-mobile"
										value={order}
										onChange={(e) => {
											navigate(
												getFilterUrl({
													order: e.target.value,
												})
											);
										}}
									>
										<option value="newest">
											Newest Arrivals
										</option>
										<option value="lowest">
											Price: Low to High
										</option>
										<option value="highest">
											Price: High to Low
										</option>
									</select>
								</div>
							</div>

							{/* Product Listings */}
							{products.length === 0 ? (
								<MessageBox>No Products Found</MessageBox>
							) : (
								<Row
									className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto justify-center"
									style={{ maxWidth: "1200px" }}
								>
									{products.map((product) => (
										<Col
											key={product.id}
											className="mx-auto max-w-[280px]"
											style={{ maxWidth: "350px" }}
										>
											<Products product={product} />
										</Col>
									))}
								</Row>
							)}

							{/* Pagination */}
							<div className="flex justify-center mt-6">
								{[...Array(pages).keys()].map((x) => (
									<LinkContainer
										key={x + 1}
										className="mx-2"
										to={{
											pathname: "/search",
											search: getFilterUrl(
												{ page: x + 1 },
												true
											),
										}}
									>
										<button
											className={`px-4 py-2 rounded-full ${
												Number(page) === x + 1
													? "bg-black text-white"
													: "bg-gray-300 text-black"
											}`}
										>
											{x + 1}
										</button>
									</LinkContainer>
								))}
							</div>
						</>
					)}
				</Col>
			</Row>
		</div>
	);
}

export default SearchScreen;
