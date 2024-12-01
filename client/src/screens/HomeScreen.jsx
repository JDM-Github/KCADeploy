import React, { useEffect, useReducer } from "react";

import logger from "use-reducer-logger";
import Products from "../components/Products";
import { Helmet } from "react-helmet-async";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import ChatHead from "../components/ChatHead";
import getError from "../utils";

import RequestHandler from "../functions/RequestHandler.js";

import "./HomeScreen.css";
import AdminChatScreen from "../components/AdminChatScreen";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, products: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };

		default:
			return state;
	}
};

export default function HomeScreen({ userInfo }) {
	const [{ loading, error, products }, dispatch] = useReducer(
		logger(reducer),
		{
			products: [],
			loading: true,
			error: "",
		}
	);

	useEffect(() => {
		const fetchData = async () => {
			dispatch({ type: "FETCH_REQUEST" });
			try {
				const result = await RequestHandler.handleRequest(
					"get",
					`products`
				);
				dispatch({ type: "FETCH_SUCCESS", payload: result });
			} catch (err) {
				dispatch({ type: "FETCH_FAIL", payload: getError(err) });
			}
		};
		fetchData();
	}, []);

	return (
		<div className="w-full px-4 md:px-8">
			<Helmet>
				<title>RYB</title>
			</Helmet>

			<h2 className="text-2xl font-bold text-center my-8 text-gray-800">
				FEATURED PRODUCTS
			</h2>

			<div className="flex justify-center">
				{loading ? (
					<LoadingBox />
				) : error ? (
					<MessageBox variant="danger">{error}</MessageBox>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
						{products.slice(0, 8).map((product) => (
							<Products key={product.id} product={product} />
						))}
					</div>
				)}
			</div>

			{userInfo && (
				<div className="mt-8">
					{userInfo.isAdmin ? (
						<AdminChatScreen userInfo={userInfo} />
					) : (
						<ChatHead userInfo={userInfo} />
					)}
				</div>
			)}
		</div>
	);
}
