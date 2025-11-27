import React, { createContext, useState, useContext } from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

const CartProvider = ({ children }) => {
    // Retrieve stored cart from localStorage
    const storedCart = localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    const [cart, setCart] = useState(storedCart);

    const updateQuantity = (productId, action) => {
        setCart(prevCart => {
            const updatedCart = prevCart.map(item => {
                if (item._id === productId) {
                    const newQuantity = action === 'increase'
                        ? item.quantity + 1
                        : Math.max(item.quantity - 1, 1); // Prevent negative quantity
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });

            // Update localStorage with the new cart state
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            return updatedCart;
        });
    };

    const removeFromCart = (productId) => {
        const updatedCart = cart.filter(item => item._id !== productId);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast("Product removed from cart");
    };

    return (
        <CartContext.Provider value={{ cart, setCart, updateQuantity, removeFromCart }}>
            {children}
        </CartContext.Provider>
    );
};

const useCart = () => useContext(CartContext);

export { CartProvider, useCart };
