import { observable, action, makeObservable, computed } from 'mobx';
import { TMainStore } from '../types';

export interface BotStrategy {
    id: string;
    name: string;
    description: string;
    category: 'trend' | 'grid' | 'arbitrage' | 'scalping' | 'dca' | 'market_making';
    riskLevel: 'low' | 'medium' | 'high';
    minBalance: number;
    parameters: BotParameter[];
    performance: {
        averageReturn: number;
        winRate: number;
        maxDrawdown: number;
        totalTrades: number;
    };
}

export interface BotParameter {
    key: string;
    name: string;
    type: 'number' | 'string' | 'boolean' | 'select' | 'range';
    defaultValue: any;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
    description: string;
    required: boolean;
}

export interface BotConfiguration {
    strategyId: string;
    name: string;
    symbol: string;
    parameters: Record<string, any>;
    riskManagement: {
        maxPositionSize: number;
        stopLoss?: number;
        takeProfit?: number;
        maxDailyLoss: number;
        maxConcurrentTrades: number;
    };
    schedule: {
        enabled: boolean;
        startTime?: string;
        endTime?: string;
        tradingDays: number[]; // 0-6 (Sunday-Saturday)
    };
}

export interface BotInstance {
    id: string;
    name: string;
    strategyId: string;
    configuration: BotConfiguration;
    status: 'running' | 'stopped' | 'paused' | 'error';
    statistics: {
        totalTrades: number;
        winningTrades: number;
        losingTrades: number;
        totalProfit: number;
        totalLoss: number;
        netProfit: number;
        winRate: number;
        profitFactor: number;
        maxDrawdown: number;
        averageWin: number;
        averageLoss: number;
    };
    performance: {
        dailyReturns: { date: string; return: number }[];
        equity: { timestamp: number; value: number }[];
        trades: BotTrade[];
    };
    createdAt: number;
    startedAt?: number;
    stoppedAt?: number;
    lastActivity: number;
    errorMessage?: string;
}

export interface BotTrade {
    id: string;
    symbol: string;
    side: 'buy' | 'sell';
    entryPrice: number;
    exitPrice?: number;
    quantity: number;
    entryTime: number;
    exitTime?: number;
    profit?: number;
    status: 'open' | 'closed' | 'cancelled';
    reason: string;
}

export interface BotSignal {
    id: string;
    botId: string;
    symbol: string;
    type: 'buy' | 'sell' | 'close';
    price: number;
    confidence: number;
    timestamp: number;
    executed: boolean;
    reason: string;
}

export default class TradingBotStore {
    mainStore: TMainStore;
    
    // Bot Strategies
    strategies: BotStrategy[] = [];
    
    // Bot Instances
    bots: BotInstance[] = [];
    
    // Bot Signals
    signals: BotSignal[] = [];
    
    // UI State
    selectedBot: BotInstance | null = null;
    showBotCreator: boolean = false;
    showBotEditor: boolean = false;
    showBacktester: boolean = false;
    selectedStrategy: BotStrategy | null = null;
    
    // Backtesting
    backtestResults: any = null;
    isBacktesting: boolean = false;
    
    constructor(mainStore: TMainStore) {
        this.mainStore = mainStore;
        makeObservable(this, {
            strategies: observable,
            bots: observable,
            signals: observable,
            selectedBot: observable,
            showBotCreator: observable,
            showBotEditor: observable,
            showBacktester: observable,
            selectedStrategy: observable,
            backtestResults: observable,
            isBacktesting: observable,
            
            // Actions
            setSelectedBot: action,
            setShowBotCreator: action,
            setShowBotEditor: action,
            setShowBacktester: action,
            setSelectedStrategy: action,
            addStrategy: action,
            createBot: action,
            updateBot: action,
            deleteBot: action,
            startBot: action,
            stopBot: action,
            pauseBot: action,
            resumeBot: action,
            addSignal: action,
            executeSignal: action,
            runBacktest: action,
            
            // Computed
            runningBots: computed,
            stoppedBots: computed,
            totalBots: computed,
            totalProfit: computed,
            recentSignals: computed,
        });
        
        this.initializeStrategies();
        this.initializeDemoBots();
    }
    
    // UI Actions
    setSelectedBot = (bot: BotInstance | null) => {
        this.selectedBot = bot;
    };
    
    setShowBotCreator = (show: boolean) => {
        this.showBotCreator = show;
    };
    
    setShowBotEditor = (show: boolean) => {
        this.showBotEditor = show;
    };
    
    setShowBacktester = (show: boolean) => {
        this.showBacktester = show;
    };
    
