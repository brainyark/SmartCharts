import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import './BotBacktester.scss';

interface BotBacktesterProps {
    onClose: () => void;
}

const BotBacktester: React.FC<BotBacktesterProps> = ({ onClose }) => {
    const { tradingBot } = useStores();
    const [selectedStrategy, setSelectedStrategy] = useState('');
    const [symbol, setSymbol] = useState('EURUSD');
    const [startDate, setStartDate] = useState('2024-01-01');
    const [endDate, setEndDate] = useState('2024-12-31');
    const [parameters] = useState<Record<string, any>>({});
    
    const handleRunBacktest = async () => {
        if (!selectedStrategy || !symbol) return;
        
        const period = {
            start: new Date(startDate).getTime(),
            end: new Date(endDate).getTime(),
        };
        
        await tradingBot.runBacktest(selectedStrategy, symbol, parameters, period);
    };
    
    return (
        <div className="bot-backtester">
            <div className="backtester-header">
                <h2>Strategy Backtester</h2>
                <button className="close-button" onClick={onClose}>✕</button>
            </div>
            
            <div className="backtester-content">
                <div className="backtest-form">
                    <div className="form-section">
                        <h3>Backtest Configuration</h3>
                        
                        <div className="form-group">
                            <label>Strategy</label>
                            <select 
                                value={selectedStrategy} 
                                onChange={(e) => setSelectedStrategy(e.target.value)}
                            >
                                <option value="">Select Strategy</option>
                                {tradingBot.strategies.map((strategy) => (
                                    <option key={strategy.id} value={strategy.id}>
                                        {strategy.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label>Symbol</label>
                            <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                                <option value="EURUSD">EUR/USD</option>
                                <option value="GBPUSD">GBP/USD</option>
                                <option value="USDJPY">USD/JPY</option>
                                <option value="BTCUSD">BTC/USD</option>
                            </select>
                        </div>
                        
                        <div className="date-range">
                            <div className="form-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <button 
                            className="run-backtest-button"
                            onClick={handleRunBacktest}
                            disabled={tradingBot.isBacktesting || !selectedStrategy}
                        >
                            {tradingBot.isBacktesting ? 'Running Backtest...' : 'Run Backtest'}
                        </button>
                    </div>
                </div>
                
                {tradingBot.backtestResults && (
                    <div className="backtest-results">
                        <h3>Backtest Results</h3>
                        
                        <div className="results-summary">
                            <div className="result-metric">
                                <span className="metric-label">Total Return</span>
                                <span className="metric-value">
                                    {tradingBot.backtestResults.performance.totalReturn.toFixed(2)}%
                                </span>
                            </div>
                            <div className="result-metric">
                                <span className="metric-label">Win Rate</span>
                                <span className="metric-value">
                                    {tradingBot.backtestResults.performance.winRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="result-metric">
                                <span className="metric-label">Max Drawdown</span>
                                <span className="metric-value">
                                    -{tradingBot.backtestResults.performance.maxDrawdown.toFixed(2)}%
                                </span>
                            </div>
                            <div className="result-metric">
                                <span className="metric-label">Sharpe Ratio</span>
                                <span className="metric-value">
                                    {tradingBot.backtestResults.performance.sharpeRatio.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        
                        <div className="equity-chart">
                            <h4>Equity Curve</h4>
                            <p>Equity curve visualization would be displayed here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default observer(BotBacktester);