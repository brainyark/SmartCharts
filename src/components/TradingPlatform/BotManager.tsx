import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import BotList from './BotList';
import BotCreator from './BotCreator';
import BotDetails from './BotDetails';
import BotBacktester from './BotBacktester';
import './BotManager.scss';

const BotManager: React.FC = () => {
    const { tradingBot } = useStores();
    const [activeView, setActiveView] = useState<'list' | 'create' | 'details' | 'backtest'>('list');
    
    const renderContent = () => {
        switch (activeView) {
            case 'create':
                return <BotCreator onClose={() => setActiveView('list')} />;
            case 'details':
                return tradingBot.selectedBot ? (
                    <BotDetails 
                        bot={tradingBot.selectedBot} 
                        onClose={() => setActiveView('list')} 
                    />
                ) : null;
            case 'backtest':
                return <BotBacktester onClose={() => setActiveView('list')} />;
            case 'list':
            default:
                return (
                    <BotList 
                        onCreateBot={() => setActiveView('create')}
                        onViewBot={(bot) => {
                            tradingBot.setSelectedBot(bot);
                            setActiveView('details');
                        }}
                        onBacktest={() => setActiveView('backtest')}
                    />
                );
        }
    };
    
    return (
        <div className="bot-manager">
            <div className="bot-manager__header">
                <div className="header-left">
                    <h2>Trading Bots</h2>
                    <div className="bot-stats">
                        <div className="stat-item">
                            <span className="stat-value">{tradingBot.totalBots}</span>
                            <span className="stat-label">Total Bots</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{tradingBot.runningBots.length}</span>
                            <span className="stat-label">Running</span>
                        </div>
                        <div className="stat-item">
                            <span className={`stat-value ${tradingBot.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                                ${tradingBot.totalProfit.toFixed(2)}
                            </span>
                            <span className="stat-label">Total Profit</span>
                        </div>
                    </div>
                </div>
                
                <div className="header-actions">
                    {activeView !== 'list' && (
                        <button 
                            className="back-button"
                            onClick={() => setActiveView('list')}
                        >
                            ← Back to List
                        </button>
                    )}
                    
                    {activeView === 'list' && (
                        <>
                            <button 
                                className="action-button secondary"
                                onClick={() => setActiveView('backtest')}
                            >
                                📊 Backtest
                            </button>
                            <button 
                                className="action-button primary"
                                onClick={() => setActiveView('create')}
                            >
                                + Create Bot
                            </button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="bot-manager__content">
                {renderContent()}
            </div>
            
            {/* Recent Signals Panel */}
            {activeView === 'list' && tradingBot.recentSignals.length > 0 && (
                <div className="recent-signals">
                    <h3>Recent Signals</h3>
                    <div className="signals-list">
                        {tradingBot.recentSignals.map((signal) => (
                            <div key={signal.id} className="signal-item">
                                <div className="signal-info">
                                    <span className="signal-symbol">{signal.symbol}</span>
                                    <span className={`signal-type ${signal.type}`}>
                                        {signal.type.toUpperCase()}
                                    </span>
                                    <span className="signal-price">${signal.price.toFixed(5)}</span>
                                </div>
                                <div className="signal-meta">
                                    <span className="signal-confidence">
                                        {signal.confidence.toFixed(0)}% confidence
                                    </span>
                                    <span className="signal-time">
                                        {new Date(signal.timestamp).toLocaleTimeString()}
                                    </span>
                                    <span className={`signal-status ${signal.executed ? 'executed' : 'pending'}`}>
                                        {signal.executed ? '✓' : '⏳'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default observer(BotManager);