import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import OrderBook from './OrderBook';
import PositionsList from './PositionsList';
import OrdersList from './OrdersList';
import './TradingPanel.scss';

const TradingPanel: React.FC = () => {
    const { tradingPlatform, chartTitle } = useStores();
    const [selectedOrderType, setSelectedOrderType] = useState<'market' | 'limit' | 'stop'>('market');
    const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
    const [orderSize, setOrderSize] = useState('100');
    const [orderPrice, setOrderPrice] = useState('');
    const [stopPrice, setStopPrice] = useState('');
    
    const currentSymbol = chartTitle.currentSymbol?.symbol || 'EURUSD';
    const currentPrice = tradingPlatform.marketData[currentSymbol]?.price || 1.0850;
    
    const handlePlaceOrder = async () => {
        try {
            const orderData = {
                symbol: currentSymbol,
                side: orderSide,
                type: selectedOrderType,
                size: parseFloat(orderSize),
                price: selectedOrderType !== 'market' ? parseFloat(orderPrice) : currentPrice,
                stopPrice: selectedOrderType === 'stop' ? parseFloat(stopPrice) : undefined,
            };
            
            await tradingPlatform.placeOrder(orderData);
            
            // Reset form
            setOrderSize('100');
            setOrderPrice('');
            setStopPrice('');
            
            // Show success notification
            tradingPlatform.mainStore.notifier.notify({
                text: `${orderSide.toUpperCase()} order placed for ${orderSize} ${currentSymbol}`,
                type: 'success',
                category: 'trading',
            });
        } catch (error) {
            tradingPlatform.mainStore.notifier.notify({
                text: `Failed to place order: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error',
                category: 'trading',
            });
        }
    };
    
    return (
        <div className="trading-panel">
            <div className="trading-panel__left">
                {/* Order Form */}
                <div className="trading-card">
                    <div className="card-header">
                        <h3>Place Order</h3>
                        <div className="symbol-info">
                            <span className="symbol">{currentSymbol}</span>
                            <span className="price">${currentPrice.toFixed(5)}</span>
                        </div>
                    </div>
                    
                    <div className="order-form">
                        {/* Order Side */}
                        <div className="order-side-buttons">
                            <button
                                className={`side-button buy ${orderSide === 'buy' ? 'active' : ''}`}
                                onClick={() => setOrderSide('buy')}
                            >
                                BUY
                            </button>
                            <button
                                className={`side-button sell ${orderSide === 'sell' ? 'active' : ''}`}
                                onClick={() => setOrderSide('sell')}
                            >
                                SELL
                            </button>
                        </div>
                        
                        {/* Order Type */}
                        <div className="form-group">
                            <label>Order Type</label>
                            <select 
                                value={selectedOrderType} 
                                onChange={(e) => setSelectedOrderType(e.target.value as any)}
                                className="form-select"
                            >
                                <option value="market">Market</option>
                                <option value="limit">Limit</option>
                                <option value="stop">Stop</option>
                            </select>
                        </div>
                        
                        {/* Order Size */}
                        <div className="form-group">
                            <label>Size</label>
                            <input
                                type="number"
                                value={orderSize}
                                onChange={(e) => setOrderSize(e.target.value)}
                                className="form-input"
                                placeholder="100"
                            />
                        </div>
                        
                        {/* Order Price (for limit/stop orders) */}
                        {selectedOrderType !== 'market' && (
                            <div className="form-group">
                                <label>Price</label>
                                <input
                                    type="number"
                                    value={orderPrice}
                                    onChange={(e) => setOrderPrice(e.target.value)}
                                    className="form-input"
                                    placeholder={currentPrice.toFixed(5)}
                                    step="0.00001"
                                />
                            </div>
                        )}
                        
                        {/* Stop Price (for stop orders) */}
                        {selectedOrderType === 'stop' && (
                            <div className="form-group">
                                <label>Stop Price</label>
                                <input
                                    type="number"
                                    value={stopPrice}
                                    onChange={(e) => setStopPrice(e.target.value)}
                                    className="form-input"
                                    placeholder={currentPrice.toFixed(5)}
                                    step="0.00001"
                                />
                            </div>
                        )}
                        
                        {/* Risk Management */}
                        <div className="risk-management">
                            <div className="form-group">
                                <label>Stop Loss</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Optional"
                                    step="0.00001"
                                />
                            </div>
                            <div className="form-group">
                                <label>Take Profit</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="Optional"
                                    step="0.00001"
                                />
                            </div>
                        </div>
                        
                        {/* Order Summary */}
                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Estimated Cost:</span>
                                <span>${((parseFloat(orderSize) || 0) * currentPrice).toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Available Balance:</span>
                                <span>${tradingPlatform.selectedAccount?.balance.toLocaleString() || '0'}</span>
                            </div>
                        </div>
                        
                        <button 
                            className={`place-order-button ${orderSide}`}
                            onClick={handlePlaceOrder}
                            disabled={!orderSize || parseFloat(orderSize) <= 0}
                        >
                            Place {orderSide.toUpperCase()} Order
                        </button>
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="trading-card">
                    <div className="card-header">
                        <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions">
                        <button className="quick-action-button">
                            Close All Positions
                        </button>
                        <button className="quick-action-button">
                            Cancel All Orders
                        </button>
                        <button className="quick-action-button">
                            Auto Trade
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="trading-panel__center">
                {/* Order Book */}
                <OrderBook symbol={currentSymbol} />
            </div>
            
            <div className="trading-panel__right">
                {/* Positions */}
                <div className="trading-card">
                    <div className="card-header">
                        <h3>Open Positions ({tradingPlatform.activePositions.length})</h3>
                        <div className="total-pnl">
                            <span className={tradingPlatform.totalPnL >= 0 ? 'positive' : 'negative'}>
                                ${tradingPlatform.totalPnL.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <PositionsList positions={tradingPlatform.activePositions} />
                </div>
                
                {/* Orders */}
                <div className="trading-card">
                    <div className="card-header">
                        <h3>Open Orders ({tradingPlatform.openOrders.length})</h3>
                    </div>
                    <OrdersList orders={tradingPlatform.openOrders} />
                </div>
            </div>
        </div>
    );
};

export default observer(TradingPanel);