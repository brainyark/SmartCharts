import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import './OrderBook.scss';

interface OrderBookLevel {
    price: number;
    size: number;
    total: number;
}

interface OrderBookProps {
    symbol: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
    const [bids, setBids] = useState<OrderBookLevel[]>([]);
    const [asks, setAsks] = useState<OrderBookLevel[]>([]);
    const [spread, setSpread] = useState(0);
    const [spreadPercent, setSpreadPercent] = useState(0);
    
    useEffect(() => {
        // Simulate order book data
        const generateOrderBook = () => {
            const basePrice = 1.0850; // EUR/USD example
            const bidLevels: OrderBookLevel[] = [];
            const askLevels: OrderBookLevel[] = [];
            
            let totalBidSize = 0;
            let totalAskSize = 0;
            
            // Generate bid levels (below current price)
            for (let i = 0; i < 15; i++) {
                const price = basePrice - (i + 1) * 0.00005 - Math.random() * 0.00002;
                const size = 100 + Math.random() * 500;
                totalBidSize += size;
                
                bidLevels.push({
                    price,
                    size,
                    total: totalBidSize
                });
            }
            
            // Generate ask levels (above current price)
            for (let i = 0; i < 15; i++) {
                const price = basePrice + (i + 1) * 0.00005 + Math.random() * 0.00002;
                const size = 100 + Math.random() * 500;
                totalAskSize += size;
                
                askLevels.push({
                    price,
                    size,
                    total: totalAskSize
                });
            }
            
            setBids(bidLevels);
            setAsks(askLevels);
            
            // Calculate spread
            const bestBid = bidLevels[0]?.price || 0;
            const bestAsk = askLevels[0]?.price || 0;
            const currentSpread = bestAsk - bestBid;
            const currentSpreadPercent = (currentSpread / bestBid) * 100;
            
            setSpread(currentSpread);
            setSpreadPercent(currentSpreadPercent);
        };
        
        generateOrderBook();
        const interval = setInterval(generateOrderBook, 2000 + Math.random() * 3000);
        
        return () => clearInterval(interval);
    }, [symbol]);
    
    const maxBidTotal = Math.max(...bids.map(b => b.total));
    const maxAskTotal = Math.max(...asks.map(a => a.total));
    
    return (
        <div className="order-book">
            <div className="order-book__header">
                <h3>Order Book - {symbol}</h3>
                <div className="spread-info">
                    <span className="spread-value">{spread.toFixed(5)}</span>
                    <span className="spread-percent">({spreadPercent.toFixed(3)}%)</span>
                </div>
            </div>
            
            <div className="order-book__headers">
                <div className="column-header">Price</div>
                <div className="column-header">Size</div>
                <div className="column-header">Total</div>
            </div>
            
            <div className="order-book__content">
                {/* Asks (Sell Orders) */}
                <div className="asks-section">
                    {asks.slice().reverse().map((ask, index) => (
                        <div key={`ask-${index}`} className="order-level ask">
                            <div 
                                className="level-background"
                                style={{ width: `${(ask.total / maxAskTotal) * 100}%` }}
                            />
                            <div className="price">{ask.price.toFixed(5)}</div>
                            <div className="size">{ask.size.toFixed(0)}</div>
                            <div className="total">{ask.total.toFixed(0)}</div>
                        </div>
                    ))}
                </div>
                
                {/* Spread Indicator */}
                <div className="spread-indicator">
                    <div className="spread-line"></div>
                    <div className="spread-text">
                        Spread: {spread.toFixed(5)}
                    </div>
                </div>
                
                {/* Bids (Buy Orders) */}
                <div className="bids-section">
                    {bids.map((bid, index) => (
                        <div key={`bid-${index}`} className="order-level bid">
                            <div 
                                className="level-background"
                                style={{ width: `${(bid.total / maxBidTotal) * 100}%` }}
                            />
                            <div className="price">{bid.price.toFixed(5)}</div>
                            <div className="size">{bid.size.toFixed(0)}</div>
                            <div className="total">{bid.total.toFixed(0)}</div>
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="order-book__footer">
                <div className="market-info">
                    <div className="info-item">
                        <span className="label">Last:</span>
                        <span className="value">{(bids[0]?.price + asks[0]?.price) / 2 || 0}</span>
                    </div>
                    <div className="info-item">
                        <span className="label">Volume:</span>
                        <span className="value">{((maxBidTotal + maxAskTotal) / 1000).toFixed(1)}K</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default observer(OrderBook);