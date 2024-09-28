import { Component, OnInit } from '@angular/core';
import { Cart } from '../../models/Cart';
import { CartService } from '../../service/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  carts: Cart[] = [];

  constructor(private cartSv: CartService) { }

  ngOnInit(): void {
    this.loadCartData(); // Tải dữ liệu giỏ hàng khi khởi tạo
  }

  getFormattedPrice(price: number): string {
    // Chuyển đổi giá sang định dạng tiền tệ mà không có chữ "đ" ở đầu
    return `${price.toLocaleString('vi-VN')} đ`;
  }

  loadCartData(): void {
    const userId = this.cartSv.checkLogin();
    
    if (userId) {
      // Người dùng đã đăng nhập, lấy giỏ hàng từ server
      this.cartSv.getCart().subscribe((res: any) => {
        if (res && res.data && Array.isArray(res.data)) {
          this.carts = res.data;
          console.log(this.carts);
        } else {
          console.error("Invalid data format:", res);
        }
      });
    } else {
      // Người dùng chưa đăng nhập, lấy giỏ hàng từ LocalStorage
      const localCart = localStorage.getItem('tempCart');
      console.log(localCart);
      if (localCart) {
        this.carts = JSON.parse(localCart);
        console.log('Giỏ hàng từ LocalStorage:', this.carts);
      } else {
        console.log('Không có giỏ hàng trong LocalStorage');
      }
    }
  }

  getImageUrl(data: Cart): string {
    const HostUrl = "https://localhost:7066/api";
    if (data && data.productID) {
      return `${HostUrl}/Products/images/product/${data.productID}`;
    } else {
      return ''; // hoặc bạn có thể trả về một đường dẫn mặc định nếu không có ProductID
    }
  }

  calculateTotal(): number {
    let total = 0;
    for (let cart of this.carts) {
      total += cart.totalPrice;
    }
    return total;
  }

  calculateSubtotal(): number {
    let subtotal = 0;
    for (let cart of this.carts) {
      subtotal += cart.totalPrice;
    }
    return subtotal;
  }

  increaseQuantity(cartItem: any) {
    const userId = this.cartSv.checkLogin(); // Lấy userId từ hàm checkLogin
    if (userId === null) {
      console.error('Người dùng chưa đăng nhập');
      return;
    }
    this.cartSv.updateQuantity(cartItem, userId, 'increase');
    this.loadCartData(); // Tải lại dữ liệu giỏ hàng sau khi cập nhật
  }

  decreaseQuantity(cartItem: any) {
    const userId = this.cartSv.checkLogin(); // Lấy userId từ hàm checkLogin
    if (userId === null) {
      console.error('Người dùng chưa đăng nhập');
      return;
    }
    this.cartSv.updateQuantity(cartItem, userId, 'decrease');
    this.loadCartData(); // Tải lại dữ liệu giỏ hàng sau khi cập nhật
  }

  deleteCartItem(cartId: number) {
    const userId = this.cartSv.checkLogin();
    if (userId) {
      // Xóa mục trong giỏ hàng trên server
      this.cartSv.deleteCart(cartId).subscribe(
        response => {
          console.log('Xóa mục trong giỏ hàng thành công:', response);
          this.loadCartData(); // Tải lại dữ liệu giỏ hàng sau khi xóa thành công
        },
        error => {
          console.error('Có vấn đề với yêu cầu xóa:', error);
        }
      );
    } else {
      // Xóa mục trong giỏ hàng LocalStorage
      const localCart = this.carts.filter(cart => cart.cartId !== cartId);
      localStorage.setItem('cart', JSON.stringify(localCart));
      this.carts = localCart;
      console.log('Xóa mục trong giỏ hàng LocalStorage:', cartId);
    }
  }
}
