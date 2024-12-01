import React, { useReducer, useEffect, useState, useRef } from "react";
import { Form, Button, Spinner } from "react-bootstrap";
import logger from "use-reducer-logger";
import "./ChatHead.css";
import RequestHandler from "../functions/RequestHandler";
import ChatImage from "./ChatImage";

const reducer = (state, action) => {
	switch (action.type) {
		case "FETCH_REQUEST":
			return { ...state, loading: true };
		case "FETCH_SUCCESS":
			return { ...state, messages: action.payload, loading: false };
		case "FETCH_FAIL":
			return { ...state, loading: false, error: action.payload };
		case "SEND_REQUEST":
			return { ...state, sending: true };
		case "SEND_SUCCESS":
			return {
				...state,
				messages: [...state.messages, action.payload],
				sending: false,
			};
		case "SEND_FAIL":
			return { ...state, sending: false, error: action.payload };
		default:
			return state;
	}
};

export default function ChatScreen({ userInfo }) {
	const [isSendDisabled, setIsSendDisabled] = useState(false);
	const handleInputChange = (e) => {
		setInputValue(e.target.value);
	};

	const [{ loading, error, messages, sending }, dispatch] = useReducer(
		logger(reducer),
		{
			loading: true,
			messages: [],
			error: "",
			sending: false,
		}
	);

	const [inputValue, setInputValue] = useState("");
	const [isMessageBoxVisible, setIsMessageBoxVisible] = useState(false);
	const messagesEndRef = useRef(null);

	const [selectedImage, setSelectedImage] = useState(null);
	const [isZoomed, setIsZoomed] = useState(false);
	const [zoomedImage, setZoomedImage] = useState(null);

	const handleImageClick = (imageSrc) => {
		setIsZoomed(true);
		setZoomedImage(imageSrc);
	};

	const closeModal = () => {
		setIsZoomed(false);
		setZoomedImage(null);
	};

	const toggleMessageBox = () => {
		setIsMessageBoxVisible((prev) => !prev);
	};

	const fetchChatHistory = async () => {
		dispatch({ type: "FETCH_REQUEST" });
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				`chats/user/${userInfo.id}`,
				{
					headers: { Authorization: `Bearer ${userInfo.token}` },
				}
			);

			dispatch({ type: "FETCH_SUCCESS", payload: data.messages });
		} catch (error) {
			dispatch({
				type: "FETCH_FAIL",
				payload: error.message,
			});
		}
	};

	const handleSendMessage = async () => {
		if (inputValue.trim()) {
			dispatch({ type: "SEND_REQUEST" });
			try {
				const newMessage = { user: userInfo.id, text: inputValue };
				const data = await RequestHandler.handleRequest(
					"post",
					`chats/user/${userInfo.id}`,
					{
						message: inputValue,
						user: userInfo.id,
						image: selectedImage,
					},
					{
						headers: {
							Authorization: `Bearer ${userInfo.token}`,
							"Content-Type": "multipart/form-data",
						},
					}
				);

				dispatch({ type: "SEND_SUCCESS", payload: newMessage });
				setInputValue("");
				setSelectedImage(null);
				fetchChatHistory();
			} catch (error) {
				dispatch({
					type: "SEND_FAIL",
					payload: error.message,
				});
			}
		}
	};

	const scrollDown = (behavior) => {
		if (messagesEndRef.current)
			messagesEndRef.current.scrollIntoView({ behavior: behavior });
	};

	useEffect(() => {
		if (userInfo) fetchChatHistory();
		scrollDown("smooth");
	}, [userInfo]);

	useEffect(() => scrollDown("instant"), [isMessageBoxVisible]);
	useEffect(() => scrollDown("smooth"), [messages]);

	if (!userInfo) {
		return null;
	}

	return (
		<div style={{ position: "absolute", top: "0", left: "0" }}>
			<img
				src="https://cdn-icons-png.flaticon.com/512/309/309666.png"
				alt="Chat Icon"
				className="chat-heads"
				onClick={toggleMessageBox}
			/>
			{isZoomed && zoomedImage && (
				<div className="message-modal" onClick={closeModal}>
					<img
						className="modal-content"
						src={zoomedImage}
						alt="Zoomed"
					/>
				</div>
			)}
			<div
				className={`message-box ${
					isMessageBoxVisible ? "expand" : "collapse"
				}`}
			>
				{isMessageBoxVisible && (
					<div className="message-container z-255">
						{messages.length > 0 ? (
							messages.map((msg, index) => (
								<>
									<ChatImage
										handleImageClick={handleImageClick}
										msg={msg}
										userInfo={userInfo}
									/>
									<div
										key={index}
										className={`message ${
											msg.user === userInfo.id
												? "your-message"
												: "their-message"
										}`}
									>
										<strong>
											{msg.user === userInfo.id
												? "You"
												: "Service"}
											:
										</strong>{" "}
										{msg.text}
									</div>
								</>
							))
						) : (
							<div>No messages yet.</div>
						)}
						<div ref={messagesEndRef} />
					</div>
				)}
				{selectedImage && (
					<div className="image-preview">
						<img
							src={URL.createObjectURL(selectedImage)}
							alt="Uploaded"
						/>
					</div>
				)}

				{isMessageBoxVisible && (
					<>
						<div className="chat-input">
							<input
								type="text"
								value={inputValue}
								onChange={handleInputChange}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleSendMessage();
									}
								}}
								placeholder="Type a message..."
							/>
							<Form.Control
								type="file"
								id="file-input"
								onChange={(e) =>
									setSelectedImage(e.target.files[0])
								}
								accept="image/*"
							/>
							<label htmlFor="file-input" className="image-icon">
								<img
									style={{ width: "40px", height: "40px" }}
									src="https://i.pinimg.com/474x/e8/ee/07/e8ee0728e1ba12edd484c111c1f492f2.jpg"
									alt="Upload"
								/>
							</label>
							<button
								onClick={handleSendMessage}
								className="send-button"
								disabled={isSendDisabled}
							>
								{isSendDisabled ? "Wait..." : "Send"}
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
