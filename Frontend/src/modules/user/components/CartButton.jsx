import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/** Header cart icon with item-count badge. `variant="light"` for red/dark headers. */
const CartButton = ({ variant = 'light', className = '' }) => {
  const navigate = useNavigate();
  const { count } = useCart();
  const styles =
    variant === 'light'
      ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
      : 'bg-white border-slate-200 text-slate-600 hover:text-[#CE2029] hover:border-[#CE2029]/30';

  return (
    <button
      type="button"
      onClick={() => navigate('/cart')}
      aria-label={count ? `Cart, ${count} slot${count === 1 ? '' : 's'}` : 'Cart'}
      className={`relative w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center border active:scale-95 transition-all shadow-sm ${styles} ${className}`}
    >
      <ShoppingCart size={16} />
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-[#CE2029] border border-[#CE2029]/30 text-[9px] font-black flex items-center justify-center shadow">
          {count}
        </span>
      )}
    </button>
  );
};

export default CartButton;
