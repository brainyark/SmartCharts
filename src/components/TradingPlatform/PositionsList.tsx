import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { Position } from 'src/store/TradingPlatformStore';
import './PositionsList.scss';

interface PositionsListProps {
    positions: Position[];
}

const PositionsList: React.FC<PositionsListProps> = ({ positions }) => {
    const { tradingPlatform } = useStores();
    
    const handleClosePosition = (positionId: string) => {
        tradingPlatform.closePosition(positionId);
    };
    
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };
    
    if (positions.length === 0) {
        return (
            <div className="positions-list empty">
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <p>No open positions</p>
                    <span>Your positions will appear here</span>
                </div>
            </div>
        );
    }
    
    return (
        <div className="positions-list">
            <div className="positions-header">
                <div className="header-cell">Symbol</div>
                <div className="header-cell">Side</div>
                <div className="header-cell">Size</div>
                <div className="header-cell">Entry</div>
                <div className="header-cell">Current</div>
                <div className="header-cell">P&L</div>
                <div className="header-cell">Action</div>
            </div>
            
            <div className="positions-body">
                {positions.map((position) => (
                    <div key={position.id} className="position-row">
                        <div className="position-cell symbol">
                            <span className="symbol-name">{position.symbol}</span>
                            <span className="position-time">{formatTime(position.timestamp)}</span>
                        </div>
                        
                        <div className="position-cell side">
                            <span className={`side-badge ${position.side}`}>
                                {position.side.toUpperCase()}
                            </span>
                        </div>
                        
                        <div className="position-cell size">
                            {position.size.toLocaleString()}
                        </div>
                        
                        <div className="position-cell entry-price">
                            {position.entryPrice.toFixed(5)}
                        </div>
                        
                        <div className="position-cell current-price">
                            <span className={position.currentPrice > position.entryPrice ? 'positive' : 'negative'}>
                                {position.currentPrice.toFixed(5)}
                            </span>
                        </div>
                        
                        <div className="position-cell pnl">
                            <div className="pnl-container">
                                <span className={`pnl-amount ${position.pnl >= 0 ? 'positive' : 'negative'}`}>
                                    ${position.pnl.toFixed(2)}
                                </span>
                                <span className={`pnl-percent ${position.pnlPercent >= 0 ? 'positive' : 'negative'}`}>
                                    ({position.pnlPercent.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                        
                        <div className="position-cell actions">
                            <button
                                className="close-button"
                                onClick={() => handleClosePosition(position.id)}
                                title="Close Position"
                            >
                                ✕
                            </button>
                        </div>
                        
                        {/* Stop Loss / Take Profit indicators */}
                        {(position.stopLoss || position.takeProfit) && (
                            <div className="position-levels">
                                {position.stopLoss && (
                                    <div className="level stop-loss">
                                        SL: {position.stopLoss.toFixed(5)}
                                    </div>
                                )}
                                {position.takeProfit && (
                                    <div className="level take-profit">
                                        TP: {position.takeProfit.toFixed(5)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="positions-footer">
                <div className="summary">
                    <span>Total P&L: </span>
                    <span className={`total-pnl ${tradingPlatform.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                        ${tradingPlatform.totalPnL.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default observer(PositionsList);