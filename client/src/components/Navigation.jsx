import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import NavDropdown from "react-bootstrap/NavDropdown";
import SearchBox from "./SearchBox";
import { Typography } from "@mui/material";
import { LinkContainer } from "react-router-bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";
import logo from "../LOGO.png";
import Badge from "react-bootstrap/esm/Badge";

export default function Navigation({ userInfo, cart, signoutHandler }) {
	const location = useLocation();
	const isSignInPage = location.pathname === "/signin";
	const isSignUpPage = location.pathname === "/signup";

	// State to toggle the mobile menu
	const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Toggle function for the mobile menu
	const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

	return (
		<>
			<div className="bg-black p-1 px-4 flex items-center justify-between">
				{/* Left Section */}
				<div className="flex items-center space-x-4">
					<LinkContainer to="/">
						<img
							src={logo}
							alt="Logo"
							className="cursor-pointer w-16 h-auto sm:w-20"
						/>
					</LinkContainer>

					<LinkContainer to="/">
						<div className="text-white cursor-pointer font-bold lg:text-6xl sm:text-2xl">
							RYB OFFICIAL ONLINE STORE
						</div>
					</LinkContainer>

					{/* {(!userInfo || !userInfo.isAdmin) && <SearchBox />} */}
				</div>

				{/* Right Section */}
				<div className="flex items-center space-x-6 hidden sm:flex z-50">
					{/* Cart Link */}
					<Link to="/cart" className="relative">
						<div className="flex items-center space-x-1">
							<i className="fas fa-shopping-cart text-white"></i>
							{cart.cartItems.length > 0 && (
								<Badge
									pill
									bg="danger"
									className="absolute -top-2 -right-2"
								>
									{cart.cartItems.reduce(
										(a, c) => a + c.quantity,
										0
									)}
								</Badge>
							)}
						</div>
					</Link>
					<Link
						to="/"
						className="text-white font-semibold no-underline"
					>
						HOME
					</Link>
					{/* Products and Home Links */}
					<Link
						to="/search"
						className={`text-white font-semibold no-underline ${
							location.pathname === "/search"
								? "text-yellow-500"
								: ""
						}`}
					>
						PRODUCTS
					</Link>
					{/* User Dropdown or Sign In/Up */}
					{userInfo ? (
						<NavDropdown
							title={userInfo.name}
							id="basic-nav-dropdown"
							className="text-white z-50"
						>
							<LinkContainer to="/profile">
								<NavDropdown.Item className="text-white bg-black border border-white rounded-md">
									User Profile
								</NavDropdown.Item>
							</LinkContainer>

							{!userInfo.isRider && (
								<LinkContainer to="/orderhistory">
									<NavDropdown.Item className="text-white bg-black border border-white rounded-md">
										Order History
									</NavDropdown.Item>
								</LinkContainer>
							)}

							<div onClick={signoutHandler}>
								<NavDropdown.Item className="text-white bg-black border border-white rounded-md">
									SIGN OUT
								</NavDropdown.Item>
							</div>
						</NavDropdown>
					) : (
						<>
							{isSignInPage ? (
								<Link
									to="/signup"
									className="text-white font-semibold"
								>
									SIGN UP
								</Link>
							) : (
								<Link
									to="/signin"
									className="text-white font-semibold"
								>
									SIGN IN
								</Link>
							)}
						</>
					)}
				</div>

				{/* Mobile Menu Button - Hamburger Icon */}
				<div className="sm:hidden flex items-center space-x-4">
					<button onClick={toggleMobileMenu} className="text-white">
						<i
							className={`fas fa-bars ${
								isMobileMenuOpen ? "text-red-500" : ""
							}`}
						></i>
					</button>
				</div>
			</div>

			{/* Mobile Menu - Hidden by default, shown when state is true */}
			<div
				className={`sm:hidden ${
					isMobileMenuOpen ? "block" : "hidden"
				} bg-black p-4`}
			>
				<div className="flex flex-col space-y-4">
					{userInfo ? (
						<NavDropdown
							title={userInfo.name}
							id="basic-nav-dropdown"
							className="text-white z-50"
						>
							<LinkContainer to="/profile">
								<NavDropdown.Item className="text-white bg-black border border-white rounded-md">
									User Profile
								</NavDropdown.Item>
							</LinkContainer>

							{!userInfo.isRider && (
								<LinkContainer to="/orderhistory">
									<NavDropdown.Item className="text-white bg-black border border-white rounded-md">
										Order History
									</NavDropdown.Item>
								</LinkContainer>
							)}

							<div onClick={signoutHandler}>
								<NavDropdown.Item className="text-white bg-black border border-white rounded-md">
									SIGN OUT
								</NavDropdown.Item>
							</div>
						</NavDropdown>
					) : (
						<>
							{isSignInPage ? (
								<Link to="/signup" className="text-white">
									SIGN UP
								</Link>
							) : (
								<Link to="/signin" className="text-white">
									SIGN IN
								</Link>
							)}
						</>
					)}

					<Link to="/search" className="text-white">
						PRODUCTS
					</Link>

					<Link to="/" className="text-white">
						HOME
					</Link>

					{/* Cart Link */}
					<Link to="/cart" className="relative text-white">
						<div className="flex items-center space-x-1">
							<i className="fas fa-shopping-cart"></i>
							{cart.cartItems.length > 0 && (
								<Badge
									pill
									bg="danger"
									className="absolute -top-2 -right-2"
								>
									{cart.cartItems.reduce(
										(a, c) => a + c.quantity,
										0
									)}
								</Badge>
							)}
						</div>
					</Link>
				</div>
			</div>
		</>
	);
}
