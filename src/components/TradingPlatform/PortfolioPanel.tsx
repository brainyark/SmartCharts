import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import './PortfolioPanel.scss';

const PortfolioPanel: React.FC = () => {
    const { tradingPlatform } = useStores();
    
    const portfolioMetrics = {
        totalValue: tradingPlatform.portfolioValue,
        totalPnL: tradingPlatform.totalPnL,
        totalPnLPercent: tradingPlatform.totalPnLPercent,
        openPositions: tradingPlatform.activePositions.length,
        totalTrades: tradingPlatform.positions.length,
    };
    
    return (
        <div className="portfolio-panel">
            <div className="portfolio-overview">
                <div className="overview-card">
                    <h3>Portfolio Overview</h3>
                    <div className="metrics-grid">
                        <div className="metric">
                            <span className="metric-label">Total Value</span>
                            <span className="metric-value">
                                ${portfolioMetrics.totalValue.toLocaleString()}
                            </span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Total P&L</span>
                            <span className={`metric-value ${portfolioMetrics.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                                ${portfolioMetrics.totalPnL.toFixed(2)} ({portfolioMetrics.totalPnLPercent.toFixed(2)}%)
                            </span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Open Positions</span>
                            <span className="metric-value">{portfolioMetrics.openPositions}</span>
                        </div>
                        <div className="metric">
                            <span className="metric-label">Total Trades</span>
                            <span className="metric-value">{portfolioMetrics.totalTrades}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="portfolio-content">
                <div className="positions-section">
                    <h3>Open Positions</h3>
                    {/* Position details would go here */}
                    <p>Portfolio tracking and analytics coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default observer(PortfolioPanel);