import React, { useState, useEffect } from "react";
import { Card, Button, Form, Table } from "react-bootstrap";
import { FaPrint } from "react-icons/fa";
import RequestHandler from "../functions/RequestHandler";

const SalesReport = () => {
	const [year, setYear] = useState(new Date().getFullYear());
	const [month, setMonth] = useState(new Date().getMonth() + 1);
	const [salesData, setSalesData] = useState([]);

	useEffect(() => {
		const fetchSalesData = async () => {
			try {
				const response = await RequestHandler.handleRequest(
					"post",
					`orders/getAllSales?year=${year}&month=${month}`
				);
				setSalesData(response);
			} catch (error) {
				console.error("Error fetching sales data:", error);
			}
		};
		fetchSalesData();
	}, [year, month]);

	const handlePrint = () => {
		const printContent = document.getElementById("salesReport");
		const printWindow = window.open("", "", "height=600,width=800");

		// Create print content structure
		printWindow.document.write("<html><head><title>Sales Report</title>");

		// Apply print-specific CSS
		printWindow.document.write(`
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
      @media print {
        body {
          width: 100%;
          padding: 20px;
        }
        #salesReport {
          width: 100%;
          margin: 0;
          padding: 20px;
        }
      }
    </style>
  `);

		printWindow.document.write("</head><body>");
		printWindow.document.write(printContent.innerHTML); // Only print the sales report content
		printWindow.document.write("</body></html>");
		printWindow.document.close();
		printWindow.print(); // Trigger the print dialog
	};

	return (
		<div
			className="absolute left-20 top-0 w-[80vw] p-6 bg-white text-gray-800 rounded-lg shadow-lg"
			style={{
				position: "absolute",
				left: "20vw",
				top: "0",
				width: "80vw",
				backgroundColor: "#F9FAFB",
				color: "#4B5563",
				padding: "20px",
				borderRadius: "8px",
				boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
			}}
		>
			<div className="header flex justify-between items-center mb-6">
				<h2 className="text-2xl font-semibold">Sales Report</h2>
				<Button variant="outline-primary" onClick={handlePrint}>
					<FaPrint className="mr-2" /> Print
				</Button>
			</div>

			<Form className="mb-4">
				<Form.Group controlId="yearSelect">
					<Form.Label>Select Year</Form.Label>
					<Form.Control
						as="select"
						value={year}
						onChange={(e) => setYear(e.target.value)}
						className="bg-white text-gray-700 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						{[...Array(10)].map((_, index) => {
							const optionYear = new Date().getFullYear() - index;
							return (
								<option key={optionYear} value={optionYear}>
									{optionYear}
								</option>
							);
						})}
					</Form.Control>
				</Form.Group>

				<Form.Group controlId="monthSelect">
					<Form.Label>Select Month</Form.Label>
					<Form.Control
						as="select"
						value={month}
						onChange={(e) => setMonth(e.target.value)}
						className="bg-white text-gray-700 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					>
						{Array.from({ length: 12 }, (_, i) => i + 1).map(
							(m) => (
								<option key={m} value={m}>
									{new Date(0, m - 1).toLocaleString(
										"en-US",
										{ month: "long" }
									)}
								</option>
							)
						)}
					</Form.Control>
				</Form.Group>
			</Form>

			{/* Sales Report Table */}
			<div id="salesReport">
				<Table striped bordered hover responsive className="table-auto">
					<thead>
						<tr>
							<th>Product Name</th>
							<th>Sales Count</th>
							<th>Total Sales (₱)</th>
						</tr>
					</thead>
					<tbody>
						{salesData.map((product) => (
							<tr key={product.id}>
								<td>{product.name}</td>
								<td>{product.salesCount}</td>
								<td>₱ {product.totalSales.toFixed(2)}</td>
							</tr>
						))}
					</tbody>
				</Table>
			</div>
		</div>
	);
};

export default SalesReport;
