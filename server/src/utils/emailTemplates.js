const baseStyle = `
  font-family: 'Segoe UI', sans-serif;
  background: #0a0a0f;
  color: #f1f5f9;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
`;

const header = (title) => `
  <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 32px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">OmniDeal</h1>
    <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">${title}</p>
  </div>
`;

const footer = () => `
  <div style="background: #12121a; padding: 24px; text-align: center; color: #64748b; font-size: 14px;">
    <p style="margin: 0;">© ${new Date().getFullYear()} OmniDeal. All rights reserved.</p>
    <p style="margin: 8px 0 0;"><a href="${process.env.CLIENT_URL}" style="color: #a855f7;">Visit our store</a></p>
  </div>
`;

export const orderConfirmationTemplate = (order) => `
<!DOCTYPE html>
<html>
<body style="${baseStyle}">
  ${header('Order Confirmed! 🎉')}
  <div style="padding: 32px; background: #12121a;">
    <p style="color: #94a3b8;">Hi ${order.delivery.name},</p>
    <p style="color: #94a3b8;">Your order <strong style="color: #a855f7;">#${order.orderNumber}</strong> has been confirmed!</p>

    <div style="background: #1e1e2e; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #f1f5f9; margin: 0 0 16px;">Order Summary</h3>
      ${order.items.map(item => `
        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2d2d3d; color: #94a3b8;">
          <span>${item.productName} × ${item.quantity}</span>
          <span style="color: #f59e0b;">৳${item.subtotal}</span>
        </div>
      `).join('')}
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #2d2d3d;">
        <div style="display: flex; justify-content: space-between; color: #94a3b8;">
          <span>Delivery</span>
          <span>৳${order.pricing.deliveryCharge}</span>
        </div>
        ${order.pricing.discount ? `<div style="display: flex; justify-content: space-between; color: #10b981;"><span>Discount</span><span>-৳${order.pricing.discount}</span></div>` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #f1f5f9; margin-top: 8px;">
          <span>Total</span>
          <span style="color: #a855f7;">৳${order.pricing.total}</span>
        </div>
      </div>
    </div>

    <div style="background: #1e1e2e; border-radius: 8px; padding: 20px; margin: 20px 0;">
      <h3 style="color: #f1f5f9; margin: 0 0 12px;">Delivery To</h3>
      <p style="color: #94a3b8; margin: 0;">${order.delivery.name}</p>
      <p style="color: #94a3b8; margin: 4px 0;">${order.delivery.phone}</p>
      <p style="color: #94a3b8; margin: 4px 0;">${order.delivery.fullAddress}</p>
    </div>

    <a href="${process.env.CLIENT_URL}/track-order/${order.orderNumber}"
       style="display: block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
      Track Your Order
    </a>
  </div>
  ${footer()}
</body>
</html>
`;

export const orderStatusTemplate = (order, newStatus) => `
<!DOCTYPE html>
<html>
<body style="${baseStyle}">
  ${header(`Order ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`)}
  <div style="padding: 32px; background: #12121a;">
    <p style="color: #94a3b8;">Hi ${order.delivery.name},</p>
    <p style="color: #94a3b8;">Your order <strong style="color: #a855f7;">#${order.orderNumber}</strong> status has been updated to <strong style="color: #10b981;">${newStatus.toUpperCase()}</strong>.</p>
    <a href="${process.env.CLIENT_URL}/track-order/${order.orderNumber}"
       style="display: block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
      Track Order
    </a>
  </div>
  ${footer()}
</body>
</html>
`;

export const welcomeTemplate = (user) => `
<!DOCTYPE html>
<html>
<body style="${baseStyle}">
  ${header('Welcome to OmniDeal! 🛍️')}
  <div style="padding: 32px; background: #12121a; text-align: center;">
    <p style="color: #94a3b8; font-size: 16px;">Hi ${user.name}, welcome to OmniDeal!</p>
    <p style="color: #94a3b8;">Discover amazing products at unbeatable prices.</p>
    <a href="${process.env.CLIENT_URL}"
       style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
      Start Shopping
    </a>
  </div>
  ${footer()}
</body>
</html>
`;

export const passwordResetTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<body style="${baseStyle}">
  ${header('Reset Your Password')}
  <div style="padding: 32px; background: #12121a;">
    <p style="color: #94a3b8;">Hi ${name},</p>
    <p style="color: #94a3b8;">Click the button below to reset your password. Link expires in 1 hour.</p>
    <a href="${resetUrl}"
       style="display: block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
      Reset Password
    </a>
    <p style="color: #64748b; font-size: 12px; margin-top: 20px;">If you didn't request this, ignore this email.</p>
  </div>
  ${footer()}
</body>
</html>
`;
