import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStores } from 'src/store';
import { BotStrategy, BotConfiguration } from 'src/store/TradingBotStore';
import './BotCreator.scss';

interface BotCreatorProps {
    onClose: () => void;
}

const BotCreator: React.FC<BotCreatorProps> = ({ onClose }) => {
    const { tradingBot } = useStores();
    const [selectedStrategy, setSelectedStrategy] = useState<BotStrategy | null>(null);
    const [botName, setBotName] = useState('');
    const [symbol, setSymbol] = useState('EURUSD');
    const [parameters, setParameters] = useState<Record<string, any>>({});
    
    const handleCreateBot = () => {
        if (!selectedStrategy || !botName || !symbol) return;
        
        const configuration: BotConfiguration = {
            strategyId: selectedStrategy.id,
            name: botName,
            symbol,
            parameters,
            riskManagement: {
                maxPositionSize: 1000,
                stopLoss: 0.01,
                takeProfit: 0.02,
                maxDailyLoss: 200,
                maxConcurrentTrades: 5,
            },
            schedule: {
                enabled: true,
                startTime: '09:00',
                endTime: '17:00',
                tradingDays: [1, 2, 3, 4, 5],
            },
        };
        
        tradingBot.createBot(configuration);
        onClose();
    };
    
    return (
        <div className="bot-creator">
            <div className="creator-header">
                <h2>Create Trading Bot</h2>
                <button className="close-button" onClick={onClose}>✕</button>
            </div>
            
            <div className="creator-content">
                <div className="step">
                    <h3>1. Choose Strategy</h3>
                    <div className="strategies-grid">
                        {tradingBot.strategies.map((strategy) => (
                            <div
                                key={strategy.id}
                                className={`strategy-card ${selectedStrategy?.id === strategy.id ? 'selected' : ''}`}
                                onClick={() => setSelectedStrategy(strategy)}
                            >
                                <h4>{strategy.name}</h4>
                                <p>{strategy.description}</p>
                                <div className="strategy-meta">
                                    <span className={`risk-badge ${strategy.riskLevel}`}>
                                        {strategy.riskLevel} risk
                                    </span>
                                    <span className="min-balance">
                                        Min: ${strategy.minBalance}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {selectedStrategy && (
                    <div className="step">
                        <h3>2. Configure Bot</h3>
                        <div className="config-form">
                            <div className="form-group">
                                <label>Bot Name</label>
                                <input
                                    type="text"
                                    value={botName}
                                    onChange={(e) => setBotName(e.target.value)}
                                    placeholder="My Trading Bot"
                                />
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
                            
                            {selectedStrategy.parameters.map((param) => (
                                <div key={param.key} className="form-group">
                                    <label>{param.name}</label>
                                    {param.type === 'number' && (
                                        <input
                                            type="number"
                                            min={param.min}
                                            max={param.max}
                                            step={param.step}
                                            defaultValue={param.defaultValue}
                                            onChange={(e) => setParameters({
                                                ...parameters,
                                                [param.key]: parseFloat(e.target.value)
                                            })}
                                        />
                                    )}
                                    {param.type === 'select' && (
                                        <select
                                            defaultValue={param.defaultValue}
                                            onChange={(e) => setParameters({
                                                ...parameters,
                                                [param.key]: e.target.value
                                            })}
                                        >
                                            {param.options?.map((option) => (
                                                <option key={option} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <small>{param.description}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                <div className="creator-actions">
                    <button className="cancel-button" onClick={onClose}>
                        Cancel
                    </button>
                    <button 
                        className="create-button"
                        onClick={handleCreateBot}
                        disabled={!selectedStrategy || !botName || !symbol}
                    >
                        Create Bot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default observer(BotCreator);