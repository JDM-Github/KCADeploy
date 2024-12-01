import React, { useState, useContext, useEffect, useReducer } from "react";
import { Store } from "../Store";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Card, Col, Row } from "react-bootstrap";

import Chart from "react-google-charts";

import "./DashboardScreen.css";
import RequestHandler from "../functions/RequestHandler";

const TopAccount = () => {
	return <div className="top-account"></div>;
};

const TopDashboard = ({ summary }) => {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
			<div className="bg-gray-800 text-yellow-300 rounded-lg shadow-md p-4">
				<div className="flex flex-col justify-between h-full">
					<div className="text-4xl font-bold">
						{summary.users && summary.users[0]
							? summary.users[0].numUsers
							: 0}
					</div>
					<div className="text-sm">USERS</div>
				</div>
			</div>

			<div className="bg-gray-800 text-yellow-300 rounded-lg shadow-md p-4">
				<div className="flex flex-col justify-between h-full">
					<div className="text-4xl font-bold">
						{summary.orders && summary.users[0]
							? summary.orders[0].numOrders
							: 0}
					</div>
					<div className="text-sm">ORDERS</div>
				</div>
			</div>

			<div className="bg-gray-800 text-yellow-300 rounded-lg shadow-md p-4">
				<div className="flex flex-col justify-between h-full">
					<div className="text-4xl font-bold">
						₱{" "}
						{summary.orders && summary.users[0]
							? summary.orders[0].totalSales
								? summary.orders[0].totalSales.toFixed(2)
								: 0
							: 0}
					</div>
					<div className="text-sm">TOTAL SALES</div>
				</div>
			</div>
		</div>
	);
};

const SalesChart = ({ summary }) => {
	const [view, setView] = useState("Day");
	const dailyData = summary.dailyOrders.map((x) => [x.id, x.sales]);

	const chartData = {
		Day: [["Date", "Sales"], ...dailyData],
	};

	const currentDate = new Date().toLocaleDateString();

	const chartOptions = {
		hAxis: { title: "Date" },
		vAxis: { title: "Sales" },
		colors: ["gold"],
		lineWidth: 3,
		curveType: "function",
		areaOpacity: 0.1,
		backgroundColor: "#fafafa55",
		legend: { position: "bottom" },
	};

	const handlePrint = () => {
		const chartElement = document.querySelector(".sales-dashboard");

		if (chartElement) {
			const printWindow = window.open("", "", "width=800,height=600");
			printWindow.document.write(`
			<html>
				<head>
					<title>Print Sales Chart</title>
					<style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7fa;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .print-container {
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }

        h3 {
            text-align: center;
            font-size: 28px;
            color: #4CAF50;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1.2px;
        }

        .sales-date {
            text-align: right;
            font-size: 14px;
            color: #666;
            margin-bottom: 20px;
        }

        .chart {
            display: flex;
            justify-content: center;
            margin: 20px 0;
            padding: 20px;
			width: 100%;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
        }

        .sales-summary-card {
            background-color: #f1f1f1;
            padding: 20px;
            border-radius: 8px;
            margin: 20px auto;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .sales-summary-title {
            font-size: 22px;
            color: #ff9800;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .sales-summary-amount {
            font-size: 36px;
            color: #f44336;
            font-weight: bold;
        }

        .footer-note {
            font-size: 12px;
            text-align: center;
            color: #999;
            margin-top: 40px;
        }

        /* Print Styles */
        @media print {
            body {
                background-color: white;
                margin: 0;
                padding: 0;
            }

            .print-container {
                border: none;
                box-shadow: none;
                margin: 0;
                padding: 0;
            }

            .footer-note {
                display: none;
            }

            h3 {
                color: #333;
            }

            .sales-summary-title,
            .sales-summary-amount {
                color: #000;
            }
        }
    </style>
</head>
<body>
    <div class="print-container">
        <h3>Sales Report</h3>
		<div class="sales-summary-card">
            <div class="sales-summary-title">Total Sales</div>
            <div class="sales-summary-amount">₱ ${
				summary.orders && summary.users[0]
					? summary.orders[0].totalSales
						? summary.orders[0].totalSales.toFixed(2)
						: 0
					: 0
			}</div>
        </div>

		<div class="sales-summary-card">
            <div class="sales-summary-title">Number of Orders</div>
            <div class="sales-summary-amount">${
				summary.orders && summary.users[0]
					? summary.orders[0].numOrders
					: 0
			}</div>
        </div>

		<div class="sales-summary-card">
            <div class="sales-summary-title">Number of Users</div>
            <div class="sales-summary-amount">${
				summary.users && summary.users[0]
					? summary.users[0].numUsers
					: 0
			}</div>
        </div>
        <div class="sales-date">${new Date().toLocaleDateString()}</div>

        <div class="chart">
            ${chartElement.innerHTML}
        </div>

        

        <div class="footer-note">Generated on ${new Date().toLocaleString()}</div>
    </div>
</body>
			</html>
		`);
			printWindow.document.close();
			printWindow.focus();
			printWindow.print();
			printWindow.close();
		}
	};

	return (
		<div className="sales-dashboard">
			<Card
				style={{
					width: "100%",
					height: "100%",
					padding: "10px",
					boxSizing: "border-box",
				}}
			>
				<div className="print-sales" onClick={handlePrint}>
					PRINT
				</div>

				<h3>Sales</h3>
				<div>{currentDate}</div>
				{!summary.dailyOrders || summary.dailyOrders.length === 0 ? (
					<MessageBox>No Sales</MessageBox>
				) : (
					<Chart
						width="100%"
						height="100%"
						chartType="AreaChart"
						loader={<div>Loading Chart...</div>}
						data={chartData[view]}
						options={chartOptions}
					/>
				)}
			</Card>
		</div>
	);
};

