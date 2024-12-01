import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import getError from "../utils";
import Button from "react-bootstrap/esm/Button";
import RequestHandler from "../functions/RequestHandler";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, orders: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
};

export default function OrderHistoryScreen() {
	const { state } = useContext(Store);
	const { userInfo } = state;
	const navigate = useNavigate();

	const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
		loading: true,
		error: "",
	});
	useEffect(() => {
		const fetchData = async () => {
			dispatch({ type: "FETCH_REQUEST" });
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					`orders/mine/${userInfo.id}`,
					{ headers: { Authorization: `Bearer ${userInfo.token}` } }
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
	}, [userInfo]);

	return (
		<div className="p-6 max-w-7xl mx-auto bg-gray-199">
			<Helmet>
				<title>Order History</title>
			</Helmet>

			<h1 className="text-2xl font-semibold mb-6">Order History</h1>

			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox variant="danger" className="mb-4">
					{error}
				</MessageBox>
			) : (
				<div className="bg-white p-6 rounded-lg shadow-lg">
					<div className="overflow-x-auto">
						<table className="min-w-full table-auto">
							<thead>
								<tr className="border-b">
									<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
										ID
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
										Date of Transaction
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
										Total
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
										Paid At
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
										Delivered
									</th>
									<th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{orders.map((order) => (
									<tr key={order.id} className="border-b">
										<td className="px-4 py-2 text-sm text-gray-600">
											{order.id}
										</td>
										<td className="px-4 py-2 text-sm text-gray-600">
											{order?.createdAt?.substring(0, 10)}
										</td>
										<td className="px-4 py-2 text-sm text-gray-600">
											₱{order.totalPrice.toFixed(2)}
										</td>
										<td className="px-4 py-2 text-sm text-gray-600">
											{order.isPaid
												? order.paidAt.substring(0, 10)
												: "Not Yet Paid"}
										</td>
										<td className="px-4 py-2 text-sm text-gray-600">
											{order.isDelivered
												? order.deliveredAt.substring(
														0,
														10
												  )
												: "Not Yet Delivered"}
										</td>
										<td className="px-4 py-2 text-sm text-gray-600">
											<button
												onClick={() =>
													navigate(
														`/order/${order.id}`
													)
												}
												className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
											>
												Details
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}
