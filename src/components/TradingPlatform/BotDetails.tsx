import React from 'react';
import { observer } from 'mobx-react-lite';
import { BotInstance } from 'src/store/TradingBotStore';
import './BotDetails.scss';

interface BotDetailsProps {
    bot: BotInstance;
    onClose: () => void;
}

const BotDetails: React.FC<BotDetailsProps> = ({ bot, onClose }) => {
    return (
        <div className="bot-details">
            <div className="details-header">
                <div className="bot-info">
                    <h2>{bot.name}</h2>
                    <span className={`status-badge ${bot.status}`}>
                        {bot.status.toUpperCase()}
                    </span>
                </div>
                <button className="close-button" onClick={onClose}>✕</button>
            </div>
            
            <div className="details-content">
                <div className="stats-section">
                    <h3>Performance Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-label">Net Profit</span>
                            <span className={`stat-value ${bot.statistics.netProfit >= 0 ? 'positive' : 'negative'}`}>
                                ${bot.statistics.netProfit.toFixed(2)}
                            </span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Win Rate</span>
                            <span className="stat-value">{bot.statistics.winRate.toFixed(1)}%</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Total Trades</span>
                            <span className="stat-value">{bot.statistics.totalTrades}</span>
                        </div>
                        <div className="stat-card">
                            <span className="stat-label">Profit Factor</span>
                            <span className="stat-value">{bot.statistics.profitFactor.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="config-section">
                    <h3>Configuration</h3>
                    <div className="config-details">
                        <p><strong>Symbol:</strong> {bot.configuration.symbol}</p>
                        <p><strong>Strategy:</strong> {bot.strategyId}</p>
                        <p><strong>Created:</strong> {new Date(bot.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                
                <div className="trades-section">
                    <h3>Recent Trades</h3>
                    <div className="trades-list">
                        {bot.performance.trades.slice(-10).map((trade) => (
                            <div key={trade.id} className="trade-item">
                                <span className={`trade-side ${trade.side}`}>
                                    {trade.side.toUpperCase()}
                                </span>
                                <span className="trade-symbol">{trade.symbol}</span>
                                <span className="trade-price">${trade.entryPrice.toFixed(5)}</span>
                                <span className={`trade-status ${trade.status}`}>
                                    {trade.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default observer(BotDetails);