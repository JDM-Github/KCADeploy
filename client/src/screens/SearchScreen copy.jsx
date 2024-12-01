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

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`products/search?page=${page}&query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}`
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
	}, [category, error, order, page, price, query, rating]);

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
		<div className="w-full px-4 py-6">
			<Helmet>
				<title>Search Products</title>
			</Helmet>

			<Row className="space-x-4">
				{/* Filters Section */}
				<Col md={3} className="p-4 bg-white shadow-lg rounded-lg">
					<div className="mb-6">
						<h3 className="text-lg font-semibold">Category</h3>
						<div className="flex flex-col gap-2">
							<Link
								to={getFilterUrl({ category: "all" })}
								className={`${
									category === "all" ? "font-bold" : ""
								} text-white bg-gray-800 rounded px-4 py-2 text-center`}
							>
								Any
							</Link>
							{categories.map((c) => (
								<Link
									key={c.category}
									to={getFilterUrl({ category: c.category })}
									className={`${
										c.category === category
											? "font-bold"
											: ""
									} text-white bg-gray-800 rounded px-4 py-2 text-center`}
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
								} text-white bg-gray-800 rounded px-4 py-2 text-center`}
							>
								Any
							</Link>
							{prices.map((p) => (
								<Link
									key={p.value}
									to={getFilterUrl({ price: p.value })}
									className={`${
										p.value === price ? "font-bold" : ""
									} text-white bg-gray-800 rounded px-4 py-2 text-center`}
								>
									{p.name}
								</Link>
							))}
						</div>
					</div>
				</Col>

				{/* Products Section */}
				<Col md={9} className="bg-white p-6 rounded-lg shadow-lg">
					{loading ? (
						<LoadingBox />
					) : error ? (
						<MessageBox variant="danger">{error}</MessageBox>
					) : (
						<>
							<div className="flex justify-between items-center mb-4">
								<div>
									<span className="text-lg font-semibold">
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

								<div>
									<span className="mr-2">Sort By</span>
									<select
										className="border px-4 py-2 rounded-lg"
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
								<Row className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{products.map((product) => (
										<Col key={product.id} className="mb-6">
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
										<Button
											variant="contained"
											className={`${
												Number(page) === x + 1
													? "bg-black text-white"
													: "bg-gray-300"
											} px-4 py-2 rounded-full`}
										>
											{x + 1}
										</Button>
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
