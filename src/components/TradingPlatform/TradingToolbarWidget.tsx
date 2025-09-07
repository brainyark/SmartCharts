import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { TradingPlatform } from './index';
import './TradingToolbarWidget.scss';

const TradingToolbarWidget: React.FC = () => {
    const { tradingPlatform, tradingBot } = useStores();
    const [showTradingPanel, setShowTradingPanel] = useState(false);
    
    const toggleTradingPanel = () => {
        setShowTradingPanel(!showTradingPanel);
        tradingPlatform.setShowTradingPanel(!showTradingPanel);
    };
    
    return (
        <>
            {/* Trading Button in Toolbar */}
            <div className="trading-toolbar-widget">
                <button
                    className={`trading-toggle-button ${showTradingPanel ? 'active' : ''}`}
                    onClick={toggleTradingPanel}
                    title="Toggle Trading Platform"
                >
                    <div className="button-icon">💹</div>
                    <span className="button-text">Trading</span>
                    
                    {/* Status indicators */}
                    <div className="status-indicators">
                        {tradingPlatform.activePositions.length > 0 && (
                            <div className="indicator positions" title={`${tradingPlatform.activePositions.length} open positions`}>
                                {tradingPlatform.activePositions.length}
                            </div>
                        )}
                        
                        {tradingBot.runningBots.length > 0 && (
                            <div className="indicator bots" title={`${tradingBot.runningBots.length} running bots`}>
                                🤖 {tradingBot.runningBots.length}
                            </div>
                        )}
                        
                        {tradingPlatform.totalPnL !== 0 && (
                            <div className={`indicator pnl ${tradingPlatform.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                                {tradingPlatform.totalPnL >= 0 ? '+' : ''}${tradingPlatform.totalPnL.toFixed(0)}
                            </div>
                        )}
                    </div>
                </button>
                
                {/* Quick Action Buttons */}
                <div className="quick-actions">
                    <button
                        className="quick-action-btn"
                        onClick={() => {
                            setShowTradingPanel(true);
                            tradingPlatform.setSelectedTab('trading');
                        }}
                        title="Quick Buy"
                    >
                        📈
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => {
                            setShowTradingPanel(true);
                            tradingPlatform.setSelectedTab('bots');
                        }}
                        title="Bot Manager"
                    >
                        🤖
                    </button>
                    <button
                        className="quick-action-btn"
                        onClick={() => {
                            setShowTradingPanel(true);
                            tradingPlatform.setSelectedTab('portfolio');
                        }}
                        title="Portfolio"
                    >
                        💼
                    </button>
                </div>
            </div>
            
            {/* Trading Platform Overlay */}
            {showTradingPanel && (
                <div className="trading-platform-overlay">
                    <div className="overlay-backdrop" onClick={() => setShowTradingPanel(false)} />
                    <div className="trading-platform-container">
                        <div className="platform-header">
                            <h2>Advanced Trading Platform</h2>
                            <button 
                                className="close-overlay-button"
                                onClick={() => setShowTradingPanel(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="platform-content">
                            <TradingPlatform />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default observer(TradingToolbarWidget);