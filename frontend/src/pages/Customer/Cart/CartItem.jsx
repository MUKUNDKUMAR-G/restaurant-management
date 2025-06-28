import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
export const CartItem = ({ item, updateQuantity, removeFromCart }) => (
  <div className="cart-item" key={item.id}>
    <img
      src={item.image}
      alt={item.name}
      className="cart-item-image"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src =
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27";
      }}
    />
    <div className="cart-item-details">
      <h3 className="cart-item-name">{item.name}</h3>
      <p className="cart-item-price">${item.price}</p>
      <div className="cart-item-actions">
        <button
          onClick={() =>
            updateQuantity(item.id, Math.max(1, item.quantity - 1))
          }
          className="quantity-button"
          aria-label="Decrease quantity"
        >
          <FiMinus />
        </button>
        <span className="quantity">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="quantity-button"
          aria-label="Increase quantity"
        >
          <FiPlus />
        </button>
        <button
          onClick={() => removeFromCart(item.id)}
          className="remove-button"
          aria-label="Remove item"
        >
          <FiTrash2 size={20} />
        </button>
      </div>
    </div>
    <div className="cart-item-total">
      <p>${(Number(item.price) * item.quantity).toFixed(2)}</p>
    </div>
  </div>
);
