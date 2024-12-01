import { BrowserRouter, Route, Routes, Link, Navigate } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ProductScreen from "./screens/ProductScreen";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import { LinkContainer } from "react-router-bootstrap";
import Badge from "react-bootstrap/esm/Badge";
import Nav from "react-bootstrap/Nav";
import { useContext, useEffect, useState } from "react";
import { Store } from "./Store";
import CartScreen from "./screens/CartScreen";
import SigninScreen from "./screens/SigninScreen";
import NavDropdown from "react-bootstrap/NavDropdown";
import { Box, Typography } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ShippingAddressScreen from "./screens/ShippingAddressScreen";
import SignupScreen from "./screens/SignupScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import VerifyEmail from "./components/VerifyEmail";
import PaymentMethodScreen from "./screens/PaymentMethodScreen";
import PlaceOrderScreen from "./screens/PlaceOrderScreen";
import OrderScreen from "./screens/OrderScreen";
import OrderHistoryScreen from "./screens/OrderHistoryScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { Button } from "react-bootstrap";
import SearchBox from "./components/SearchBox";
import SearchScreen from "./screens/SearchScreen";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import ProductListScreen from "./screens/ProductListScreen";
import ServicesScreen from "./screens/ServicesScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ProductEditScreen from "./screens/ProductEditScreen";
import OrderListScreen from "./screens/OrderListScreen";
import UserListScreen from "./screens/UserListScreen";
import UserEditScreen from "./screens/UserEditScreen";
import DesignerScreen from "./screens/DesignerScreen";
import CustomerRoute from "./components/CustomerRoute";
import CustomizeScreen from "./screens/CustomizeScreen";
import CustomizeRequestScreen from "./screens/CustomizeRequestScreen";

import Navigation from "./components/Navigation";
import AdminNavigation from "./components/AdminNavigation";
import CreateProduct from "./screens/CreateProduct";
import SalesReport from "./screens/SalesReport";

function App() {
	const { state, dispatch: ctxDispatch } = useContext(Store);
	const { cart, userInfo } = state;

	const signoutHandler = () => {
		ctxDispatch({ type: "USER_SIGNOUT" });
		localStorage.removeItem("userInfo");
		localStorage.removeItem("shippingAddress");
		localStorage.removeItem("paymentMethod");
		window.location.href = "/signin";
	};

	const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
	const [categories, setCategories] = useState([]);

	const targetFlex =
		userInfo && userInfo.isAdmin ? "flex-row" : "flex-column";

	return (
		<BrowserRouter>
			<div
				className={
					sidebarIsOpen
						? `d-flex ${targetFlex} site-container active-cont`
						: `d-flex ${targetFlex} site-container`
				}
			>
				<ToastContainer position="bottom-center" limit={1} />
				<header>
					{userInfo && (userInfo.isAdmin || userInfo.isRider) ? (
						<AdminNavigation
							userInfo={userInfo}
							signoutHandler={signoutHandler}
						/>
					) : (
						<Navigation
							userInfo={userInfo}
							cart={cart}
							signoutHandler={signoutHandler}
						/>
					)}
				</header>

				<main>
					<Container className="mt-3">
						<Routes>
							<Route
								path="/product/:slug"
								element={<ProductScreen />}
							/>
							<Route
								path="/cart"
								element={
									<CustomerRoute>
										<CartScreen />
									</CustomerRoute>
								}
							/>
							<Route path="/signin" element={<SigninScreen />} />
							<Route path="/signup" element={<SignupScreen />} />
							<Route
								path="/verify-email"
								element={<VerifyEmail />}
							/>
							<Route
								path="/forgot-password"
								element={<ForgotPasswordScreen />}
							/>

							<Route
								path="/reset-password"
								element={<ResetPasswordScreen />}
							/>

							<Route
								path="/shipping"
								element={
									<ProtectedRoute>
										<CustomerRoute>
											<ShippingAddressScreen />
										</CustomerRoute>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/payment"
								element={
									<ProtectedRoute>
										<CustomerRoute>
											<PaymentMethodScreen />
										</CustomerRoute>
									</ProtectedRoute>
								}
							/>
							<Route
								path="/placeorder"
								element={
									<ProtectedRoute>
										<CustomerRoute>
											<PlaceOrderScreen />
										</CustomerRoute>
									</ProtectedRoute>
								}
							/>

							{/* PROTECTED ROUTES */}
							<Route
								path="/order/:id"
								element={
									<ProtectedRoute>
										<OrderScreen />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/orderhistory"
								element={
									<ProtectedRoute>
										<OrderHistoryScreen />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<ProtectedRoute>
										<ProfileScreen />
									</ProtectedRoute>
								}
							/>

							{/* <Route path="/services" element={<ProtectedRoute><CustomerRoute><ServicesScreen/></CustomerRoute></ProtectedRoute>}/> */}
							<Route
								path="/search"
								element={
									<CustomerRoute>
										<SearchScreen />
									</CustomerRoute>
								}
							/>

							<Route
								path="/designer"
								element={
									<ProtectedRoute>
										<DesignerScreen />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/custom/:id"
								element={
									<ProtectedRoute>
										<CustomizeScreen />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/customize/:id"
								element={
									<ProtectedRoute>
										<CustomizeRequestScreen />
									</ProtectedRoute>
								}
							/>

							{/* ADMIN ROUTES    ADMIN ROUTES      ADMIN ROUTES      ADMIN ROUTES*/}
							<Route
								path="/admin/dashboard"
								element={
									<AdminRoute>
										<DashboardScreen />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/sales"
								element={
									<AdminRoute>
										<SalesReport />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/products"
								element={
									<AdminRoute>
										<ProductListScreen />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/product/:id"
								element={
									<AdminRoute>
										<ProductEditScreen />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/product/create"
								element={
									<AdminRoute>
										<CreateProduct />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/orders"
								element={
									<AdminRoute>
										<OrderListScreen />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/users"
								element={
									<AdminRoute>
										<UserListScreen />
									</AdminRoute>
								}
							/>
							<Route
								path="/admin/user/:id"
								element={
									<AdminRoute>
										<UserEditScreen />
									</AdminRoute>
								}
							/>

							<Route
								path="/"
								element={
									<CustomerRoute>
										<HomeScreen userInfo={userInfo} />
									</CustomerRoute>
								}
							/>
						</Routes>
					</Container>
				</main>
				{/* <footer>
					<div className="text-center">ALL RIGHTS RESERVED</div>
				</footer> */}
			</div>
		</BrowserRouter>
	);
}

export default App;
