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
		<div>
			<Helmet>
				<title>Order History</title>
			</Helmet>

			<h1>Order History</h1>
			{loading ? (
				<LoadingBox></LoadingBox>
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<table className="table">
					<thead>
						<tr>
							<th>ID</th>
							<th>DATE OF TRANSACTION</th>
							<th>TOTAL</th>
							<th>PAID AT</th>
							<th>DELIVERED</th>
							<th>ACTIONS</th>
						</tr>
					</thead>
					<tbody>
						{orders.map((order) => (
							<tr key={order.id}>
								<td>
									{order.id}
									{/*ID*/}
								</td>
								<td>
									{order?.createdAt?.substring(0, 10)}
									{/*NAME*/}
								</td>
								<td>
									{order.totalPrice.toFixed(2)}
									{/*TOTAL*/}
								</td>
								<td>
									{/*PAID*/}
									{order.isPaid
										? order.paidAt.substring(0, 10)
										: "Not Yet Paid"}
								</td>
								<td>
									{" "}
									{/*DELIVERED*/}
									{order.isDelivered
										? order.deliveredAt.substring(0, 10)
										: "Not Yet Delivered"}
								</td>
								<td>
									{/*ACTIONS*/}
									<Button
										type="button"
										variant="light"
										onClick={() => {
											navigate(`/order/${order.id}`);
										}}
									>
										Details
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
