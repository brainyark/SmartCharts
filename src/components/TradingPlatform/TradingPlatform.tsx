import React from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import TradingPanel from './TradingPanel';
import PortfolioPanel from './PortfolioPanel';
import BotManager from './BotManager';
import MarketAnalysis from './MarketAnalysis';
import './TradingPlatform.scss';

interface TradingPlatformProps {
    className?: string;
}

const TradingPlatform: React.FC<TradingPlatformProps> = ({ className = '' }) => {
    const { tradingPlatform } = useStores();
    
    const renderContent = () => {
        switch (tradingPlatform.selectedTab) {
            case 'trading':
                return <TradingPanel />;
            case 'portfolio':
                return <PortfolioPanel />;
            case 'bots':
                return <BotManager />;
            case 'analytics':
                return <MarketAnalysis />;
            default:
                return <TradingPanel />;
        }
    };
    
    return (
        <div className={`trading-platform ${className}`}>
            <div className="trading-platform__header">
                <div className="trading-platform__tabs">
                    <button
                        className={`tab-button ${tradingPlatform.selectedTab === 'trading' ? 'active' : ''}`}
                        onClick={() => tradingPlatform.setSelectedTab('trading')}
                    >
                        <div className="tab-icon">📊</div>
                        Trading
                    </button>
                    <button
                        className={`tab-button ${tradingPlatform.selectedTab === 'portfolio' ? 'active' : ''}`}
                        onClick={() => tradingPlatform.setSelectedTab('portfolio')}
                    >
                        <div className="tab-icon">💼</div>
                        Portfolio
                    </button>
                    <button
                        className={`tab-button ${tradingPlatform.selectedTab === 'bots' ? 'active' : ''}`}
                        onClick={() => tradingPlatform.setSelectedTab('bots')}
                    >
                        <div className="tab-icon">🤖</div>
                        Trading Bots
                    </button>
                    <button
                        className={`tab-button ${tradingPlatform.selectedTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => tradingPlatform.setSelectedTab('analytics')}
                    >
                        <div className="tab-icon">📈</div>
                        Analytics
                    </button>
                </div>
                
                <div className="trading-platform__account-info">
                    {tradingPlatform.selectedAccount && (
                        <>
                            <div className="account-balance">
                                <span className="label">Balance:</span>
                                <span className="value">
                                    ${tradingPlatform.selectedAccount.balance.toLocaleString()}
                                </span>
                            </div>
                            <div className="account-pnl">
                                <span className="label">P&L:</span>
                                <span className={`value ${tradingPlatform.totalPnL >= 0 ? 'positive' : 'negative'}`}>
                                    ${tradingPlatform.totalPnL.toFixed(2)} ({tradingPlatform.totalPnLPercent.toFixed(2)}%)
                                </span>
                            </div>
                            <div className={`connection-status ${tradingPlatform.isConnected ? 'connected' : 'disconnected'}`}>
                                <div className="status-dot"></div>
                                {tradingPlatform.isConnected ? 'Connected' : 'Disconnected'}
                            </div>
                        </>
                    )}
                </div>
            </div>
            
            <div className="trading-platform__content">
                {renderContent()}
            </div>
        </div>
    );
};

export default observer(TradingPlatform);