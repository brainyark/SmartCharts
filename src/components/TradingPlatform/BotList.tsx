import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { BotInstance } from 'src/store/TradingBotStore';
import './BotList.scss';

interface BotListProps {
    onCreateBot: () => void;
    onViewBot: (bot: BotInstance) => void;
    onBacktest: () => void;
}

const BotList: React.FC<BotListProps> = ({ onCreateBot, onViewBot }) => {
    const { tradingBot } = useStores();
    
    const handleStartBot = (botId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        tradingBot.startBot(botId);
    };
    
    const handleStopBot = (botId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        tradingBot.stopBot(botId);
    };
    
    const handlePauseBot = (botId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        tradingBot.pauseBot(botId);
    };
    
    const handleDeleteBot = (botId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        if (confirm('Are you sure you want to delete this bot?')) {
            tradingBot.deleteBot(botId);
        }
    };
    
    const getStatusIcon = (status: BotInstance['status']) => {
        switch (status) {
            case 'running': return '▶️';
            case 'stopped': return '⏹️';
            case 'paused': return '⏸️';
            case 'error': return '❌';
            default: return '❓';
        }
    };
    
    const getStatusColor = (status: BotInstance['status']) => {
        switch (status) {
            case 'running': return 'green';
            case 'stopped': return 'gray';
            case 'paused': return 'orange';
            case 'error': return 'red';
            default: return 'gray';
        }
    };
    
    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };
    
    if (tradingBot.bots.length === 0) {
        return (
            <div className="bot-list empty">
                <div className="empty-state">
                    <div className="empty-icon">🤖</div>
                    <h3>No Trading Bots Yet</h3>
                    <p>Create your first trading bot to start automated trading</p>
                    <button className="create-first-bot" onClick={onCreateBot}>
                        Create Your First Bot
                    </button>
                </div>
            </div>
        );
    }
    
    return (
        <div className="bot-list">
            <div className="bot-grid">
                {tradingBot.bots.map((bot) => {
                    const strategy = tradingBot.strategies.find(s => s.id === bot.strategyId);
                    
                    return (
                        <div 
                            key={bot.id} 
                            className="bot-card"
                            onClick={() => onViewBot(bot)}
                        >
                            <div className="bot-card__header">
                                <div className="bot-info">
                                    <h3 className="bot-name">{bot.name}</h3>
                                    <span className="bot-strategy">{strategy?.name || 'Unknown Strategy'}</span>
                                </div>
                                <div className="bot-status">
                                    <span 
                                        className="status-indicator"
                                        style={{ backgroundColor: getStatusColor(bot.status) }}
                                    >
                                        {getStatusIcon(bot.status)}
                                    </span>
                                    <span className="status-text">{bot.status}</span>
                                </div>
                            </div>
                            
                            <div className="bot-card__content">
                                <div className="bot-symbol">
                                    <span className="symbol">{bot.configuration.symbol}</span>
                                    <span className="risk-level">{strategy?.riskLevel || 'Unknown'} risk</span>
                                </div>
                                
                                <div className="bot-stats">
                                    <div className="stat">
                                        <span className="stat-label">Profit</span>
                                        <span className={`stat-value ${bot.statistics.netProfit >= 0 ? 'positive' : 'negative'}`}>
                                            ${bot.statistics.netProfit.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Win Rate</span>
                                        <span className="stat-value">{bot.statistics.winRate.toFixed(1)}%</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Trades</span>
                                        <span className="stat-value">{bot.statistics.totalTrades}</span>
                                    </div>
                                </div>
                                
                                <div className="bot-activity">
                                    <span className="activity-text">
                                        Last activity: {formatTimeAgo(bot.lastActivity)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="bot-card__actions">
                                {bot.status === 'stopped' && (
                                    <button 
                                        className="action-btn start"
                                        onClick={(e) => handleStartBot(bot.id, e)}
                                        title="Start Bot"
                                    >
                                        ▶️
                                    </button>
                                )}
                                
                                {bot.status === 'running' && (
                                    <>
                                        <button 
                                            className="action-btn pause"
                                            onClick={(e) => handlePauseBot(bot.id, e)}
                                            title="Pause Bot"
                                        >
                                            ⏸️
                                        </button>
                                        <button 
                                            className="action-btn stop"
                                            onClick={(e) => handleStopBot(bot.id, e)}
                                            title="Stop Bot"
                                        >
                                            ⏹️
                                        </button>
                                    </>
                                )}
                                
                                {bot.status === 'paused' && (
                                    <>
                                        <button 
                                            className="action-btn start"
                                            onClick={(e) => handleStartBot(bot.id, e)}
                                            title="Resume Bot"
                                        >
                                            ▶️
                                        </button>
                                        <button 
                                            className="action-btn stop"
                                            onClick={(e) => handleStopBot(bot.id, e)}
                                            title="Stop Bot"
                                        >
                                            ⏹️
                                        </button>
                                    </>
                                )}
                                
                                <button 
                                    className="action-btn delete"
                                    onClick={(e) => handleDeleteBot(bot.id, e)}
                                    title="Delete Bot"
                                >
                                    🗑️
                                </button>
                            </div>
                            
                            {bot.errorMessage && (
                                <div className="bot-error">
                                    <span className="error-icon">⚠️</span>
                                    <span className="error-message">{bot.errorMessage}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default observer(BotList);