    setSelectedStrategy = (strategy: BotStrategy | null) => {
        this.selectedStrategy = strategy;
    };
    
    // Strategy Management
    addStrategy = (strategy: BotStrategy) => {
        this.strategies.push(strategy);
    };
    
    // Bot Management
    createBot = (configuration: BotConfiguration) => {
        const bot: BotInstance = {
            id: `bot-${Date.now()}`,
            name: configuration.name,
            strategyId: configuration.strategyId,
            configuration,
            status: 'stopped',
            statistics: {
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0,
                totalProfit: 0,
                totalLoss: 0,
                netProfit: 0,
                winRate: 0,
                profitFactor: 0,
                maxDrawdown: 0,
                averageWin: 0,
                averageLoss: 0,
            },
            performance: {
                dailyReturns: [],
                equity: [{ timestamp: Date.now(), value: 0 }],
                trades: [],
            },
            createdAt: Date.now(),
            lastActivity: Date.now(),
        };
        
        this.bots.push(bot);
        return bot;
    };
    
    updateBot = (botId: string, updates: Partial<BotInstance>) => {
        const index = this.bots.findIndex(bot => bot.id === botId);
        if (index !== -1) {
            Object.assign(this.bots[index], updates);
            this.bots[index].lastActivity = Date.now();
        }
    };
    
    deleteBot = (botId: string) => {
        this.bots = this.bots.filter(bot => bot.id !== botId);
        if (this.selectedBot?.id === botId) {
            this.selectedBot = null;
        }
    };
    
    startBot = (botId: string) => {
        this.updateBot(botId, { 
            status: 'running', 
            startedAt: Date.now(),
            errorMessage: undefined
        });
        
        // Start bot simulation
        this.simulateBotActivity(botId);
    };
    
    stopBot = (botId: string) => {
        this.updateBot(botId, { 
            status: 'stopped', 
            stoppedAt: Date.now() 
        });
    };
    
    pauseBot = (botId: string) => {
        this.updateBot(botId, { status: 'paused' });
    };
    
    resumeBot = (botId: string) => {
        this.updateBot(botId, { status: 'running' });
        this.simulateBotActivity(botId);
    };
    
    // Signal Management
    addSignal = (signal: BotSignal) => {
        this.signals.push(signal);
        
        // Keep only recent signals (last 100)
        if (this.signals.length > 100) {
            this.signals = this.signals.slice(-100);
        }
    };
    
    executeSignal = (signalId: string) => {
        const signal = this.signals.find(s => s.id === signalId);
        if (signal) {
            signal.executed = true;
            
            // Update bot statistics
            const bot = this.bots.find(b => b.id === signal.botId);
            if (bot) {
                // Simulate trade execution
                const trade: BotTrade = {
                    id: `trade-${Date.now()}`,
                    symbol: signal.symbol,
                    side: signal.type === 'buy' ? 'buy' : 'sell',
                    entryPrice: signal.price,
                    quantity: 100, // Default quantity
                    entryTime: Date.now(),
                    status: 'open',
                    reason: signal.reason,
                };
                
                bot.performance.trades.push(trade);
                bot.statistics.totalTrades++;
                this.updateBot(bot.id, { statistics: bot.statistics, performance: bot.performance });
            }
        }
    };
    
    // Backtesting
    runBacktest = async (strategyId: string, symbol: string, parameters: Record<string, any>, period: { start: number; end: number }) => {
        this.isBacktesting = true;
        
        // Simulate backtesting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const results = {
            strategy: strategyId,
            symbol,
            period,
            parameters,
            performance: {
                totalReturn: 15.67,
                annualizedReturn: 12.34,
                sharpeRatio: 1.45,
                maxDrawdown: 8.23,
                winRate: 68.5,
                totalTrades: 156,
                profitFactor: 1.78,
            },
            equity: Array.from({ length: 100 }, (_, i) => ({
                timestamp: period.start + (i * (period.end - period.start) / 100),
                value: 10000 * (1 + (Math.random() * 0.3 - 0.1) * (i / 100)),
            })),
            trades: Array.from({ length: 156 }, (_, i) => ({
                entryTime: period.start + (i * (period.end - period.start) / 156),
                exitTime: period.start + ((i + 1) * (period.end - period.start) / 156),
                profit: (Math.random() - 0.4) * 100,
                side: Math.random() > 0.5 ? 'buy' : 'sell',
            })),
        };
        
        this.backtestResults = results;
        this.isBacktesting = false;
        