const CategoriesChart = ({ summary }) => {
	const totalProducts = summary.productCategories.reduce(
		(acc, category) => acc + category.count,
		0
	);

	return (
		<>
			{!summary.productCategories ||
			summary.productCategories.length === 0 ? (
				<MessageBox>No Categories</MessageBox>
			) : (
				<div className="flex justify-center">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-[60vw]">
						{summary.productCategories
							.slice(0, 6)
							.map((category) => {
								const percentage = totalProducts
									? (category.count / totalProducts) * 100
									: 0;

								return (
									<div
										key={category.category}
										className="bg-white p-4 rounded-lg shadow-md flex flex-col space-y-3"
									>
										<div className="flex justify-between">
											<span className="font-semibold text-lg text-gray-800">
												{category.category}
											</span>
											<span className="font-bold text-xl text-gray-900">
												{percentage.toFixed(1)}%
											</span>
										</div>

										<div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden">
											<div
												className="h-full bg-red-500"
												style={{
													width: `${percentage}%`,
												}}
											/>
											<div
												className="h-full bg-gray-700"
												style={{
													width: `${
														100 - percentage
													}%`,
												}}
											/>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			)}
		</>
	);
};

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, summary: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		default:
			return state;
	}
};

function DashboardScreen() {
	const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
		loading: true,
		error: "",
	});
	const { state } = useContext(Store);
	const { userInfo } = state;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await RequestHandler.handleRequest(
					"get",
					"orders/summary",
					{
						headers: { Authorization: `Bearer ${userInfo.token}` },
					}
				);
				dispatch({ type: "FETCH_SUCCESS", payload: data });
			} catch (err) {
				dispatch({
					type: "FETCH_FAIL",
					payload: getError(err),
				});
			}
		};
		fetchData();
	}, [userInfo]);

	return (
		<div>
			{loading ? (
				<LoadingBox />
			) : error ? (
				<MessageBox variant="danger">{error}</MessageBox>
			) : (
				<div className="dashboard-container bg-gradient-to-r from-white-800 via-gray-900 to-black p-8 shadow-xl">
					<TopAccount />

					<TopDashboard summary={summary} />

					<SalesChart summary={summary} />

					<CategoriesChart summary={summary} />
				</div>
			)}
		</div>
	);
}

export default DashboardScreen;
