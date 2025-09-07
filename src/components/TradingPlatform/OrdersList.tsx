import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { Order } from 'src/store/TradingPlatformStore';
import './OrdersList.scss';

interface OrdersListProps {
    orders: Order[];
}

const OrdersList: React.FC<OrdersListProps> = ({ orders }) => {
    const { tradingPlatform } = useStores();
    
    const handleCancelOrder = (orderId: string) => {
        tradingPlatform.cancelOrder(orderId);
    };
    
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'filled': return 'green';
            case 'cancelled': return 'red';
            case 'rejected': return 'red';
            default: return 'gray';
        }
    };
    
    if (orders.length === 0) {
        return (
            <div className="orders-list empty">
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <p>No open orders</p>
                    <span>Your pending orders will appear here</span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="orders-list">
            <div className="orders-header">
                <div className="header-cell">Symbol</div>
                <div className="header-cell">Type</div>
                <div className="header-cell">Side</div>
                <div className="header-cell">Size</div>
                <div className="header-cell">Price</div>
                <div className="header-cell">Status</div>
                <div className="header-cell">Action</div>
            </div>
            
            <div className="orders-body">
                {orders.map((order) => (
                    <div key={order.id} className="order-row">
                        <div className="order-cell symbol">
                            <span className="symbol-name">{order.symbol}</span>
                            <span className="order-time">{formatTime(order.timestamp)}</span>
                        </div>
                        
                        <div className="order-cell type">
                            <span className="type-badge">{order.type.toUpperCase()}</span>
                        </div>
                        
                        <div className="order-cell side">
                            <span className={`side-badge ${order.side}`}>
                                {order.side.toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="order-cell size">
                            {order.size.toLocaleString()}
                        </div>
                        
                        <div className="order-cell price">
                            {order.price ? order.price.toFixed(5) : 'Market'}
                            {order.stopPrice && (
                                <div className="stop-price">
                                    Stop: {order.stopPrice.toFixed(5)}
                                </div>
                            )}
                        </div>
                        
                        <div className="order-cell status">
                            <span 
                                className="status-badge"
                                style={{ backgroundColor: getStatusColor(order.status) }}
                            >
                                {order.status.toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="order-cell actions">
                            {order.status === 'pending' && (
                                <button
                                    className="cancel-button"
                                    onClick={() => handleCancelOrder(order.id)}
                                    title="Cancel Order"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                        
                        {/* Fill information for completed orders */}
                        {order.fillPrice && order.fillTime && (
                            <div className="fill-info">
                                <span>Filled at {order.fillPrice.toFixed(5)} on {formatTime(order.fillTime)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="orders-footer">
                <div className="summary">
                    <span>Total Orders: {orders.length}</span>
                    <span>Pending: {orders.filter(o => o.status === 'pending').length}</span>
                </div>
            </div>
        </div>
    );
};

export default observer(OrdersList);