        return results;
    };
    
    // Computed Properties
    get runningBots() {
        return this.bots.filter(bot => bot.status === 'running');
    }
    
    get stoppedBots() {
        return this.bots.filter(bot => bot.status === 'stopped');
    }
    
    get totalBots() {
        return this.bots.length;
    }
    
    get totalProfit() {
        return this.bots.reduce((total, bot) => total + bot.statistics.netProfit, 0);
    }
    
    get recentSignals() {
        return this.signals.slice(-10).reverse();
    }
    
    // Private Methods
    private initializeStrategies = () => {
        const strategies: BotStrategy[] = [
            {
                id: 'grid-trading',
                name: 'Grid Trading',
                description: 'Places buy and sell orders at regular intervals around current price',
                category: 'grid',
                riskLevel: 'medium',
                minBalance: 1000,
                parameters: [
                    {
                        key: 'gridSpacing',
                        name: 'Grid Spacing',
                        type: 'number',
                        defaultValue: 0.001,
                        min: 0.0001,
                        max: 0.01,
                        step: 0.0001,
                        description: 'Distance between grid levels',
                        required: true,
                    },
                    {
                        key: 'gridLevels',
                        name: 'Grid Levels',
                        type: 'number',
                        defaultValue: 10,
                        min: 3,
                        max: 50,
                        step: 1,
                        description: 'Number of grid levels',
                        required: true,
                    },
                    {
                        key: 'positionSize',
                        name: 'Position Size',
                        type: 'number',
                        defaultValue: 100,
                        min: 10,
                        max: 10000,
                        step: 10,
                        description: 'Size of each grid position',
                        required: true,
                    },
                ],
                performance: {
                    averageReturn: 12.5,
                    winRate: 75,
                    maxDrawdown: 8.2,
                    totalTrades: 1250,
                },
            },
            {
                id: 'dca-bot',
                name: 'DCA Bot',
                description: 'Dollar Cost Averaging strategy for long-term accumulation',
                category: 'dca',
                riskLevel: 'low',
                minBalance: 500,
                parameters: [
                    {
                        key: 'interval',
                        name: 'Buy Interval',
                        type: 'select',
                        defaultValue: 'daily',
                        options: ['hourly', 'daily', 'weekly', 'monthly'],
                        description: 'How often to make purchases',
                        required: true,
                    },
                    {
                        key: 'amount',
                        name: 'Purchase Amount',
                        type: 'number',
                        defaultValue: 100,
                        min: 10,
                        max: 1000,
                        step: 10,
                        description: 'Amount to purchase each interval',
                        required: true,
                    },
                    {
                        key: 'priceDeviation',
                        name: 'Price Deviation',
                        type: 'number',
                        defaultValue: 5,
                        min: 1,
                        max: 20,
                        step: 0.5,
                        description: 'Percentage deviation to trigger buy',
                        required: true,
                    },
                ],
                performance: {
                    averageReturn: 18.3,
                    winRate: 85,
                    maxDrawdown: 15.1,
                    totalTrades: 365,
                },
            },
            {
                id: 'scalping-bot',
                name: 'Scalping Bot',
                description: 'High-frequency trading for small, quick profits',
                category: 'scalping',
                riskLevel: 'high',
                minBalance: 2000,
                parameters: [
                    {
                        key: 'timeframe',
                        name: 'Timeframe',
                        type: 'select',
                        defaultValue: '1m',
                        options: ['30s', '1m', '5m'],
                        description: 'Chart timeframe for analysis',
                        required: true,
                    },
                    {
                        key: 'rsiPeriod',
                        name: 'RSI Period',
                        type: 'number',
                        defaultValue: 14,
                        min: 5,
                        max: 50,
                        step: 1,
                        description: 'RSI calculation period',
                        required: true,
                    },
                    {
                        key: 'profitTarget',
                        name: 'Profit Target',
                        type: 'number',
                        defaultValue: 0.0005,
                        min: 0.0001,
                        max: 0.01,
                        step: 0.0001,
                        description: 'Take profit level',
                        required: true,
                    },
                    {
                        key: 'stopLoss',
                        name: 'Stop Loss',
                        type: 'number',
                        defaultValue: 0.0003,
                        min: 0.0001,
                        max: 0.01,
                        step: 0.0001,
                        description: 'Stop loss level',
                        required: true,
                    },
                ],
                performance: {
                    averageReturn: 25.7,
                    winRate: 62,
                    maxDrawdown: 12.8,
                    totalTrades: 2840,
                },
            },
            {
                id: 'trend-following',
                name: 'Trend Following',
                description: 'Follows market trends using moving averages and momentum',
                category: 'trend',
                riskLevel: 'medium',
                minBalance: 1500,
                parameters: [
                    {
                        key: 'fastMA',
                        name: 'Fast MA Period',
                        type: 'number',
                        defaultValue: 20,
                        min: 5,
                        max: 100,
                        step: 1,
                        description: 'Fast moving average period',
                        required: true,
                    },
                    {
                        key: 'slowMA',
                        name: 'Slow MA Period',
                        type: 'number',
                        defaultValue: 50,
                        min: 20,
                        max: 200,
                        step: 1,
                        description: 'Slow moving average period',
                        required: true,
                    },
                    {
                        key: 'riskPercent',
                        name: 'Risk Percentage',
                        type: 'number',
                        defaultValue: 2,
                        min: 0.5,
                        max: 10,
                        step: 0.5,
                        description: 'Risk per trade as % of balance',
                        required: true,
                    },
                ],
                performance: {
                    averageReturn: 22.1,
                    winRate: 58,
                    maxDrawdown: 18.5,
                    totalTrades: 145,
                },
            },
        ];
        
        this.strategies = strategies;
    };
    
    private initializeDemoBots = () => {
        // Create some demo bots
        const gridBot = this.createBot({
            strategyId: 'grid-trading',
            name: 'EUR/USD Grid Bot',
            symbol: 'EURUSD',
            parameters: {
                gridSpacing: 0.001,
                gridLevels: 15,
                positionSize: 100,
            },
            riskManagement: {
                maxPositionSize: 1000,
                stopLoss: 0.01,
                takeProfit: 0.02,
                maxDailyLoss: 200,
                maxConcurrentTrades: 10,
            },
            schedule: {
                enabled: true,
                startTime: '09:00',
                endTime: '17:00',
                tradingDays: [1, 2, 3, 4, 5], // Monday to Friday
            },
        });
        
        // Update with some demo data
        gridBot.statistics = {
            totalTrades: 45,
            winningTrades: 32,
            losingTrades: 13,
            totalProfit: 234.56,
            totalLoss: 87.23,
            netProfit: 147.33,
            winRate: 71.1,
            profitFactor: 2.69,
            maxDrawdown: 23.45,
            averageWin: 7.33,
            averageLoss: 6.71,
        };
        
        gridBot.performance.equity = Array.from({ length: 30 }, (_, i) => ({
            timestamp: Date.now() - (29 - i) * 86400000,
            value: 10000 + (i * 5) + (Math.random() * 100 - 50),
        }));
        
        const dcaBot = this.createBot({
            strategyId: 'dca-bot',
            name: 'BTC DCA Strategy',
            symbol: 'BTCUSD',
            parameters: {
                interval: 'daily',
                amount: 50,
                priceDeviation: 3,
            },
            riskManagement: {
                maxPositionSize: 500,
                maxDailyLoss: 100,
                maxConcurrentTrades: 1,
            },
            schedule: {
                enabled: true,
                tradingDays: [0, 1, 2, 3, 4, 5, 6], // Every day
            },
        });
        
        dcaBot.statistics = {
            totalTrades: 28,
            winningTrades: 24,
            losingTrades: 4,
            totalProfit: 456.78,
            totalLoss: 123.45,
            netProfit: 333.33,
            winRate: 85.7,
            profitFactor: 3.70,
            maxDrawdown: 45.67,
            averageWin: 19.03,
            averageLoss: 30.86,
        };
        
        // Start one bot
        this.startBot(gridBot.id);
    };
    
    private simulateBotActivity = (botId: string) => {
        const bot = this.bots.find(b => b.id === botId);
        if (!bot || bot.status !== 'running') return;
        
        // Simulate periodic signals
        const generateSignal = () => {
            if (bot.status !== 'running') return;
            
            const signal: BotSignal = {
                id: `signal-${Date.now()}`,
                botId: bot.id,
                symbol: bot.configuration.symbol,
                type: Math.random() > 0.5 ? 'buy' : 'sell',
                price: 1.0850 + (Math.random() - 0.5) * 0.01,
                confidence: 60 + Math.random() * 40,
                timestamp: Date.now(),
                executed: false,
                reason: 'Grid level triggered',
            };
            
            this.addSignal(signal);
            
            // Auto-execute some signals
            if (Math.random() > 0.3) {
                setTimeout(() => this.executeSignal(signal.id), 1000 + Math.random() * 3000);
            }
            
            // Schedule next signal
            setTimeout(generateSignal, 10000 + Math.random() * 30000);
        };
        
        // Start generating signals
        setTimeout(generateSignal, 5000);
    };
}